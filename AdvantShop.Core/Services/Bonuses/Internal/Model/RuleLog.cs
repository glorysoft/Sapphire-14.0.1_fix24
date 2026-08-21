using System;
using AdvantShop.Core.Services.Bonuses.Internal.Model.Enums;

namespace AdvantShop.Core.Services.Bonuses.Internal.Model
{
   public class RuleLog
    {
        public Guid CardId { get; set; }
        public ERule RuleType { get; set; }
        public DateTime Created { get; set; }
        public EBonusRuleObjectType ObjectType { get; set; }
        public string ObjectId { get; set; }
    }
}
