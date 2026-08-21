using AdvantShop.Core.Services.Bonuses;

namespace AdvantShop.Core.Modules.Interfaces
{
    public interface IBonusSystemModule : IModule
    {
        string BonusSystemName { get; }
        IBonusSystem GetBonusSystem();
    }
}