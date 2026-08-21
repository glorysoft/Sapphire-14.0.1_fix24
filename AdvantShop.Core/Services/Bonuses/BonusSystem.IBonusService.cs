using AdvantShop.Customers;

namespace AdvantShop.Core.Services.Bonuses
{
    public partial class BonusSystem
    {
        // Взаимодействие с IBonusService
        
        private static IBonusService GetBonusService() => IsActive ? _getBonusSystem() as IBonusService : null;
        public static bool ImplementIBonusService => GetBonusService() != null;

        public static bool AddBonuses(Customer customer, float bonuses, string basis = null)
            => GetBonusService()?.Add(customer, bonuses, basis) ?? false;

        public static bool RemoveBonuses(Customer customer, float bonuses, string basis = null)
            => GetBonusService()?.Remove(customer, bonuses, basis) ?? false;

    }
}