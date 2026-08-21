//--------------------------------------------------
// Project: AdvantShop.NET
// Web site: http:\\www.advantshop.net
//--------------------------------------------------

using System;
using System.Web;
using AdvantShop.Design;
using AdvantShop.Core.UrlRewriter;
using System.IO;
using System.Web.Hosting;
using AdvantShop.Core.Common.Attributes;
using AdvantShop.Core.Caching;
using AdvantShop.Core;
using AdvantShop.Core.Common.Extensions;
using AdvantShop.Core.Services.Landing;
using AdvantShop.Core.Services.Screenshot;
using AdvantShop.Core.Services.SEO;
using AdvantShop.Saas;
using System.Collections.Generic;
using AdvantShop.Core.Services.Configuration.Settings;
using AdvantShop.CriticalCss;
using AdvantShop.Warmup;

namespace AdvantShop.Configuration
{
    public class SettingsDesign
    {
        private const string TemplateContextKey = "CurrentTemplate";
        private const string PreviewTemplateContextKey = "PreviewCurrentTemplate";

        private const string IsMobileTemplateContextKey = "IsMobileCurrentTemplate";
        private const string IsSocialTemplateContextKey = "IsSocialCurrentTemplate";

        public enum eSearchBlockLocation
        {
            None = 0,
            TopMenu = 1,
            CatalogMenu = 2,
            TopPanel = 3
        }
        public enum EShoppingCartPopupType
        {
            [Localize("Core.Settings.SettingsCatalog.ShoppingCartPopupType.None")]
            None = 0,
            [Localize("Core.Settings.SettingsCatalog.ShoppingCartPopupType.Mini")]
            Mini = 1,
            [Localize("Core.Settings.SettingsCatalog.ShoppingCartPopupType.Sidebar")]
            Sidebar = 2
        }

        public enum eMenuStyle
        {
            Classic,
            Modern,
            Accordion,
            Treeview,
        }


        public enum eMainPageMode
        {
            Default = 0,
            TwoColumns = 1,
            ThreeColumns = 2
        }


        public enum eShowShippingsInDetails
        {
            [Localize("Core.Settings.SettingsCatalog.ShowShippingsInDetails.Never")]
            Never = 0,

            [Localize("Core.Settings.SettingsCatalog.ShowShippingsInDetails.ByClick")]
            ByClick = 1,

            [Localize("Core.Settings.SettingsCatalog.ShowShippingsInDetails.Always")]
            Always = 2
        }

        public enum eWhoAllowReviews
        {
            [Localize("Core.Settings.SettingsCatalog.WhoAllowReviews.All")]
            All = 0,

            [Localize("Core.Settings.SettingsCatalog.WhoAllowReviews.Registered")]
            Registered = 1,

            [Localize("Core.Settings.SettingsCatalog.WhoAllowReviews.BoughtUser")]
            BoughtUser = 2,

            [Localize("Core.Settings.SettingsCatalog.WhoAllowReviews.None")]
            None = 3
        }


        public enum eSizeColorControlType
        {
            [StringName("enumeration")] [Localize("Core.Sizes.ControlType.Enumeration")]
            Enumeration = 0,

            [StringName("select")] [Localize("Core.Sizes.ControlType.Select")]
            Select = 1
        }

        public enum eCartAddTypeButton
        {
            [Localize("Core.Settings.SettingsCatalog.CartAddTypeButton.Classic")]
            Classic = 0,

            [Localize("Core.Settings.SettingsCatalog.CartAddTypeButton.WithSpinbox")]
            WithSpinbox = 1,

            [Localize("Core.Settings.SettingsCatalog.CartAddTypeButton.SeparateWithSpinbox")]
            SeparateWithSpinbox = 2
        }

        public enum eRelatedProductSourceType
        {
            [Localize("Core.Settings.SettingsCatalog.RelatedProductSourceType.Default")]
            Default = 0,

            [Localize("Core.Settings.SettingsCatalog.RelatedProductSourceType.FromCategory")]
            FromCategory = 1,

            [Localize("Core.Settings.SettingsCatalog.RelatedProductSourceType.FromCurrentCategory")]
            FromCurrentCategory = 3,

            [Localize("Core.Settings.SettingsCatalog.RelatedProductSourceType.FromModule")]
            FromModule = 2
        }

        public enum EDisplayCityBubbleType
        {
            [Localize("Core.Settings.SettingsCatalog.DisplayCityBubbleType.NoDisplay")]
            NoDisplay = 0,

            [Localize("Core.Settings.SettingsCatalog.DisplayCityBubbleType.DisplayZonePopover")]
            DisplayZonePopover = 1,

            [Localize("Core.Settings.SettingsCatalog.DisplayCityBubbleType.DisplayZoneDialog")]
            DisplayZoneDialog = 2
        }

        #region Design settings in db

        public static string Template
        {
            get
            {
                if (AppServiceStartAction.state != PingDbState.NoError)
                    return TemplateService.DefaultTemplateId;

                if (HttpContext.Current != null)
                {
                    var currentTemplate = HttpContext.Current.Items[TemplateContextKey] as string;
                    if (currentTemplate != null)
                        return currentTemplate;

                    var tpl = Customers.CustomerContext.CurrentCustomer.IsAdmin && PreviewTemplate != null
                        ? PreviewTemplate
                        : SettingProvider.Items["Template"];

                    if (tpl != TemplateService.DefaultTemplateId &&
                        !Directory.Exists(HostingEnvironment.MapPath("~/templates/" + tpl)))
                    {
                        tpl = TemplateService.DefaultTemplateId;
                    }

                    HttpContext.Current.Items[TemplateContextKey] = tpl;
                    return tpl;
                }
                else
                {
                    var tpl = SettingProvider.Items["Template"];
                    if (tpl != TemplateService.DefaultTemplateId &&
                        !Directory.Exists(HostingEnvironment.MapPath("~/templates/" + tpl)))
                    {
                        tpl = TemplateService.DefaultTemplateId;
                    }

                    return tpl;
                }
            }
            private set => HttpContext.Current.Items[TemplateContextKey] = value;
        }

        public static string TemplateInDb
        {
            get
            {
                if (SettingProvider.Items["Template"] != TemplateService.DefaultTemplateId &&
                    !Directory.Exists(HostingEnvironment.MapPath("~/templates/" + SettingProvider.Items["Template"])))
                {
                    SettingProvider.Items["Template"] = TemplateService.DefaultTemplateId;
                }

                return SettingProvider.Items["Template"];
            }
        }


        public static string PreviewTemplate
        {
            get
            {
                var tpl = SettingProvider.Items["PreviewTemplate"];
                if (tpl != null && tpl != TemplateService.DefaultTemplateId &&
                    !Directory.Exists(HostingEnvironment.MapPath("~/templates/" + tpl)))
                {
                    tpl = null;
                    SettingProvider.Items["PreviewTemplate"] = null;
                }

                return tpl;
            }
            set
            {
                SettingProvider.Items["PreviewTemplate"] = value;

                if (value != null)
                    TemplateSettingsProvider.SetTemplateSettings(value);
            }
        }


        public static void ChangeTemplate(string template, bool updateScreenshot = true)
        {
            PreviewTemplate = null;

            SettingProvider.Items["Template"] = template;
            Template = template;

            TemplateSettingsProvider.SetTemplateSettings(template);
            CacheManager.Clean();
            CriticalCssService.MarkNeedUpdateByTemplate(template);
            ViewsWarmupService.StartWarmupTemplate();

            if (updateScreenshot)
            {
                var screenService = new ScreenshotService();

                var screen = template == TemplateService.DefaultTemplateId
                    ? "../images/design/preview.jpg"
                    : $"../Templates/{template}/preview.jpg";

                screenService.SetStoreScreenShots(screen);
                screenService.UpdateStoreScreenShotInBackground();
            }
        }

        public static void ApplyInstalledTemplate()
        {
            var templateToApply = SettingProvider.Items["TemplateToApply"];
            if (templateToApply.IsNotEmpty())
            {
                ChangeTemplate(templateToApply);
                SettingProvider.Items["TemplateToApply"] = null;
            }
        }

        public static bool ShoppingCartVisibility
        {
            get => Convert.ToBoolean(SettingProvider.Items["ShowShoppingCartOnMainPage"]);
            set => SettingProvider.Items["ShowShoppingCartOnMainPage"] = value.ToString();
        }

        public static bool EnableZoom
        {
            get => Convert.ToBoolean(TemplateSettingsProvider.Items["EnableZoom"] ??
                                     SettingProvider.Items["EnableZoom"]);
            set =>
                SettingProvider.Items["EnableZoom"] =
                    TemplateSettingsProvider.Items["EnableZoom"] = value.ToString();
        }

        public static bool DisplayToolBarBottom
        {
            get => Convert.ToBoolean(TemplateSettingsProvider.Items["DisplayToolBarBottom"] ??
                                     SettingProvider.Items["DisplayToolBarBottom"]);
            set =>
                SettingProvider.Items["DisplayToolBarBottom"] =
                    TemplateSettingsProvider.Items["DisplayToolBarBottom"] = value.ToString();
        }

        public static eShowShippingsInDetails ShowShippingsMethodsInDetails
        {
            get
            {
                var value = TemplateSettingsProvider.Items["ShowShippingsMethodsInDetails"] ??
                            SettingProvider.Items["ShowShippingsMethodsInDetails"];
                return
                    int.TryParse(value, out var intValue)
                        ? (eShowShippingsInDetails)intValue
                        : Enum.TryParse<eShowShippingsInDetails>(value, out var enumValue)
                            ? enumValue
                            : eShowShippingsInDetails.Always;
            }
            set =>
                SettingProvider.Items["ShowShippingsMethodsInDetails"] =
                    TemplateSettingsProvider.Items["ShowShippingsMethodsInDetails"] = ((int)value).ToString();
        }

        public static eWhoAllowReviews WhoAllowReviews
        {
            get
            {
                var whoAllow = SettingProvider.Items["WhoAllowReviews"];

                if (!string.IsNullOrEmpty(whoAllow))
                    return (eWhoAllowReviews)int.Parse(whoAllow);
                return eWhoAllowReviews.All;
            }
            set => SettingProvider.Items["WhoAllowReviews"] = ((int)value).ToString();
        }

        public static bool ShowVerificationCheckmarkAtAdminInReviews
        {
            get => SettingProvider.Items["ShowVerificationCheckmarkAtAdminInReviews"].TryParseBool();
            set => SettingProvider.Items["ShowVerificationCheckmarkAtAdminInReviews"] = value.ToString();
        }

        public static int ShippingsMethodsInDetailsCount
        {
            get => int.Parse(TemplateSettingsProvider.Items["ShippingsMethodsInDetailsCount"] ??
                             SettingProvider.Items["ShippingsMethodsInDetailsCount"]);
            set =>
                SettingProvider.Items["ShippingsMethodsInDetailsCount"] =
                    TemplateSettingsProvider.Items["ShippingsMethodsInDetailsCount"] = value.ToString();
        }

        /// <summary>
        /// Скрывать город в клиентской части
        /// </summary>
        public static bool HideCityInTopPanel
        {
            get => Convert.ToBoolean(SettingProvider.Items["HideCityInTopPanel"]);
            set => SettingProvider.Items["HideCityInTopPanel"] = value.ToString();
        }

        /// <summary>
        /// Определять город автоматически
        /// </summary>
        public static bool AutodetectCity
        {
            get => Convert.ToBoolean(SettingProvider.Items["AutodetectCity"]);
            set => SettingProvider.Items["AutodetectCity"] = value.ToString();
        }

        public static int? DefaultCityIdIfNotAutodetect
        {
            get => SettingProvider.Items["DefaultCityIdIfNotAutodetect"].TryParseInt(true);
            set => SettingProvider.Items["DefaultCityIdIfNotAutodetect"] = value.ToString();
        }

        public static string DefaultCityIfNotAutodetect
        {
            get => SettingProvider.Items["DefaultCityIfNotAutodetect"];
            set => SettingProvider.Items["DefaultCityIfNotAutodetect"] = value;
        }

        public static EDisplayCityBubbleType DisplayCityBubbleType
        {
            get => SettingProvider.Items["DisplayCityBubble"].TryParseEnum(EDisplayCityBubbleType.DisplayZonePopover);
            set => SettingProvider.Items["DisplayCityBubble"] = ((int)value).ToString();
        }

        public static bool HideCountriesInZoneDialog
        {
            get => SettingProvider.Items["HideCountriesInZoneDialog"].TryParseBool();
            set => SettingProvider.Items["HideCountriesInZoneDialog"] = value.ToString();
        }

        public static bool HideSearchInZoneDialog
        {
            get => SettingProvider.Items["HideSearchInZoneDialog"].TryParseBool();
            set => SettingProvider.Items["HideSearchInZoneDialog"] = value.ToString();
        }

        public static eRelatedProductSourceType RelatedProductSourceType
        {
            get
            {
                var item = SettingProvider.Items["RelatedProductSourceType"];
                if (item.IsNullOrEmpty())
                    return eRelatedProductSourceType.FromCategory;
                return item.TryParseEnum<eRelatedProductSourceType>();
            }
            set => SettingProvider.Items["RelatedProductSourceType"] = ((int)value).ToString();
        }

        public static eRelatedProductSourceType SimilarProductSourceType
        {
            get
            {
                var item = SettingProvider.Items["SimilarProductSourceType"];
                if (item.IsNullOrEmpty())
                    return eRelatedProductSourceType.FromCurrentCategory;
                return item.TryParseEnum<eRelatedProductSourceType>();
            }
            set => SettingProvider.Items["SimilarProductSourceType"] = ((int)value).ToString();
        }

        public static string MainPageListName
        {
            get => SettingProvider.Items["MainPageListName"];
            set => SettingProvider.Items["MainPageListName"] = value;
        }

        public static bool ShowCustomCopyright
        {
            get => !CopyrightService.IsCopyrightLocked
                   && Convert.ToBoolean(SettingProvider.Items["ShowCustomCopyright"]);
            set
            {
                if (!CopyrightService.IsCopyrightLocked)
                {
                    SettingProvider.Items["ShowCustomCopyright"] = value.ToString();
                }
            }
        }

        public static string DefaultCopyright
        {
            get
            {
                var setting = SettingProvider.Items["DefaultCopyright"];
                if (string.IsNullOrWhiteSpace(setting))
                {
                    setting = CopyrightService.UpdateCopyRight(ECopyrightType.Site);
                }

                return setting;
            }
            set => SettingProvider.Items["DefaultCopyright"] = value;
        }

        public static string CopyrightText
        {
            get => SettingProvider.Items["CopyrightText"];
            set => SettingProvider.Items["CopyrightText"] = value;
        }

        public static bool ShowClientId
        {
            get => Convert.ToBoolean(SettingProvider.Items["ShowClientId"]);
            set => SettingProvider.Items["ShowClientId"] = value.ToString();
        }

        public static bool EnableShoppingCartPopup
        {
            get
            {
                var settingValue = SettingProvider.Items["EnableShoppingCartPopup"];
                return settingValue.IsNullOrEmpty() || Convert.ToBoolean(settingValue);
            }

            set => SettingProvider.Items["EnableShoppingCartPopup"] = value.ToString();
        }

        public static bool FilterVisibility
        {
            get => Convert.ToBoolean(TemplateSettingsProvider.Items["FilterVisibility"] ??
                                     SettingProvider.Items["FilterVisibility"]);
            set =>
                SettingProvider.Items["FilterVisibility"] =
                    TemplateSettingsProvider.Items["FilterVisibility"] = value.ToString();
        }

        public static bool SearchFilterVisibility
        {
            get => Convert.ToBoolean(TemplateSettingsProvider.Items["SearchFilterVisibility"] ??
                                     SettingProvider.Items["SearchFilterVisibility"]);
            set =>
                SettingProvider.Items["SearchFilterVisibility"] =
                    TemplateSettingsProvider.Items["SearchFilterVisibility"] = value.ToString();
        }

        public static string AdminAreaColorScheme
        {
            get
            {
                var scheme = SettingProvider.Items["AdminAreaColorScheme"];

                if (string.IsNullOrEmpty(scheme))
                    scheme = SettingProvider.Items["AdminAreaColorScheme"] = "default";

                return scheme;
            }
            set => SettingProvider.Items["AdminAreaColorScheme"] = value;
        }

        public static bool ShowUserAgreementForPromotionalNewsletter
        {
            get => Convert.ToBoolean(SettingProvider.Items["ShowUserAgreementForPromotionalNewsletter"]);
            set => SettingProvider.Items["ShowUserAgreementForPromotionalNewsletter"] = value.ToString();
        }

        public static string UserAgreementForPromotionalNewsletter
        {
            get => SettingProvider.Items["UserAgreementForPromotionalNewsletter"];
            set => SettingProvider.Items["UserAgreementForPromotionalNewsletter"] = value;
        }

        public static bool SetUserAgreementForPromotionalNewsletterChecked
        {
            get => Convert.ToBoolean(SettingProvider.Items["SetUserAgreementForPromotionalNewsletterChecked"]);
            set => SettingProvider.Items["SetUserAgreementForPromotionalNewsletterChecked"] = value.ToString();
        }

        [Obsolete]
        public static bool IsAgreeForPromotionalNewsletterDefaultCustomerValue => true;

        #endregion

        #region Mobile template

        public static bool IsMobileTemplate
        {
            get
            {
                if (HttpContext.Current != null)
                {
                    var currentTemplate = HttpContext.Current.Items[IsMobileTemplateContextKey];
                    if (currentTemplate != null)
                        return Convert.ToBoolean(currentTemplate);
                }

                return false;
            }
            set => HttpContext.Current.Items[IsMobileTemplateContextKey] = value.ToString();
        }

        public static string MobileTemplate
        {
            get => SettingProvider.Items["MobileTemplate"];
            set => SettingProvider.Items["MobileTemplate"] = value;
        }

        #endregion

        /// <summary>
        /// Показывать пустой лейаут, если установлен IsEmptyLayout или лендинг или юзерагент моб. приложения или скрыта витрина
        /// </summary>
        public static bool IsEmptyLayout
        {
            get =>
                (HttpContext.Current != null
                 && (Convert.ToBoolean(HttpContext.Current.Items["IsEmptyLayout"])
                     || LandingHelper.IsLandingDomain(HttpContext.Current.Request.Url, out _)
                     || HttpContext.Current.Request.IsMobileApp()))
                || !SettingsMain.StoreActive;

            set => HttpContext.Current.Items["IsEmptyLayout"] = value.ToString();
        }

        #region Current template settings in template.config

        public static bool IsSocialTemplate
        {
            get
            {
                if (HttpContext.Current != null)
                {
                    var currentTemplate = HttpContext.Current.Items[IsSocialTemplateContextKey];
                    if (currentTemplate != null)
                        return Convert.ToBoolean(currentTemplate);

                    var socialType = UrlService.IsSocialUrl(HttpContext.Current.Request.Url.AbsoluteUri);
                    var isSocial = socialType != UrlService.ESocialType.none;

                    if (isSocial &&
                        ((socialType == UrlService.ESocialType.vk && !IsVkTemplateActive) ||
                         (socialType == UrlService.ESocialType.fb && !IsFbTemplateActive)))
                    {
                        isSocial = false;
                    }

                    HttpContext.Current.Items[IsSocialTemplateContextKey] = isSocial.ToString();

                    return isSocial;
                }

                return false;
            }
            set => HttpContext.Current.Items[IsSocialTemplateContextKey] = value.ToString();
        }

        public static bool IsVkTemplateActive
        {
            get => Convert.ToBoolean(SettingProvider.Items["IsVkTemplateActive"]);
            set => SettingProvider.Items["IsVkTemplateActive"] = value.ToString();
        }

        public static bool IsFbTemplateActive
        {
            get => Convert.ToBoolean(SettingProvider.Items["IsFbTemplateActive"]);
            set => SettingProvider.Items["IsFbTemplateActive"] = value.ToString();
        }

        public static string Theme
        {
            get => TemplateSettingsProvider.Items["Theme"];
            set => TemplateSettingsProvider.Items["Theme"] = value;
        }

        public static string ColorScheme
        {
            get => TemplateSettingsProvider.Items["ColorScheme"];
            set => TemplateSettingsProvider.Items["ColorScheme"] = value;
        }

        public static string Background
        {
            get => TemplateSettingsProvider.Items["Background"];
            set => TemplateSettingsProvider.Items["Background"] = value;
        }


        public static string ThemeInDb
        {
            get => TemplateSettingsProvider.GetSettingValue("Theme", TemplateInDb);
            set => TemplateSettingsProvider.SetSettingValue("Theme", value, TemplateInDb);
        }

        public static string ColorSchemeInDb
        {
            get => TemplateSettingsProvider.GetSettingValue("ColorScheme", TemplateInDb);
            set => TemplateSettingsProvider.SetSettingValue("ColorScheme", value, TemplateInDb);
        }

        public static string BackgroundInDb
        {
            get => TemplateSettingsProvider.GetSettingValue("Background", TemplateInDb);
            set => TemplateSettingsProvider.SetSettingValue("Background", value, TemplateInDb);
        }


        public static eSearchBlockLocation SearchBlockLocation
        {
            get
            {
                var result = eSearchBlockLocation.CatalogMenu;
                Enum.TryParse<eSearchBlockLocation>(TemplateSettingsProvider.Items["SearchBlockLocation"], out result);
                return result;
            }
            set => TemplateSettingsProvider.Items["SearchBlockLocation"] = value.ToString();
        }

        public static eMainPageMode MainPageMode
        {
            get => Enum.TryParse<eMainPageMode>(TemplateSettingsProvider.Items["MainPageMode"], out var mainPageMode)
                ? mainPageMode
                : eMainPageMode.Default;
            set => TemplateSettingsProvider.Items["MainPageMode"] = value.ToString();
        }

        public static eMenuStyle MenuStyle
        {
            get => Enum.TryParse<eMenuStyle>(TemplateSettingsProvider.Items["MenuStyle"], out var menuStyle)
                ? menuStyle
                : eMenuStyle.Modern;
            set => TemplateSettingsProvider.Items["MenuStyle"] = value.ToString();
        }

        public static string FontStyle => TemplateSettingsProvider.Items["FontStyle"];

        public static string FontSize => TemplateSettingsProvider.Items["FontSize"];


        public static string TitleStyle => TemplateSettingsProvider.Items["TitleStyle"];

        public static string TitleSize => TemplateSettingsProvider.Items["TitleSize"];

        public static string TitleWeight => TemplateSettingsProvider.Items["TitleWeight"];

        public static bool AllowChooseDarkTheme
        {
            get => Convert.ToBoolean(TemplateSettingsProvider.Items["AllowChooseDarkTheme"]);
            set => TemplateSettingsProvider.Items["AllowChooseDarkTheme"] = value.ToString();
        }

        public static string ThemeImgForLogo
        {
            get => TemplateSettingsProvider.Items["ThemeImgForLogo"];
            set => TemplateSettingsProvider.Items["ThemeImgForLogo"] = value.ToString();
        }
        public static bool UseAnotherForDarkTheme
        {
            get => Convert.ToBoolean(TemplateSettingsProvider.Items[" UseAnotherForDarkTheme"]);
            set => TemplateSettingsProvider.Items[" UseAnotherForDarkTheme"] = value.ToString();
        }

        public static string CarouselAnimation
        {
            get => TemplateSettingsProvider.Items["CarouselAnimation"];
            set => TemplateSettingsProvider.Items["CarouselAnimation"] = value;
        }

        public static int CarouselAnimationSpeed
        {
            get
            {
                int intTempResult = -1;
                Int32.TryParse(TemplateSettingsProvider.Items["CarouselAnimationSpeed"], out intTempResult);
                return intTempResult;
            }
            set => TemplateSettingsProvider.Items["CarouselAnimationSpeed"] = value.ToString();
        }

        public static int CarouselAnimationDelay
        {
            get
            {
                int intTempResult = -1;
                Int32.TryParse(TemplateSettingsProvider.Items["CarouselAnimationDelay"], out intTempResult);
                return intTempResult;
            }
            set => TemplateSettingsProvider.Items["CarouselAnimationDelay"] = value.ToString();
        }

        public const int CarouselOneColumnWidth = 1160;
        public const int CarouselOneColumnHeight = 400;

        public const int CarouselTwoColumnWidth = 865;
        public const int CarouselTwoColumnHeight = 400;

        public const int CarouselMobileWidth = 360;
        public const int CarouselMobileHeight = 170;

        /// <summary>
        /// ShowSeeProductOnMainPage
        /// </summary>
        public static bool RecentlyViewVisibility
        {
            get => Convert.ToBoolean(TemplateSettingsProvider.Items["RecentlyViewVisibility"] ??
                                     SettingProvider.Items["RecentlyViewVisibility"]);
            set =>
                SettingProvider.Items["RecentlyViewVisibility"] =
                    TemplateSettingsProvider.Items["RecentlyViewVisibility"] = value.ToString();
        }

        /// <summary>
        /// ShowNewsOnMainPage
        /// </summary>
        public static bool NewsVisibility
        {
            get => Convert.ToBoolean(TemplateSettingsProvider.Items["NewsVisibility"]);
            set => TemplateSettingsProvider.Items["NewsVisibility"] = value.ToString();
        }

        /// <summary>
        /// ShowNewsSubscriptionOnMainPage
        /// </summary>
        public static bool NewsSubscriptionVisibility
        {
            get => Convert.ToBoolean(TemplateSettingsProvider.Items["NewsSubscriptionVisibility"]);
            set => TemplateSettingsProvider.Items["NewsSubscriptionVisibility"] = value.ToString();
        }

        /// <summary>
        /// ShowStatusCommentOnMainPage
        /// </summary>
        public static bool CheckOrderVisibility
        {
            get => Convert.ToBoolean(TemplateSettingsProvider.Items["CheckOrderVisibility"]);
            set => TemplateSettingsProvider.Items["CheckOrderVisibility"] = value.ToString();
        }

        /// <summary>
        /// ShowMainPageProductsOnMainPage
        /// </summary>
        public static bool MainPageProductsVisibility
        {
            get => Convert.ToBoolean(TemplateSettingsProvider.Items["MainPageProductsVisibility"]);
            set => TemplateSettingsProvider.Items["MainPageProductsVisibility"] = value.ToString();
        }

        /// <summary>
        /// GiftSertificateBlock
        /// </summary>
        public static bool GiftSertificateVisibility
        {
            get => Convert.ToBoolean(TemplateSettingsProvider.Items["GiftSertificateVisibility"]);
            set => TemplateSettingsProvider.Items["GiftSertificateVisibility"] = value.ToString();
        }

        /// <summary>
        /// WishList
        /// </summary>
        public static bool WishListVisibility
        {
            get => Convert.ToBoolean(TemplateSettingsProvider.Items["WishListVisibility"] ??
                                     SettingProvider.Items["WishListVisibility"]);
            set =>
                SettingProvider.Items["WishListVisibility"] =
                    TemplateSettingsProvider.Items["WishListVisibility"] = value.ToString();
        }

        /// <summary>
        /// Carousel visibility
        /// </summary>
        public static bool CarouselVisibility
        {
            get => Convert.ToBoolean(TemplateSettingsProvider.Items["CarouselVisibility"]);
            set => TemplateSettingsProvider.Items["CarouselVisibility"] = value.ToString();
        }

        public static int CountMainPageProductInLine
        {
            get => Convert.ToInt32(TemplateSettingsProvider.Items["CountMainPageProductInLine"]);
            set => TemplateSettingsProvider.Items["CountMainPageProductInLine"] = value.ToString();
        }

        public static int CountMainPageProductInSection
        {
            get => Convert.ToInt32(TemplateSettingsProvider.Items["CountMainPageProductInSection"]);
            set => TemplateSettingsProvider.Items["CountMainPageProductInSection"] = value.ToString();
        }

        public static int CountCatalogProductInLine
        {
            get => Convert.ToInt32(TemplateSettingsProvider.Items["CountCatalogProductInLine"]);
            set => TemplateSettingsProvider.Items["CountCatalogProductInLine"] = value.ToString();
        }

        public static int CountCategoriesInLine
        {
            get => Convert.ToInt32(TemplateSettingsProvider.Items["CountCategoriesInLine"]);
            set => TemplateSettingsProvider.Items["CountCategoriesInLine"] = value.ToString();
        }

        public static bool BrandCarouselVisibility
        {
            get => Convert.ToBoolean(TemplateSettingsProvider.Items["BrandCarouselVisibility"]);
            set => TemplateSettingsProvider.Items["BrandCarouselVisibility"] = value.ToString();
        }


        public static string DefaultLogo
        {
            get => TemplateSettingsProvider.GetSettingValue("DefaultLogo");
            set => TemplateSettingsProvider.SetSettingValue("DefaultLogo", value);
        }

        public static string DefaultSlides
        {
            get => TemplateSettingsProvider.GetSettingValue("DefaultSlides");
            set => TemplateSettingsProvider.SetSettingValue("DefaultSlides", value);
        }

        public static bool IsDefaultSlides
        {
            get => Convert.ToBoolean(SettingProvider.Items["IsDefaultSlides"]);
            set => SettingProvider.Items["IsDefaultSlides"] = value.ToString();
        }

        public static bool MainPageCategoriesVisibility
        {
            get => Convert.ToBoolean(TemplateSettingsProvider.Items["MainPageCategoriesVisibility"] ??
                                     SettingProvider.Items["MainPageCategoriesVisibility"]);
            set =>
                SettingProvider.Items["MainPageCategoriesVisibility"] =
                    TemplateSettingsProvider.Items["MainPageCategoriesVisibility"] = value.ToString();
        }

        public static int CountMainPageCategoriesInLine
        {
            get => Convert.ToInt32(TemplateSettingsProvider.Items["CountMainPageCategoriesInLine"]);
            set => TemplateSettingsProvider.Items["CountMainPageCategoriesInLine"] = value.ToString();
        }

        public static int CountMainPageCategoriesInSection
        {
            get => Convert.ToInt32(TemplateSettingsProvider.Items["CountMainPageCategoriesInSection"]);
            set => TemplateSettingsProvider.Items["CountMainPageCategoriesInSection"] = value.ToString();
        }

        public static bool TopMenuVisibility
        {
            get => Convert.ToBoolean(SettingProvider.Items["TopMenu"]);
            set => TemplateSettingsProvider.Items["TopMenu"] = value.ToString();
        }

        public static int LogoImageWidth
        {
            get => Convert.ToInt32(TemplateSettingsProvider.Items["LogoImageWidth"]);
            set => TemplateSettingsProvider.Items["LogoImageWidth"] = value.ToString();
        }

        public static int LogoImageHeight
        {
            get => Convert.ToInt32(TemplateSettingsProvider.Items["LogoImageHeight"]);
            set => TemplateSettingsProvider.Items["LogoImageHeight"] = value.ToString();
        }

        public static bool ShowMarketplaceButton
        {
            get => TemplateSettingsProvider.Items["ShowMarketplaceButton"].TryParseBool();
            set => TemplateSettingsProvider.Items["ShowMarketplaceButton"] = value.ToString();
        }

        public static bool ShowUnitCardProduct
        {
            get => TemplateSettingsProvider.Items["ShowUnitCardProduct"].TryParseBool(true) ?? true;
            set => TemplateSettingsProvider.Items["ShowUnitCardProduct"] = value.ToString();
        }

        public static bool ShowPriceInMiniCart
        {
            get => TemplateSettingsProvider.Items["ShowPriceInMiniCart"].TryParseBool();
            set => TemplateSettingsProvider.Items["ShowPriceInMiniCart"] = value.ToString();
        }
        
        public static EShoppingCartPopupType ShoppingCartPopupType
        {
            get
            {
                var type = TemplateSettingsProvider.Items["ShoppingCartPopupType"];
                
                return Enum.TryParse<EShoppingCartPopupType>(type, out var result)
                    ? result
                    : new SettingsTemplate().ShoppingCartPopupType;
            }
            set => TemplateSettingsProvider.Items["ShoppingCartPopupType"] = value.ToString();
        }

        public static eCartAddTypeButton CartAddType
        {
            get
            {
                var value = TemplateSettingsProvider.Items["CartAddType"] ?? SettingProvider.Items["CartAddType"];

                return !string.IsNullOrEmpty(value)
                    ? int.TryParse(value, out var intValue)
                        ? (eCartAddTypeButton)intValue
                        : Enum.TryParse(value, out eCartAddTypeButton eValue)
                            ? eValue
                            : eCartAddTypeButton.Classic
                    : eCartAddTypeButton.Classic;
            }
            set =>
                SettingProvider.Items["CartAddType"] =
                    TemplateSettingsProvider.Items["CartAddType"] = ((int)value).ToString();
        }

        public static eSizeColorControlType ColorsControlType
        {
            get
            {
                var sizeColorControlType = SettingProvider.Items["ColorsControlType"];

                if (!string.IsNullOrEmpty(sizeColorControlType))
                    return (eSizeColorControlType)int.Parse(sizeColorControlType);
                return eSizeColorControlType.Enumeration;
            }
            set => SettingProvider.Items["ColorsControlType"] = ((int)value).ToString();
        }

        public static eSizeColorControlType SizesControlType
        {
            get
            {
                var sizeColorControlType = SettingProvider.Items["SizesControlType"];

                if (!string.IsNullOrEmpty(sizeColorControlType))
                    return (eSizeColorControlType)int.Parse(sizeColorControlType);
                return eSizeColorControlType.Enumeration;
            }
            set => SettingProvider.Items["SizesControlType"] = ((int)value).ToString();
        }

        public static bool OnePageCatalog
        {
            get => TemplateSettingsProvider.Items["OnePageCatalog"].TryParseBool();
            set => TemplateSettingsProvider.Items["OnePageCatalog"] = value.ToString();
        }

        #endregion;

        private static string _cartAddBlockWidth;

        public static string CartAddBlockWidth => _cartAddBlockWidth.IsNotEmpty()
            ? _cartAddBlockWidth
            : _cartAddBlockWidth = (SettingsCatalog.BuyButtonText.Length + 6) + "ch";

        public static bool AllowUseYandexMap =>
            !SaasDataService.IsSaasEnabled || SaasDataService.CurrentSaasData.AllowUseYandexMap;
        
        public static bool UseYandexMap
        {
            get => Convert.ToBoolean(TemplateSettingsProvider.Items["UseYandexMap"] ??
                                     SettingProvider.Items["UseYandexMap"]);
            set => 
                SettingProvider.Items["UseYandexMap"] =
                TemplateSettingsProvider.Items["UseYandexMap"] = value.ToString();
        }
        
        public static string YandexMapApiKey
        {
            get => SettingProvider.Items["YandexMapApiKey"] ?? "";
            set => SettingProvider.Items["YandexMapApiKey"] = value;
        }
        
        public static bool? UseMapForPickupPoints
        {
            get => TemplateSettingsProvider.Items["UseMapForPickupPoints"].TryParseBool(true);
            set => TemplateSettingsProvider.Items["UseMapForPickupPoints"] = value?.ToString();
        }
        
        public static bool? UseMapForDeliveryAddresses
        {
            get => TemplateSettingsProvider.Items["UseMapForDeliveryAddresses"].TryParseBool(true);
            set => TemplateSettingsProvider.Items["UseMapForDeliveryAddresses"] = value?.ToString();
        }

        #region Fonts

        public static bool IsUseChooseFont
        {
            get => TemplateSettingsProvider.Items["IsUseCustomsFont"].TryParseBool();
            set => TemplateSettingsProvider.Items["IsUseCustomsFont"] = value.ToString();
        }

        public static string ChooseFont
        {
            get => TemplateSettingsProvider.Items["FontMain"];
            set => TemplateSettingsProvider.Items["FontMain"] = value.ToString();
        }

        public static string ChooseLineHeight
        {
            get => TemplateSettingsProvider.Items["ChooseLineHeight"] ?? "1.2";
            set => TemplateSettingsProvider.Items["ChooseLineHeight"] = value.ToString();
        }

        public static List<ChoseFont> GetDefaultFonts()
        {
            return new List<ChoseFont>()
            {
                new ChoseFont()
                {
                    Name = "OpenSans",
                    FontFamily = "'OpenSans'"
                },
                new ChoseFont()
                {
                    Name = "Roboto",
                    FontFamily = "'Roboto'"
                },
                new ChoseFont()
                {
                    Name = "Playfair Display",
                    FontFamily = "'Playfair Display'"
                },
                new ChoseFont()
                {
                    Name = "Cormorant",
                    FontFamily = "'Cormorant'"
                },
                new ChoseFont()
                {
                    Name = "Montserrat",
                    FontFamily = "'Montserrat'"
                },
                new ChoseFont()
                {
                    Name = "Merriweather",
                    FontFamily = "'Merriweather'"
                },
                new ChoseFont()
                {
                    Name = "Ubuntu",
                    FontFamily = "'Ubuntu'"
                },
                new ChoseFont()
                {
                    Name = "Alegreya Sans SC",
                    FontFamily = "'Alegreya Sans SC'"
                },
                new ChoseFont()
                {
                    Name = "Spectral SC",
                    FontFamily = "'Spectral SC'"
                },
                new ChoseFont()
                {
                    Name = "Georgia",
                    FontFamily = "'Georgia'",
                },
                new ChoseFont()
                {
                    Name = "Arial",
                    FontFamily = "'Arial'",
                },
                new ChoseFont()
                {
                    Name = "Tahoma",
                    FontFamily = "'Tahoma'",
                },
                new ChoseFont()
                {
                    Name = "Roboto Condensed",
                    FontFamily = "'Roboto Condensed'"
                },
                new ChoseFont()
                {
                    Name = "Roboto Slab",
                    FontFamily = "'Roboto Slab'"
                },
                new ChoseFont()
                {
                    Name = "Rubik",
                    FontFamily = "'Rubik'"
                },
                new ChoseFont()
                {
                    Name = "IBM Plex Sans",
                    FontFamily = "'IBM Plex Sans'"
                },
                new ChoseFont()
                {
                    Name = "Scada",
                    FontFamily = "'Scada'"
                },
                new ChoseFont()
                {
                    Name = "Inter",
                    FontFamily = "'Inter'"
                },
                new ChoseFont()
                {
                    Name = "PT Sans",
                    FontFamily = "'PT Sans'"
                },
                new ChoseFont()
                {
                    Name = "PT Serif",
                    FontFamily = "'PT Serif'"
                },
                new ChoseFont()
                {
                    Name = "Oswald",
                    FontFamily = "'Oswald'"
                }
            };
        }

        #endregion;

    }
}