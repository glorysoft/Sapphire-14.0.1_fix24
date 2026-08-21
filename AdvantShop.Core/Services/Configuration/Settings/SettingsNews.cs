//--------------------------------------------------
// Project: AdvantShop.NET
// Web site: http:\\www.advantshop.net
//--------------------------------------------------

using AdvantShop.Core.Caching;
using AdvantShop.Core.Common.Extensions;
using AdvantShop.SEO;

namespace AdvantShop.Configuration
{
    public class SettingsNews
    {
        public static int NewsMainPageCount
        {
            get => int.Parse(SettingProvider.Items["NewsMainPageCount"]);
            set
            {
                SettingProvider.Items["NewsMainPageCount"] = value.ToString();
                CacheManager.RemoveByPattern(CacheNames.GetNewsForMainPage());
            }
        }

        public static int NewsPerPage
        {
            get => int.Parse(SettingProvider.Items["NewsPerPage"]);
            set => SettingProvider.Items["NewsPerPage"] = value.ToString();
        }

        public static string MainPageText
        {
            get => SettingProvider.Items[MetaType.News + "MainPageText"];
            set => SettingProvider.Items[MetaType.News + "MainPageText"] = value;
        }

        public static bool RssViewNews
        {
            get {
                    bool result = false;
                    bool.TryParse(SettingProvider.Items[MetaType.News + "RssViewNews"], out result);
                    return result;
                }
            set => SettingProvider.Items[MetaType.News + "RssViewNews"] = value.ToString();
        }
        
        public static bool HideNewsDate
        {
            get => TemplateSettingsProvider.Items["HideNewsDate"].TryParseBool();
            set => TemplateSettingsProvider.Items["HideNewsDate"] = value.ToString();
        }
    }
}