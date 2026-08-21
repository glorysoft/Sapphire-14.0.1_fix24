using AdvantShop.Web.Infrastructure.Admin;

namespace AdvantShop.Web.Admin.Models.Triggers
{
    public class TriggerHistoryFilterModel : BaseFilterModel
    {
        public int TriggerId { get; set; }
        
        public int? Level { get; set; }
        public int? EventType { get; set; }
    }
}
