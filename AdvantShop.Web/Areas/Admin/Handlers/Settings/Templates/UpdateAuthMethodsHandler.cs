using System;
using System.Collections.Generic;
using AdvantShop.Configuration;
using AdvantShop.Core;
using AdvantShop.Core.Services.Auth;
using AdvantShop.Web.Infrastructure.Handlers;

namespace AdvantShop.Web.Admin.Handlers.Settings.Templates
{
    public class UpdateAuthMethodsHandler : ICommandHandler
    {
        private readonly List<AuthMethod> _authMethods;
        
        public UpdateAuthMethodsHandler(List<AuthMethod> authMethods) =>
            _authMethods = authMethods;

        public void Execute()
        {
            try
            {
                SettingsAuth.AuthMethods = _authMethods;
            }
            catch (Exception)
            {
                throw new BlException("Не удалось сохранить данные");
            }
        }
    }
}