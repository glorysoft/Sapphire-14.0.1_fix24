using System;
using System.Linq;
using AdvantShop.Core;
using AdvantShop.Core.Modules;
using AdvantShop.Trial;
using AdvantShop.Web.Admin.Models.Modules;
using AdvantShop.Web.Infrastructure.Handlers;

namespace AdvantShop.Web.Admin.Handlers.Modules
{
    public class ChangeEnabledHandler : ICommandHandler<ChangeEnabledModel>
    {
        private readonly string _stringId;
        private readonly bool _enabled;

        public ChangeEnabledHandler(string stringId, bool enabled)
        {
            _stringId = stringId;
            _enabled = enabled;
        }

        public ChangeEnabledModel Execute()
        {
            if (string.IsNullOrWhiteSpace(_stringId))
                throw new BlException("Params must not be empty");

            ModulesRepository.SetActiveModule(_stringId, _enabled);

            TrialService.TrackEvent(_enabled ? TrialEvents.ActivateModule : TrialEvents.DeactivateModule, _stringId);

            if (_stringId.ToLower() == "yametrika" && _enabled)
                TrialService.TrackEvent(TrialEvents.SetUpYandexMentrika, string.Empty);

            Module module = null;

            if (Saas.SaasDataService.IsSaasEnabled)
                module = ModulesService.GetModules()
                    .Items
                    .FirstOrDefault(item => 
                        string.Equals(item.StringId, _stringId, StringComparison.OrdinalIgnoreCase)
                    );

            return new ChangeEnabledModel
            {
                SaasAndPaid = module != null && module.Price > 0f
            };
        }
    }
}