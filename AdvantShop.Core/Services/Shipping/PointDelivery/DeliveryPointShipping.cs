using System.Collections.Generic;

namespace AdvantShop.Shipping.PointDelivery
{
    public class DeliveryPointShipping : BaseShippingPoint
    {
        public List<int> NotAvailablePayments { get; set; }
        public bool Available { get; set; } =  true;
    }
}
