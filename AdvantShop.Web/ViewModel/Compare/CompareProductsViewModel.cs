using System.Collections.Generic;
using AdvantShop.Catalog;
using AdvantShop.Configuration;
using AdvantShop.Core.Services.Catalog;
using AdvantShop.Orders;

namespace AdvantShop.ViewModel.Compare
{
    public sealed class CompareProductsViewModel
    {
        public CompareProductsViewModel(List<ShoppingCartItem> compareItems, List<Property> list)
        {
            HidePrice = SettingsCatalog.HidePrice;
            TextInsteadOfPrice = SettingsCatalog.TextInsteadOfPrice;

            DisplayBuyButton = SettingsCatalog.DisplayBuyButton && !SettingsCatalog.HidePrice;
            DisplayPreOrderButton = SettingsCatalog.DisplayPreOrderButton && !SettingsCatalog.HidePrice;
            AllowBuyOutOfStockProducts = SettingsCheckout.OutOfStockAction == eOutOfStockAction.Cart;
            AllowPreOrderOutOfStockProducts = SettingsCheckout.OutOfStockAction == eOutOfStockAction.Preorder;

            DisplayRating = SettingsCatalog.EnableProductRating;
            ShowNotAvailableLabel = SettingsCatalog.ShowNotAvaliableLable;
            
            BuyButtonText = SettingsCatalog.BuyButtonText;
            ChooseBtnText = SettingsCatalog.ChooseBtnText;
            PreOrderButtonText = SettingsCatalog.PreOrderButtonText;

            Properties = list ?? new List<Property>();
            Products = new List<CompareProductItem>();

            if (compareItems != null && compareItems.Count > 0)
            {
                foreach (var compareItem in compareItems)
                    Products.Add(new CompareProductItem(compareItem));
            }
        }
        
        public bool DisplayBuyButton { get; set; }
        public bool DisplayPreOrderButton { get; set; }
        public bool AllowBuyOutOfStockProducts { get; set; }
        public bool AllowPreOrderOutOfStockProducts { get; set; }
        
        public bool DisplayRating { get; set; }
        public bool ShowNotAvailableLabel { get; set; }

        public string BuyButtonText { get; set; }
        
        public string ChooseBtnText { get; set; }
        public string PreOrderButtonText { get; set; }

        public List<Property> Properties { get; set; }
        public List<CompareProductItem> Products { get; set; }

        public bool HidePrice { get; set; }
        public string TextInsteadOfPrice { get; set; }
    }
    
    public sealed class CompareProductItem 
    {
        private List<PropertyValue> _productPropertyValues;
        public List<PropertyValue> ProductPropertyValues =>
            _productPropertyValues ??
            (_productPropertyValues = PropertyService.GetPropertyValuesByProductId(ProductId));

        public CompareBrandModel Brand { get; private set; }
        
        public int ProductId { get; }
        
        public int OfferId { get; }
        
        public string ArtNo { get; }

        public string UrlPath { get; }

        public string Name { get; }
        
        public double Ratio { get; }

        public double? ManualRatio { get; }
        
        public bool AllowPreorder { get; }
        
        public float Multiplicity { get; }
        
        public float AmountByMultiplicity { get; }
        
        public float MinAmount { get; set; }

        public float MaxAmount { get; set; }
        
        public ProductPhoto Photo { get; }
        
        public float Price { get; }
        
        public float PriceWithDiscount { get; }
        
        public string PreparedPrice { get; }
        
        public bool AllowAddProductToCart { get; }

        public CompareProductItem(ShoppingCartItem item)
        {
            var product = item.Offer.Product;
            
            Brand = product.Brand == null
                ? null
                : new CompareBrandModel { Name = product.Brand.Name, UrlPath = product.Brand.UrlPath };
            
            ProductId = product.ProductId;
            UrlPath = product.UrlPath;
            Name = product.Name;
            Ratio = product.Ratio;
            ManualRatio = product.ManualRatio;
            

            MinAmount = product.MinAmount ?? 1;
            MaxAmount = product.MaxAmount ?? 1;
            AllowPreorder = product.AllowPreOrder;
            Multiplicity = product.Multiplicity;
            AmountByMultiplicity = product.GetMinAmount();
            
            OfferId = item.OfferId;
            ArtNo = item.ArtNo;
            Photo = item.Offer.Photo;
            Price = item.Price;
            PriceWithDiscount = item.PriceWithDiscount;

            AllowAddProductToCart =
                ProductService.AllowAddProductToCart(ProductId)
                && !CustomOptionsService.DoesProductHaveCustomOptions(ProductId);

            PreparedPrice =
                PriceFormatService.FormatPrice(
                    item.Price,
                    item.PriceWithDiscount,
                    item.Discount,
                    true,
                    true,
                    !AllowAddProductToCart,
                    SettingsCatalog.ShowUnitsInCatalog ? product.Unit.DisplayName : null);
        }
    }

    public class CompareBrandModel
    {
        public string Name { get; set; }
        public string UrlPath { get; set; }
    }
}