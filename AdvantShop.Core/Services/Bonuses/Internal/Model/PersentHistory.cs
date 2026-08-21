using System;
using AdvantShop.Core.Services.Bonuses.Internal.Model.Enums;

namespace AdvantShop.Core.Services.Bonuses.Internal.Model
{
    public class PersentHistory
    {
        public int Id { get; set; }
        public  Guid CardId { get; set; }
        public string GradeName { get; set; }
        public decimal BonusPersent { get; set; }
        public DateTime CreateOn { get; set; }
        public EHistoryAction ByAction { get; set; }
    }
}
