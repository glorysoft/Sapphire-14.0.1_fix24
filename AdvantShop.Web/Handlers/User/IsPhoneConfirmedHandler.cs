using AdvantShop.Core.Services.Auth;
using AdvantShop.Customers;
using AdvantShop.Helpers;
using AdvantShop.Web.Infrastructure.Handlers;

namespace AdvantShop.Handlers.User
{
    public sealed class IsPhoneConfirmedHandler : ICommandHandler<bool>
    {
        private readonly long _phoneNumber;
        
        public IsPhoneConfirmedHandler(string phone)
        {
            _phoneNumber = StringHelper.ConvertToStandardPhone(phone) ?? 0;
        }
        
        public bool Execute()
        {
            return _phoneNumber != 0 
                   && new PhoneConfirmationService().IsPhoneConfirmed(_phoneNumber, CustomerContext.CustomerId);
        }
    }
}