using AdvantShop.Catalog;
using AdvantShop.Orders;
using AdvantShop.ViewModel.Compare;

namespace AdvantShop.Handlers.Compare
{
    public sealed class CompareProductsHandler
    {
        public CompareProductsViewModel Get()
        {
            var model =
                new CompareProductsViewModel(
                    ShoppingCartService.CurrentCompare,
                    PropertyService.GetPropertyNamesByCompareCart()
                );

            return model;
        }
    }
}