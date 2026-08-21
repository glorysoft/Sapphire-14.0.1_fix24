using System;
using System.Linq;
using AdvantShop.Configuration;
using AdvantShop.Core;
using AdvantShop.Core.Caching;
using AdvantShop.Core.Services.Admin;
using AdvantShop.Core.Services.Auth;
using AdvantShop.Core.Services.Configuration.Settings.Enums;
using AdvantShop.Core.Services.Landing;
using AdvantShop.Core.Services.Localization;
using AdvantShop.Diagnostics;
using AdvantShop.Warmup;
using AdvantShop.Web.Admin.Models.Settings;
using AdvantShop.Web.Infrastructure.Handlers;

namespace AdvantShop.Web.Admin.Handlers.Settings.System
{
    public sealed class SaveSystemSettingsHandler : ICommandHandler
    {
        private readonly SystemSettingsModel _model;

        public SaveSystemSettingsHandler(SystemSettingsModel model)
        {
            _model = model;
        }

        public void Execute()
        {
            #region Common

            SettingsMain.LogoImageAlt = _model.LogoImageAlt;
            SettingsCatalog.ShowImageSearchEnabled = _model.ShowImageSearchEnabled;
            SettingsMain.TrackProductChanges = _model.TrackProductChanges;

            try
            {
                var dt = DateTime.Now.ToString(_model.AdminDateFormat);
                SettingsMain.AdminDateFormat = _model.AdminDateFormat;
            }
            catch (Exception ex)
            {
                Debug.Log.Error(ex);
                throw new BlException("Неправильный формат даты в части администрирования");
            }

            try
            {
                var dt = DateTime.Now.ToString(_model.ShortDateFormat);
                SettingsMain.ShortDateFormat = _model.ShortDateFormat;
            }
            catch (Exception ex)
            {
                Debug.Log.Error(ex);
                throw new BlException("Неправильный короткий формат даты");
            }

            SettingsMain.EnablePhoneMask = _model.EnablePhoneMask;

            SettingsMain.AdminStartPage = _model.AdminStartPage;

            SettingsMain.ImageQuality = _model.ImageQuality;

            var langChanged = SettingsMain.Language != _model.SiteLanguage;
            SettingsMain.Language = _model.SiteLanguage;

            if (langChanged)
            {
                CacheManager.Clean();
                LocalizationService.GenerateJsResourcesFile();
            }

            if (string.IsNullOrWhiteSpace(_model.CopyrightMode) is false)
            {
                SettingsDesign.ShowCustomCopyright =
                    _model.CopyrightMode.Equals("custom", StringComparison.OrdinalIgnoreCase);
                SettingsDesign.CopyrightText = _model.CopyrightText;
            }
            
            SettingsDesign.YandexMapApiKey =  _model.YandexMapApiKey;
            

            #endregion

            #region Captcha

            SettingsMain.EnableCaptcha = _model.EnableCaptcha;
            SettingsMain.EnableCaptchaInCheckout = _model.EnableCaptchaInCheckout;
            SettingsMain.EnableCaptchaInRegistration = _model.EnableCaptchaInRegistration;
            SettingsMain.EnableCaptchaInFeedback = _model.EnableCaptchaInFeedback;
            SettingsMain.EnableCaptchaInProductReview = _model.EnableCaptchaInProductReview;
            SettingsMain.EnableCaptchaInPreOrder = _model.EnableCaptchaInPreOrder;
            SettingsMain.EnableCaptchaInGiftCerticate = _model.EnableCaptchaInGiftCerticate;
            SettingsMain.EnableCaptchaInBuyInOneClick = _model.EnableCaptchaInBuyInOneClick;
            SettingsMain.EnableCaptchaInSmsConfirmation = _model.EnableCaptchaInSmsConfirmation;
            SettingsMain.EnableCaptchaInSendCode = _model.EnableCaptchaInSendCode;
            SettingsMain.CaptchaMode = (CaptchaMode)_model.CaptchaMode;
            SettingsMain.CaptchaLength = _model.CaptchaLength;

            #endregion

            #region Auth

            SettingsMain.StoreAccessMode = (EStoreAccessMode)_model.StoreAccessMode;
            if (SettingsMain.StoreAccessMode == EStoreAccessMode.AuthenticatedCustomer)
                SettingsMain.NoAccessRedirectUrl = _model.NoAccessRedirectUrl;
            
            SettingsOAuth.GoogleActive = _model.GoogleActive;
            SettingsOAuth.MailActive = _model.MailActive;
            SettingsOAuth.YandexActive = _model.YandexActive;
            SettingsOAuth.VkontakteActive = _model.VkontakteActive;
            SettingsOAuth.VkIdActive = _model.VkIdActive;
            SettingsOAuth.FacebookActive = _model.FacebookActive;
            SettingsOAuth.OdnoklassnikiActive = _model.OdnoklassnikiActive;
            SettingsAuth.AuthByCodeActive = _model.AuthByCodeActive;
            SettingsAuth.AuthByCodeMethod = (EAuthByCodeMode)_model.AuthByCodeMethod;

            SettingsOAuth.GoogleClientId = _model.GoogleClientId;
            SettingsOAuth.GoogleClientSecret = _model.GoogleClientSecret;

            SettingsOAuth.VkontakeClientId = _model.VkontakeClientId;
            SettingsOAuth.VkontakeSecret = _model.VkontakeSecret;
            
            SettingsOAuth.VkIdClientId = _model.VkIdClientId;

            SettingsOAuth.OdnoklassnikiClientId = _model.OdnoklassnikiClientId;
            SettingsOAuth.OdnoklassnikiSecret = _model.OdnoklassnikiSecret;
            SettingsOAuth.OdnoklassnikiPublicApiKey = _model.OdnoklassnikiPublicApiKey;

            SettingsOAuth.FacebookClientId = _model.FacebookClientId;
            SettingsOAuth.FacebookApplicationSecret = _model.FacebookApplicationSecret;

            SettingsOAuth.MailAppId = _model.MailAppId;
            SettingsOAuth.MailClientSecret = _model.MailClientSecret;

            SettingsOAuth.YandexClientId = _model.YandexClientId;
            SettingsOAuth.YandexClientSecret = _model.YandexClientSecret;
            
            SettingsAuth.AuthMethod = (EAuthMethod)_model.AuthMethod;

            SettingsAuth.UseEmailConfirmation = _model.UseEmailConfirmation;
            SettingsAuth.UsePhoneConfirmation = _model.UsePhoneConfirmation;

            #endregion

            SettingsMain.RegistrationIsProhibited = _model.ProhibitRegistration;
            
            SettingsMain.LoginDisplayMode = _model.LoginDisplayMode;
            
            SettingsMain.CheckoutLoginDisplayMode = _model.CheckoutLoginDisplayMode;
            
            SettingsMain.SkipEmailConfirmation = _model.SkipEmailConfirmation;

            SettingsAuth.EmailAuthType = _model.EmailAuthType;

            #region License
            if (!Saas.SaasDataService.IsSaasEnabled && !Trial.TrialService.IsTrialEnabled && _model.LicKey != SettingsLic.LicKey)
            {
                SettingsLic.Activate(_model.LicKey);
            }
            #endregion

            #region Customers Notifications

            //SettingsCheckout.IsShowUserAgreementTextValue = _model.ShowUserAgreementText;
            //SettingsCheckout.UserAgreementText = _model.UserAgreementText;
            //SettingsDesign.DisplayCityBubble = _model.DisplayCityBubble;
            //SettingsNotifications.ShowCookiesPolicyMessage = _model.ShowCookiesPolicyMessage;
            //SettingsNotifications.CookiesPolicyMessage = _model.CookiesPolicyMessage;

            #endregion

            #region Applications

            //SettingsMain.StoreActive = _model.StoreActive;
            //SettingsLandingPage.ActiveLandingPage = _model.LandingActive;
            //SettingsMain.BonusAppActive = _model.BonusActive;
            //SettingsCrm.CrmActive = _model.CrmActive;
            //SettingsTasks.TasksActive = _model.TasksActive;
            //SettingsMain.BookingActive = _model.BookingActive;
            //SettingsMain.TriggersActive = _model.TriggersActive;
            //SettingsMain.PartnersActive = _model.PartnersActive;

            #endregion

            #region BonusSystem

            SettingsMain.BonusAppActive = _model.BonusAppActive;
            new ChangeBonusSystemHandler(_model.ActiveBonusSystemModule).Execute();

            #endregion BonusSystem

            SettingsFeatures.EnableExperimentalFeatures = _model.EnableExperimentalFeatures;

            var oldFeatureWarmupValue = FeaturesService.IsEnabled(EFeature.Warmup);
            
            Enum.GetValues(typeof(EFeature)).Cast<EFeature>().ToList()
                .ForEach(feature => SettingsFeatures.SetFeatureEnabled(feature, _model.Features.ContainsKey(feature.ToString()) ? _model.Features[feature.ToString()] : false));
            
            if (!oldFeatureWarmupValue && FeaturesService.IsEnabled(EFeature.Warmup))
                ViewsWarmupService.Start();

            SettingsGeneral.AllowSearchBotsFromOtherCountries = _model.AllowSearchBotsFromOtherCountries;

            //var dashboard = EFeature.NewDashboard.ToString();
            //if (_model.Features.ContainsKey(dashboard) && _model.Features[dashboard])
            //{
            //    var channelStore = SalesChannelService.GetByType(ESalesChannelType.Store);
            //    if (channelStore != null)
            //        channelStore.Enabled = true;

            //    var channelFunnel = SalesChannelService.GetByType(ESalesChannelType.Funnel);
            //    if (channelFunnel != null)
            //        channelFunnel.Enabled = true;
            //}

            if (!string.IsNullOrEmpty(_model.AdminAreaColorScheme))
                SettingsDesign.AdminAreaColorScheme = _model.AdminAreaColorScheme;

            AdminAreaTemplate.Template = _model.AdminAreaTemplate == "adminv2" ? "adminv2" : "adminv3";

            CacheManager.RemoveByPattern(LpConstants.LpTemplatesCachePrefix);
            CacheManager.RemoveByPattern(LpConstants.LandingCachePrefix);
        }
    }
}
