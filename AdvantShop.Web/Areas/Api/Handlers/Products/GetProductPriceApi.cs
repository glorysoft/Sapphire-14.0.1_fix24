using System.Collections.Generic;
using System.Linq;
using AdvantShop.Areas.Api.Models.Products;
using AdvantShop.Catalog;
using AdvantShop.Configuration;
using AdvantShop.Core;
using AdvantShop.Core.Services.Bonuses;
using AdvantShop.Core.Services.Bonuses.Internal;
using AdvantShop.Core.Services.Catalog;
using AdvantShop.Customers;
using AdvantShop.Repository.Currencies;
using AdvantShop.Web.Infrastructure.Handlers;

namespace AdvantShop.Areas.Api.Handlers.Products
{
    public sealed class GetProductPriceApi : AbstractCommandHandler<GetProductPriceResponse>
    {
        private readonly int _productId;
        private readonly GetPriceModel _model;
        
        private Product _product;
        private Offer _offer;
        private IList<CustomOption> _customOptions;
        private readonly float? _productCurrencyValue;
        private readonly string _unit;

        public GetProductPriceApi(int id, GetPriceModel model)
        {
            _productId = id;
            _model = model;
        }
        
        public GetProductPriceApi(
            Product product, 
            Offer offer, 
            IList<CustomOption> customOptions, 
            List<SelectedCustomOptionApi> options, 
            float amount,
            float? productCurrencyValue,
            string unit)
        {
            _product = product;
            _productId = product.ProductId;
            _offer = offer;
            _customOptions = customOptions;
            _productCurrencyValue = productCurrencyValue;
            _unit = unit;

            _model = new GetPriceModel()
            {
                OfferId = offer.OfferId,
                Options = options,
                Amount = amount
            };
        }
        
        protected override void Load()
        {
            if (_model == null)
                throw new BlException("Не указан offerId");
            
            if (_model != null && _model.Amount <= 0)
                throw new BlException("Не указано кол-во");
            
            if (_offer == null)
            {
                if (_model.OfferId == 0)
                    throw new BlException("Не указан offerId");

                _offer = OfferService.GetOffer(_model.OfferId);
                
                if (_offer == null)
                    throw new BlException("Неправильный offerId");
                
                _product = _offer.Product;
                _customOptions = CustomOptionsService.GetCustomOptionsByProductIdCached(_productId);
            }
            
            // set default required options
            if (_model.Options == null && _customOptions != null)
            {
                _model.Options = new List<SelectedCustomOptionApi>();
                
                foreach (var customOption in _customOptions.Where(x => x.IsRequired && x.SelectedOptions != null))
                {
                    _model.Options.Add(new SelectedCustomOptionApi()
                    {
                        Id = customOption.CustomOptionsId,
                        OptionItems = 
                            customOption.SelectedOptions
                                .Select(x => new SelectedCustomOptionItemApi()
                                {
                                    OptionId = x.OptionId, 
                                    Amount = x.DefaultQuantity
                                }).ToList()
                    });
                }
            }
        }

        protected override void Validate()
        {
            if (_offer == null)
                throw new BlException("Товар не найден");
        }

        protected override GetProductPriceResponse Handle()
        {
            var customer = CustomerContext.CurrentCustomer;
            
            return GetPrice(_offer, _product, _model.Options, customer);
        }
        
        private GetProductPriceResponse GetPrice(Offer offer, Product product, List<SelectedCustomOptionApi> options, Customer customer)
        {
            if (SettingsCatalog.HidePrice)
                return new GetProductPriceResponse(SettingsCatalog.TextInsteadOfPrice);
            
            var offerRoundedPrice = offer.GetPriceBeforePriceRule() ?? offer.RoundedPrice;
            
            if (offer.PriceRule == null)
                _offer.SetPriceRule(_model.Amount, customer.CustomerGroupId);
            
            float oldPrice, newPrice;
            Discount finalDiscount;
            
            var customOptionsPrice = GetOptionsPrice(options, offer.RoundedPrice);

            var price = (offer.RoundedPrice + customOptionsPrice).RoundPrice(CurrencyService.CurrentCurrency.Rate);
            var discount =
                PriceService.GetFinalDiscount(
                    price,
                    product.Discount,
                    _productCurrencyValue ?? product.Currency.Rate,
                    customer.CustomerGroup,
                    product.ProductId,
                    doNotApplyOtherDiscounts: product.DoNotApplyOtherDiscounts,
                    productMainCategoryId: product.CategoryId);
            
            if (offer.PriceRule == null)
            {
                finalDiscount = discount;
                oldPrice = price;
                newPrice = PriceService.GetFinalPrice(price, finalDiscount);
            }
            else
            {
                var offerPrice = (offerRoundedPrice + customOptionsPrice).RoundPrice(CurrencyService.CurrentCurrency.Rate);

                // выбираем между ценой по типу и ценой модификации большую
                oldPrice = price > offerPrice ? price : offerPrice;

                if (offer.PriceRule.ApplyDiscounts)
                {
                    // считаем скидку и цену по типу цены
                    var priceWithDiscount = PriceService.GetFinalPrice(price, discount);

                    // пересчитываем скидку от большей цены 
                    finalDiscount = new Discount(0, oldPrice - priceWithDiscount);
                    newPrice = PriceService.GetFinalPrice(oldPrice, finalDiscount);
                }
                else
                {
                    finalDiscount = new Discount(0, oldPrice - price);
                    newPrice = price;
                }
            }
            
            var bonusPlus = GetBonusPlus(offer, customer, newPrice, oldPrice, finalDiscount);
            
            var response = new GetProductPriceResponse(
            
                oldPrice: finalDiscount.HasValue ? oldPrice : default(float?),
                price: newPrice,
                bonuses: bonusPlus,
                discount: new ProductDiscountApi(finalDiscount),
                unit: SettingsCatalog.ShowUnitsInCatalog ? _unit ?? product.Unit?.DisplayName : null
            );

            return response;
        }

        private float GetOptionsPrice(List<SelectedCustomOptionApi> options, float price)
        {
            if (_customOptions == null)
                return 0;
            
            if (options == null || options.Count == 0)
                return 0;

            float fixedPrice = 0;
            float percentPrice = 0;

            foreach (var option in _customOptions)
            {
                var selectedOption = options.Find(x => x.Id == option.CustomOptionsId);
                if (selectedOption == null)
                    continue;
                
                selectedOption.ConvertOptionsToOptionItems();

                foreach (var item in option.Options)
                {
                    var selectedOptionItems = selectedOption.OptionItems?.Where(x => x.OptionId == item.OptionId).ToList();
                    if (selectedOptionItems == null || selectedOptionItems.Count == 0)
                        continue;

                    foreach (var selectedOptionItem in selectedOptionItems)
                    {
                        var optionAmount = selectedOptionItem.Amount ?? item.DefaultQuantity ?? 1;
                        var optionPrice = item.BasePrice * optionAmount;

                        switch (item.PriceType)
                        {
                            case OptionPriceType.Fixed:
                                fixedPrice += optionPrice;
                                break;

                            case OptionPriceType.Percent:
                                percentPrice += price * optionPrice * 0.01F;
                                break;
                        }
                    }
                }
            }

            return (fixedPrice + percentPrice);
        }

        private string GetBonusPlus(Offer offer, Customer customer, float newPrice, float oldPrice, Discount totalDiscount)
        {
            if (!BonusSystem.IsActive || !offer.Product.AccrueBonuses || offer.RoundedPrice == 0) 
                return null;

            var purchase = new Purchase()
            {
                Currency = CurrencyService.CurrentCurrency,
                Items = new List<ItemOfPurchase>
                {
                    new ItemOfPurchase()
                    {
                        Code = offer.ArtNo,
                        Price = newPrice,
                        BasePrice = oldPrice,
                        Amount = 1,
                        ApplyDiscounts = !offer.Product.DoNotApplyOtherDiscounts,
                        AccrueBonuses = offer.Product.AccrueBonuses,
                    }
                }
            };

            var accrueBonuses = BonusSystem.GetAccrueBonuses(purchase, customer);
            var bonusPlus = accrueBonuses > 0 
                ? PriceFormatService.RenderBonusPrice(accrueBonuses, true) 
                : null;

            if (accrueBonuses == 0
                && BonusSystem.IsInternal)
            {
                var bonusCard = InternalBonusSystemService.GetCard(customer.Id);
                if (bonusCard != null
                    && bonusCard.Blocked)
                    return null;

                if (bonusCard is null
                    && InternalBonusSystem.BonusFirstPercent != 0)
                    return PriceFormatService.RenderBonusPrice((float) InternalBonusSystem.BonusFirstPercent, newPrice,
                        totalDiscount, true);
            }

            return bonusPlus;
        }
    }
}