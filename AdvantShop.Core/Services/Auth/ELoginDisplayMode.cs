using AdvantShop.Core.Common.Attributes;

namespace AdvantShop.Core.Services.Auth
{
    public enum ELoginDisplayMode
    {
        [Localize("Core.Auth.ELoginDisplayMode.Page")]
        Page = 0,
        [Localize("Core.Auth.ELoginDisplayMode.Modal")]
        Modal = 1,
    }
}