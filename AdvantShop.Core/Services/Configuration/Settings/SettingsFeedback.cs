using AdvantShop.Core.Common.Extensions;

namespace AdvantShop.Configuration
{
    public enum EnFeedbackAction
    {
        SendEmail,
        CreateLead,
    }

    public class SettingsFeedback
    {
        public static EnFeedbackAction FeedbackAction
        {
            get => SettingProvider.Items["FeedbackAction"]?.TryParseEnum<EnFeedbackAction>() ?? EnFeedbackAction.CreateLead;
            set => SettingProvider.Items["FeedbackAction"] = value.ToString();
        }
    }
}
