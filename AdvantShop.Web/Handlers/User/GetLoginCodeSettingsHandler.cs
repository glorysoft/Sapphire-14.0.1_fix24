using AdvantShop.Configuration;
using AdvantShop.Core.Services.Auth;
using AdvantShop.Models.User;
using AdvantShop.Web.Infrastructure.Handlers;

namespace AdvantShop.Handlers.User
{
    public sealed class GetLoginCodeSettingsHandler : ICommandHandler<LoginCodeSettingsModel>
    {
        public LoginCodeSettingsModel Execute()
        {
            return new LoginCodeSettingsModel
            {
                EnablePhoneMask = SettingsMain.EnablePhoneMask,
                CodeDescription = new PhoneConfirmationService().GetHintDescription(),
            };
        }
    }
}