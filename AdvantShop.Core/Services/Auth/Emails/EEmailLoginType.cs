using AdvantShop.Core.Common.Attributes;

namespace AdvantShop.Core.Services.Auth.Emails
{
    public enum EEmailAuthType
    {
        [Localize("Core.Auth.Emails.EmailAuthType.Password")]
        Password = 0,
        
        [Localize("Core.Auth.Emails.EmailAuthType.Code")]
        Code = 1,
    }
}