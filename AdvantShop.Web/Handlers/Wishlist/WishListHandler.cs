using AdvantShop.Catalog;
using AdvantShop.Core.Services.Catalog;
using AdvantShop.Orders;
using System.Linq;
using AdvantShop.Configuration;

namespace AdvantShop.Handlers.Catalog
{
    public sealed class WishListHandler
    {
        public ProductViewModel Get()
        {
            var wishlist = ShoppingCartService.CurrentWishlist;
            
            var products =
                ProductService.GetProductsByOfferIds(wishlist.Select(x => x.OfferId).ToList());

            foreach (var product in products)
            {
                var item = wishlist.Find(x => x.OfferId == product.OfferId);
                if (item != null)
                {
                    product.SelectedColorId = product.PreSelectedColorId = item.Offer.ColorID;
                    product.SelectedSizeId = item.Offer.SizeID;
                }
            }

            var model = new ProductViewModel(products, SettingsDesign.IsMobileTemplate)
            {
                DisplayPhotoPreviews = false
            };

            return model;
        }
    }
}