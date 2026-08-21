using System.Collections.Generic;

namespace AdvantShop.Shipping.ApiShip
{
    public class CalculateOption
    {
        public List<Extra> Extra { get; set; }
        public string ProviderKey { get; set; }
    }
    
    public class Extra
    {
        public string Key { get; set; }
        public string Value { get; set; }
    }
}