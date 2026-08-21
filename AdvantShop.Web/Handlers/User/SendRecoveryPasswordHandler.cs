using System;
using AdvantShop.Configuration;
using AdvantShop.Core;
using AdvantShop.Core.Services.Localization;
using AdvantShop.Core.Services.Mails;
using AdvantShop.Customers;
using AdvantShop.Diagnostics;
using AdvantShop.Helpers;
using AdvantShop.Mails;
using AdvantShop.Web.Infrastructure.Handlers;

namespace AdvantShop.Handlers.User
{
    public sealed class SendRecoveryPasswordHandler : ICommandHandler
    {
        private readonly string _email;
        private readonly int? _lpId;

        private Customer _customer;

        public SendRecoveryPasswordHandler(string email, int? lpId)
        {
            _email = email;
            _lpId = lpId;
        }
        
        public void Execute()
        {
            Load();
            Validate();
            Process();
        }

        private void Load()
        {
            _customer = CustomerService.GetCustomerByEmail(_email);
        }

        private void Validate()
        {
            if (_customer == null)
                throw new BlException(LocalizationService.GetResource("User.SendRecoveryPassword.CustomerError"));
        }

        private void Process()
        {
            try
            {
                var recoveryCode =
                    ValidationHelper.DeleteSigns(
                        SecurityHelper.GetPasswordHash(!string.IsNullOrWhiteSpace(_customer.Password)
                            ? _customer.Password
                            : _customer.EMail));

                var link = $"{SettingsMain.SiteUrl}/recoveryPassword?email={_customer.EMail}&recoverycode={recoveryCode}&lpId={_lpId}";

                var mail = new PwdRepairMailTemplate(recoveryCode.ToLower(), _customer.EMail, link);

                MailService.SendMailNow(_customer.Id, _customer.EMail, mail);
            }
            catch (Exception ex)
            {
                Debug.Log.Error(ex);
                throw new BlException(LocalizationService.GetResource("User.SendRecoveryPassword.SendError"));
            }
        }
    }
}