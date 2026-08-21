using AdvantShop.Core.Services.Bonuses.Internal.Notification;
using System;

namespace AdvantShop.Core.Services.Bonuses.Internal.Model
{
    public class NotificationLog
    {
        public int Id { get; set; }
        public string Body { get; set; }
        public string State { get; set; }
        public string Contact { get; set; }
        public DateTime Created { get; set; }
        public EContactType ContactType { get; set; }
    }
}
