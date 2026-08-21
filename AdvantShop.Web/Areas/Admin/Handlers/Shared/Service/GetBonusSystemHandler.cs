using System.Collections.Generic;
using System.Linq;
using AdvantShop.Core.Modules;
using AdvantShop.Core.Modules.Interfaces;
using AdvantShop.Core.Services.Localization;
using AdvantShop.Web.Admin.Models.Services;
using AdvantShop.Web.Infrastructure.Handlers;

namespace AdvantShop.Web.Admin.Handlers.Shared.Service
{
    public class GetBonusSystemHandler : ICommandHandler<BonusSystemModel>
    {
        private readonly string _bonusSystemKey;
        private readonly bool _partial;

        public GetBonusSystemHandler(string bonusSystemKey, bool partial)
        {
            _bonusSystemKey = bonusSystemKey;
            _partial = partial;
        }

        public BonusSystemModel Execute()
        {
            var model = new BonusSystemModel
            {
                BonusSystemKey = _bonusSystemKey,
                ShowBotton = !_partial
            };

            var bonusSystemName = LocalizationService.GetResource("Admin.Settings.System.InternalBonusSystem");
            if (!string.IsNullOrEmpty(_bonusSystemKey))
            {
                var bonusSystemModules = AttachedModules.GetModuleInstances<IBonusSystemModule>(includeInactive: true) ?? new List<IBonusSystemModule>();
                var bonusSystemModule = bonusSystemModules.FirstOrDefault(x => x.ModuleStringId  == _bonusSystemKey);
                if (bonusSystemModule != null)
                    bonusSystemName = bonusSystemModule.BonusSystemName;
                else
                    bonusSystemName = _bonusSystemKey;
            }
            
            model.BonusSystemName = bonusSystemName;
            return model;
        }
    }
}