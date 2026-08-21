namespace AdvantShop.Core.Modules.Interfaces
{
    public interface IMarketplaceModule
    {
        ModuleRoute GetProductButtonRoute(int productId, int? offerId = null, bool isAdminArea = false, string ngModelOfferId = null);
        bool IsHaveProductButton(int productId, bool isAdminArea = false);
    }
}