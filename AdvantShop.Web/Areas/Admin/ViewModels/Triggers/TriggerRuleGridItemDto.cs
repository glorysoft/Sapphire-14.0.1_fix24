using System;
using System.Linq;
using AdvantShop.Core.Common.Extensions;
using AdvantShop.Core.Services.Triggers;
using AdvantShop.Localization;

namespace AdvantShop.Web.Admin.ViewModels.Triggers
{
    public class TriggerRuleGridItemDto : TriggerRuleShortDto
    {
        public DateTime DateCreated { get; set; }
        public string DateCreatedFormatted => Culture.ConvertDate(DateCreated);
        
        public DateTime DateModified { get; set; }
        public string DateModifiedFormatted => Culture.ConvertDate(DateModified);
        
        public bool WorksOnlyOnce { get; set; }

        public string ActionTypes
        {
            get
            {
                var actions =
                    TriggerActionService.GetTriggerActionTypes(Id)
                        .Select(x => ((ETriggerActionType)x).Localize());

                return string.Join(", ", actions);
            }
        }
    }
}