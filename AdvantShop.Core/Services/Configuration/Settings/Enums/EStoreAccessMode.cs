using AdvantShop.Core.Common.Attributes;

namespace AdvantShop.Core.Services.Configuration.Settings.Enums
{
    public enum EStoreAccessMode
    {
        [Localize("Core.Configuration.StoreAccessMode.All")]
        All,
        [Localize("Core.Configuration.StoreAccessMode.AuthenticatedCustomer")]
        AuthenticatedCustomer,
        [Localize("Core.Configuration.StoreAccessMode.NoOne")]
        NoOne
    }
}