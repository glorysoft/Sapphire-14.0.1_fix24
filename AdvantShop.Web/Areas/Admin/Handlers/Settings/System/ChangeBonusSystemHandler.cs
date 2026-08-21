using System.Collections.Generic;
using AdvantShop.Configuration;
using AdvantShop.Core.Modules;
using AdvantShop.Core.Modules.Interfaces;
using AdvantShop.Web.Infrastructure.Handlers;

namespace AdvantShop.Web.Admin.Handlers.Settings.System
{
    public class ChangeBonusSystemHandler : ICommandHandler
    {
        private readonly string _bonusSystemKey;

        public ChangeBonusSystemHandler(string bonusSystemKey)
        {
            _bonusSystemKey = bonusSystemKey;
        }

        public void Execute()
        {
            if (string.IsNullOrEmpty(_bonusSystemKey))
            {
                SettingsMain.ActiveBonusSystemModule = _bonusSystemKey;
            }
            else
            {
                var bonusSystemModules = (AttachedModules.GetModuleInstances<IBonusSystemModule>(includeInactive: true) ?? new List<IBonusSystemModule>());
                var selectedBonusSystemModule = bonusSystemModules.Find(x => x.ModuleStringId == _bonusSystemKey);

                SettingsMain.ActiveBonusSystemModule = selectedBonusSystemModule != null
                    ? selectedBonusSystemModule.ModuleStringId
                    : string.Empty; // внутренняя бонусная
            }
        }
    }
}