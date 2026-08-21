using System;

namespace AdvantShop.Web.Admin.Models.Triggers
{
    public class TriggerStatisticsGraphQueryModel
    {
        public int TriggerId { get; set; }
        public DateTime DateFrom { get; set; }
        public DateTime DateTo { get; set; }
    }
}