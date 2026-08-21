using AdvantShop.Core.Common.Attributes;

namespace AdvantShop.Core.Services.Auth
{
    public enum ECheckoutLoginDisplayMode
    {
        [Enabled(true)]
        [Localize("Core.Auth.ECheckoutLoginDisplayMode.Page")]
        Page = 0,
        
        [Enabled(false)]
        [Localize("Core.Auth.ECheckoutLoginDisplayMode.Inside")]
        Inside = 1,
        
        [Enabled(true)]
        [Localize("Core.Auth.ECheckoutLoginDisplayMode.Default")]
        Default = 2,
        
        [Enabled(true)]
        [Localize("Core.Auth.ECheckoutLoginDisplayMode.Modal")]
        Modal = 3,
    }
}