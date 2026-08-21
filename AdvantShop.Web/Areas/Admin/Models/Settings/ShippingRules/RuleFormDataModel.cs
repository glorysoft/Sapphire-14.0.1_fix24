using System.Collections.Generic;

namespace AdvantShop.Web.Admin.Models.Settings.ShippingRules
{
    public class RuleFormDataModel
    {
        public string ActionsAndFilersSeparator { get; set; }
        public string ParametersSeparator { get; set; }
        public object ShippingTypes { get; set; }
        public List<object> ShippingMethods { get; set; }
        public List<object> Currencies { get; set; }
    }
}