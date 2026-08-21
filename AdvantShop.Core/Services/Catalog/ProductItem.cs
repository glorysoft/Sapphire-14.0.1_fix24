using System.Collections.Generic;
using AdvantShop.Catalog;
using AdvantShop.Configuration;
using AdvantShop.Customers;
using AdvantShop.Saas;

namespace AdvantShop.Core.Services.Catalog
{
    public class ProductItem
    {
        public int ProductId { get; }

        public int OfferId { get; }
        
        public string ArtNo { get; }

        public string OfferArtNo { get; }

        public string UrlPath { get; }

        public string Name { get; }

        public string BriefDescription { get; }

        public float Multiplicity { get; }

        public float AmountOffer { get; }
        
        public float Amount { get; }

        public float AmountByMultiplicity { get; }

        public float MinAmount { get; }

        public float? MaxAmount { get; }

        public bool AllowPreorder { get; }

        public bool Recomend { get; }

        public bool Sales { get; }

        public bool Bestseller { get; }

        public bool New { get; }

        public bool Gifts { get; }

        public bool Enabled { get; }

        public string Colors { get; }

        public List<ProductColorModel> ColorsList { get; }

        public int ColorId { get; }

        public int? SelectedColorId { get; }
        
        public int? PreSelectedColorId { get; }

        public int? SelectedSizeId { get; }

        public int SizeId { get; }

        public double Ratio { get; }

        public double? ManualRatio { get; }

        public int? RatioId { get; }

        public float BasePrice { get; }

        public float Discount { get; }
        public float DiscountAmount { get; }

        public int Comments { get; }

        public float CurrencyValue { get; }
        
        public bool DoNotApplyOtherDiscounts { get; }
        
        public int? MainCategoryId { get; }
        
        public bool MultiPrices { get; }

        public string BarCode { get; }


        public ProductPhoto Photo { get; }
        
        public string StartPhotoJson { get; }

        public string PhotoSmall { get; }

        public string PhotoMiddle { get; }

        public string PhotoBig { get; }

        public int PhotoId { get; }

        public int CountPhoto { get; }

        public string UnitDisplayName { get; set; }
        public string UnitName { get; set; }


        private List<ProductDiscount> ProductDiscounts { get; }
        private float DiscountByDatetime { get; }
        private CustomerGroup CustomerGroup { get; }
        
        private readonly OfferPriceRule _priceRule;
        public OfferPriceRule PriceRule => _priceRule;
        
        private readonly float? _priceByPriceRule;
        
        /// <summary>
        /// Старая цена (перечеркнутая, цена без скидки)
        /// </summary>
        public float RoundedPrice { get; private set; }
        
        /// <summary>
        /// Новая цена (цена со скидкой)
        /// </summary>
        public float PriceWithDiscount { get; private set; }
        
        public Discount TotalDiscount { get; private set; }
        
        private string _preparedPrice;

        public string PreparedPrice =>
            _preparedPrice ??
            (_preparedPrice =
                PriceFormatService.FormatPrice(
                    RoundedPrice,
                    PriceWithDiscount,
                    TotalDiscount,
                    true,
                    true,
                    MultiPrices,
                    SettingsCatalog.ShowUnitsInCatalog ? UnitDisplayName : null)
            );
        
        private bool? _allowAddProductToCart;

        public bool AllowAddProductToCart
        {
            get =>
                _allowAddProductToCart ??
                (_allowAddProductToCart =
                    ProductService.AllowAddProductToCart(ProductId)
                    && !CustomOptionsService.DoesProductHaveCustomOptions(ProductId)).Value;
            
            set => _allowAddProductToCart = value;
        }
        
        public float GetMinAmount(ProductItem product) => product.GetMinAmount();

        public List<string> Labels { get; set; }

        public ProductItem(ProductModel product, float discountByDatetime, List<ProductDiscount> productDiscounts) 
                    : this(product, 
                        CustomerContext.CurrentCustomer.CustomerGroup, 
                        discountByDatetime, 
                        productDiscounts,
                        priceRulesActive: !SaasDataService.IsSaasEnabled || SaasDataService.CurrentSaasData.PriceTypes,
                        null)
        {
            
        }

        public ProductItem(ProductModel product, CustomerGroup customerGroup, 
                            float discountByDatetime, List<ProductDiscount> productDiscounts,
                            bool priceRulesActive, List<string> labels)
        {
            ProductId = product.ProductId;
            OfferId = product.OfferId;
            OfferArtNo = product.OfferArtNo;
            AmountOffer = product.AmountOffer;
            UrlPath = product.UrlPath;
            Name = product.Name;
            BriefDescription = product.BriefDescriptionFormatted;
            ArtNo = product.ArtNo;
            Multiplicity = product.Multiplicity;
            Amount = product.Amount;
            AmountByMultiplicity = product.AmountByMultiplicity;
            MinAmount = product.MinAmount;
            MaxAmount = product.MaxAmount;
            AllowPreorder = product.AllowPreorder;
            Recomend = product.Recomend;
            Sales = product.Sales;
            Bestseller = product.Bestseller;
            New = product.New;
            Gifts = product.Gifts;
            Enabled = product.Enabled;
            Colors = product.Colors;
            ColorsList = product.ColorsList;
            ColorId = product.ColorId;
            SizeId = product.SizeId;
            SelectedColorId = product.SelectedColorId;
            PreSelectedColorId = product.PreSelectedColorId;
            SelectedSizeId = product.SelectedSizeId;
            Ratio = product.Ratio;
            ManualRatio = product.ManualRatio;
            RatioId = product.RatioId;
            Comments = product.Comments;
            BarCode = product.BarCode;
            
            BasePrice = product.BasePrice;
            Discount = product.Discount;
            DiscountAmount = product.DiscountAmount;
            CurrencyValue = product.CurrencyValue;
            DoNotApplyOtherDiscounts = product.DoNotApplyOtherDiscounts;
            MultiPrices = product.MultiPrices;
            MainCategoryId = product.MainCategoryId;
            
            Photo = product.Photo;
            StartPhotoJson = product.StartPhotoJson;
            PhotoSmall = product.PhotoSmall;
            PhotoMiddle = product.PhotoMiddle;
            PhotoBig = product.PhotoBig;
            PhotoId = product.PhotoId;
            CountPhoto = product.CountPhoto;
            
            CustomerGroup = customerGroup;
            DiscountByDatetime = discountByDatetime;
            ProductDiscounts = productDiscounts;
            UnitDisplayName = product.UnitDisplayName;
            UnitName = product.UnitName;
            
            if (product.AllowAddToCartInCatalog != null)
                AllowAddProductToCart = product.AllowAddToCartInCatalog.Value;
            
            Labels = labels;

            if (priceRulesActive)
            {
                var amount = MinAmount == 0
                    ? Multiplicity
                    : Multiplicity > MinAmount ? Multiplicity : MinAmount;

                _priceRule = PriceRuleService.GetPriceRule(OfferId, amount, CustomerGroup.CustomerGroupId);

                if (_priceRule?.PriceByRule != null)
                    _priceByPriceRule = _priceRule.PriceByRule.Value.RoundPrice(CurrencyValue);
            }

            CalculatePrice();
        }

        private void CalculatePrice()
        {
            RoundedPrice = PriceService.RoundPrice(BasePrice, null, CurrencyValue);

            if (_priceRule == null || _priceByPriceRule == null)
            {
                TotalDiscount = GetDiscount(RoundedPrice);
                PriceWithDiscount = PriceService.GetFinalPrice(RoundedPrice, TotalDiscount);
            }
            else
            {
                // выбираем между ценой по типу и ценой модификации большую
                var oldPrice = _priceByPriceRule > RoundedPrice ? _priceByPriceRule.Value : RoundedPrice;

                if (_priceRule.ApplyDiscounts)
                {
                    // считаем скидку и цену по типу цены
                    var discount = GetDiscount(_priceByPriceRule.Value);
                    var priceWithDiscount = PriceService.GetFinalPrice(_priceByPriceRule.Value, discount);
                    
                    // пересчитываем скидку от большей цены 
                    TotalDiscount = new Discount(0, oldPrice - priceWithDiscount);
                    PriceWithDiscount = PriceService.GetFinalPrice(oldPrice, TotalDiscount);
                }
                else
                {
                    TotalDiscount = new Discount(0, oldPrice - _priceByPriceRule.Value);
                    PriceWithDiscount = _priceByPriceRule.Value;
                }

                RoundedPrice = oldPrice;
            }
        }
        
        private Discount GetDiscount(float price) =>
            PriceService.GetFinalDiscount(
                price,
                Discount,
                DiscountAmount,
                CurrencyValue,
                CustomerGroup,
                ProductId,
                DiscountByDatetime,
                ProductDiscounts,
                DoNotApplyOtherDiscounts,
                productMainCategoryId: MainCategoryId);
    }
}