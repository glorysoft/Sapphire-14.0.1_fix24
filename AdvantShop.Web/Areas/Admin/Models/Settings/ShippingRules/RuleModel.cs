using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using AdvantShop.Core.Services.Localization;

namespace AdvantShop.Web.Admin.Models.Settings.ShippingRules
{
    public class RuleModel : IValidatableObject
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public bool Enabled { get; set; }
        public int SortOrder { get; set; }
        
        public string EditorsParams { get; set; }
        public string FiltersParams { get; set; }
  
        public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
        {
            if (string.IsNullOrWhiteSpace(Name))
                yield return new ValidationResult(LocalizationService.GetResource("Admin.ShippingRules.Validation.NameIsNotFilledIn"));
            if (string.IsNullOrWhiteSpace(EditorsParams))
                yield return new ValidationResult(LocalizationService.GetResource("Admin.ShippingRules.Validation.EditorsParamsIsNotFilledIn"));
        }
    }
}