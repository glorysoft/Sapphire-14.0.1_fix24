using AdvantShop.Configuration;
using AdvantShop.Core;
using AdvantShop.Core.Services.Landing;
using AdvantShop.Core.Services.Localization;
using AdvantShop.Customers;
using AdvantShop.Helpers;
using AdvantShop.Models.User;
using AdvantShop.Web.Infrastructure.Handlers;

namespace AdvantShop.Handlers.User
{
    public sealed class RecoveryPasswordHandler : ICommandHandler<RecoveryPasswordModel>
    {
        private readonly string _email;
        private readonly string _recoveryCode;
        private readonly int? _lpId;
        
        private Customer _customer;
        private string _recoveryHash;

        private RecoveryPasswordModel _model;

        public RecoveryPasswordHandler(string email, string recoveryCode, int? lpId)
        {
            _email = email;
            _recoveryCode = recoveryCode;
            _lpId = lpId;
        }

        public RecoveryPasswordModel Execute()
        {
            Load();
            Validate();
            Process();

            return _model;
        }

        private void Load()
        {
            if (!string.IsNullOrEmpty(_email))
                _customer = CustomerService.GetCustomerByEmail(_email);
            
            if (!string.IsNullOrEmpty(_recoveryCode) && _customer != null)
                _recoveryHash = ValidationHelper.DeleteSigns(
                    SecurityHelper.GetPasswordHash(
                        !string.IsNullOrWhiteSpace(_customer.Password)
                            ? _customer.Password
                            : _customer.EMail));
        }

        private void Validate()
        {
            if (CustomerContext.CurrentCustomer.RegistredUser
                || CustomerContext.CurrentCustomer.CustomerRole != Role.Guest)
                throw new BlException(LocalizationService.GetResource("User.RecoveryPassword.TheUserIsLoggedIn"));
            
            if (string.IsNullOrEmpty(_email) || string.IsNullOrEmpty(_recoveryCode))
                throw new BlException(LocalizationService.GetResource("User.RecoveryPassword.FieldsError"));
            
            if (_customer == null)
                throw new BlException(LocalizationService.GetResource("User.RecoveryPassword.FieldsError"));
            
            if (string.IsNullOrEmpty(_recoveryHash) || !_recoveryHash.ToLower().Equals(_recoveryCode.ToLower()))
                throw new BlException(LocalizationService.GetResource("User.RecoveryPassword.FieldsError"));
        }

        private void Process()
        {
            if (_lpId != null)
            {
                var lp = new LpService().Get(_lpId.Value);
                if (lp != null)
                {
                    LpService.CurrentLanding = lp;
                    SettingsDesign.IsMobileTemplate = false;
                }
            }

            _model = new RecoveryPasswordModel
            {
                Email = _email,
                RecoveryCode = _recoveryCode,
                LpId = _lpId,
            };
        }
    }
}