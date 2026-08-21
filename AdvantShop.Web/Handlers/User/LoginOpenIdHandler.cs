using System;
using AdvantShop.Customers;
using AdvantShop.Security.OAuth;
using AdvantShop.Web.Infrastructure.Handlers;

namespace AdvantShop.Handlers.User
{
    public sealed class LoginOpenIdHandler : ICommandHandler<string>
    {
        private readonly string _code;
        private readonly string[] _stateParam;
        private readonly string _redirectTo;

        // Формат state описан в классе OAuth
        // Представляет собой массив [Тип OAuth, Обратный url, Guid пользователя]

        public LoginOpenIdHandler(string code, string state)
        {
            _code = code;
            _stateParam = string.IsNullOrWhiteSpace(state) 
                ? Array.Empty<string>()
                : state.Split(new[] { ',' }, StringSplitOptions.RemoveEmptyEntries);
            _redirectTo = _stateParam != null && _stateParam.Length != 3 && string.IsNullOrWhiteSpace(_stateParam[1]) 
                ? "/" 
                : _stateParam[1];
        }

        public string Execute()
        {
            if (_stateParam.Length != 3 || 
                (_stateParam.Length == 3 
                 && !string.Equals(_stateParam[2], CustomerContext.CurrentCustomer.Id.ToString())))
                return _redirectTo;

            switch (_stateParam[0])
            {
                case "vk":
                    VkOAuth.Login(_code, string.Empty);
                    break;
                case "ok":
                    OkOAuth.Login(_code, string.Empty);
                    break;
                case "google":
                    GoogleOAuth.Login(_code, string.Empty);
                    break;
                case "mail":
                    MailOAuth.Login(_code, string.Empty);
                    break;
                case "yandex": 
                    YandexOAuth.Login(_code, string.Empty);
                    break;
                case "fb":
                    FacebookOAuth.Login(_code, string.Empty);
                    break;
            }
            
            return _redirectTo;
        }
    }
}