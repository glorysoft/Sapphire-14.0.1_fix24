using AdvantShop.Configuration;
using AdvantShop.Core.Services.Auth;
using AdvantShop.Models.User;
using AdvantShop.Web.Infrastructure.Handlers;

namespace AdvantShop.Handlers.User
{
    public sealed class InitCodeConfirmationHandler : ICommandHandler<InitCodeConfirmationModel>
    {
        public InitCodeConfirmationModel Execute()
        {
            return new InitCodeConfirmationModel
            {
                Type = SettingsAuth.AuthByCodeMethod.ToString(),
                Description = new PhoneConfirmationService().GetHintDescription()
            };
        }
    }
}