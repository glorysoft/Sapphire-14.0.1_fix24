using AdvantShop.Customers;

namespace AdvantShop.Core.Modules.Interfaces
{
    public interface IOnAuthorization
    {
        void CustomerSignIn(Customer customer);
    }
}