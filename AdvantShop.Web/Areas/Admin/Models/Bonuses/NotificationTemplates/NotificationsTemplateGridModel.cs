using AdvantShop.Core.Common.Extensions;
using AdvantShop.Core.Services.Bonuses.Internal;
using AdvantShop.Core.Services.Bonuses.Internal.Notification;

namespace AdvantShop.Web.Admin.Models.Bonuses.NotificationTemplates
{
    public class NotificationsTemplateGridModel
    {
        public EBonusNotificationMethod Method { private get; set; }

        public ENotifcationType Type { private get; set; }

        public string NotificationTypeName => Type.Localize();
        
        public string NotificationMethodName => Method.Localize();
        
        public string NotificationType => Type.ToString();
        
        public string NotificationMethod => Method.ToString();
        
        public string NotificationBody { get; set; }
        
        public int NotificationId { get; set; }
    }
}