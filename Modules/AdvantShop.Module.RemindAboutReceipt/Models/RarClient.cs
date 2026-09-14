using System;

namespace AdvantShop.Module.RemindAboutReceipt.Models
{
    public class RarClient
    {
        public int Id { get; set; }

        public string Email { get; set; }

        public int ProductId { get; set; }

        public string ProductOfferId { get; set; }

        public bool SendNotification { get; set; }

        public int? LeadId { get; set; }

        public string ProductName
        {
            get
            {
                return Service.ModuleService.GetProductName(ProductId);
            }
        }

        public Guid? CustomerId
        {
            get
            {
                var customerId = Service.ModuleService.GetCustomerId(Email);
                return customerId != new Guid() ? customerId : (Guid?)null;
            }
        }

        public string LeadTitle
        {
            get
            {
                return LeadId.HasValue && LeadId.Value > 0 ? Service.ModuleService.GetLeadTitle(LeadId.Value) : "-";
            }
        }
    }
}
