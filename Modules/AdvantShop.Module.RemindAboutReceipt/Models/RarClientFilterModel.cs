using AdvantShop.Web.Infrastructure.Admin;

namespace AdvantShop.Module.RemindAboutReceipt.Models
{
    public class RarClientFilterModel : BaseFilterModel
    {
        public int Id { get; set; }

        public string Email { get; set; }
    }
}
