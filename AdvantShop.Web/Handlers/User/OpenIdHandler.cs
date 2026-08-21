using AdvantShop.Configuration;
using AdvantShop.ViewModel.User;
using AdvantShop.Web.Infrastructure.Handlers;

namespace AdvantShop.Handlers.User
{
    public sealed class OpenIdHandler : ICommandHandler<OpenIdViewModel>
    {
        private readonly string _redirectTo;

        public OpenIdHandler(string redirectTo)
        {
            _redirectTo = redirectTo;
        }

        public OpenIdViewModel Execute()
        {
            return new OpenIdViewModel
            {
                DisplayFacebook = SettingsOAuth.FacebookActive,
                DisplayGoogle = SettingsOAuth.GoogleActive,
                DisplayMailRu = SettingsOAuth.MailActive,
                DisplayOdnoklassniki = SettingsOAuth.OdnoklassnikiActive,
                DisplayVk = SettingsOAuth.VkontakteActive,
                DisplayVkId = SettingsOAuth.VkIdActive,
                DisplayYandex = SettingsOAuth.YandexActive,
                PageToRedirect = _redirectTo,
            };
        }
    }
}