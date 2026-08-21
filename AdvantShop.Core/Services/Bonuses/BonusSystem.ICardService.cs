using AdvantShop.Customers;

namespace AdvantShop.Core.Services.Bonuses
{
    public partial class BonusSystem
    {
        // Взаимодействие с ICardService
        
        private static ICardService GetCardService() => IsActive ? _getBonusSystem() as ICardService : null;
        public static bool ImplementICardService => GetCardService() != null;

        public static Card GetCard(Customer customer)
            => GetCardService()?.Get(customer);

        public static Card GetCardByNumber(string number)
            => GetCardService()?.Get(number);

        public static Card CreateCard(Customer customer)
            => GetCardService()?.Create(customer);

        public static bool DeleteCard(Customer customer)
            => GetCardService()?.Delete(customer) ?? false;
    }
}