using AdvantShop.Repository;

namespace AdvantShop.Module.ShippingPaymentPage.Models
{
    public class ShippingPaymentModel
    {
        public IpZone Zone { get; set; }
        public string TextBlock { get; set; }
        public string TextBlockBottom { get; set; }
    }
}
