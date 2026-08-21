using System;

namespace AdvantShop.Configuration
{
    public class SettingsPersonalAccount
    {
        public static bool ShowMapAddress
        {
            get => Convert.ToBoolean(TemplateSettingsProvider.Items["ShowMapAddress"] ?? 
                                     SettingProvider.Items["ShowMapAddress"]);
            set => 
                SettingProvider.Items["ShowMapAddress"] = 
                TemplateSettingsProvider.Items["ShowMapAddress"] = value.ToString();
        }
    }
}