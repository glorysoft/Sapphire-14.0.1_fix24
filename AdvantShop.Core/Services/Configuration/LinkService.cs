using System;

namespace AdvantShop.Configuration
{
    public static class LinkService
    {
        public static class Internal
        {
            public static string BasePlatform => 
                GetLink("BasePlatformUrl");

            public static string DomainService => 
                GetLink("DomainServiceUrl");

            public static string AccountPlatform => 
                GetLink("AccountPlatformUrl");
            
            public static string AccountPlatformNotSecure =>
                GetLink("AccountPlatformNotSecureUrl");

            public static string GeoIPService => 
                GetLink("GeoIPServiceUrl");

            public static string EmailService => 
                GetLink("EmailServiceUrl");

            public static string ImageService => 
                GetLink("ImageServiceUrl");

            public static string WebpDownGraderService => 
                GetLink("WebpDownGraderServiceUrl");
        
            public static string PaymentTBankRegistrationService => 
                GetLink("PaymentTBankRegistrationServiceUrl");
        
            public static string CdnFonts => 
                GetLink("CdnFontsUrl");
        
            public static string CdnDesign => 
                GetLink("CdnDesignUrl");

            public static string CdnImages => 
                GetLink("CdnImagesUrl");

            public static string RedirectService => 
                GetLink("RedirectServiceUrl");

            public static string ApiService => 
                GetLink("ApiServiceUrl");

            public static string PushService => 
                GetLink("PushServiceeUrl");
            
            public static string ApiServiceNotSecure => 
                GetLink("ApiServiceNotSecureUrl");
            
            public static string ActivityService => 
                GetLink("ActivityServiceUrl");
            
            public static string ActivityEmailLogService =>
                GetLink("ActivityEmailLogServiceUrl");
            
            public static string ActivityPushLogService =>
                GetLink("ActivityPushLogServiceUrl");
            
            public static string ActivitySmsLogService =>
                GetLink("ActivitySmsLogServiceUrl");
            
            public static string ActivityTriggerLogService =>
                GetLink("ActivityTriggerLogServiceUrl");
            
            public static string ScreenshotService =>
                GetLink("ScreenshotServiceUrl");
            
            public static string ImageStack =>
                GetLink("ImageStackUrl");
            
            public static string Yahont =>
                GetLink("YahontUrl");
        }

        public static class OAuth
        {
            public static string Yandex => 
                GetLink("YandexOAuth");
            
            public static string LoginYandex => 
                GetLink("LoginYandexOAuth");

            public static string Vk => 
                GetLink("VkOAuth");

            public static string VkId => 
                GetLink("VkIdOAuth");
            
            public static string Ok => 
                GetLink("OkOAuth");

            public static string Mail =>
                GetLink("MailOAuth");

            public static string Google =>
                GetLink("GoogleOAuth");

            public static string Advantshop => 
                GetLink("AdvantshopOAuth");
        }

        public static class ExternalApi
        {
            public static string Vk => 
                GetLink("VkExternalApi");

            public static string Ok => 
                GetLink("OkExternalApi");

            public static string Google => 
                GetLink("GoogleExternalApi");
            
            public static string Facebook => 
                GetLink("FacebookExternalApi");

            public static string YandexMaps => 
                GetLink("YandexMapsExternalApi");
            
            public static string GoogleMaps => 
                GetLink("GoogleMapsExternalApi");
            
            public static string YandexDelivery => 
                GetLink("YandexDeliveryExternalApi");

            public static string IntegrationCdek => 
                GetLink("IntegrationCdekExternalApi");

            public static string OzonSeller => 
                GetLink("OzonSellerExternalApi");

            public static string Telegram => 
                GetLink("TelegramExternalApi");

            public static string Mango => 
                GetLink("MangoExternalApi");

            public static string Telphin => 
                GetLink("TelphinExternalApi");

            public static string Zadarma => 
                GetLink("ZadarmaExternalApi");

            public static string GoogleAnalytics => 
                GetLink("GoogleAnalyticsExternalApi");

            public static string YandexSpeller => 
                GetLink("YandexSpellerExternalApi");
            
            public static string Sipuni =>
                GetLink("SipuniExternalApi");
            
            public static string Cbr =>
                GetLink("CbrExternalApi");
        }

        public static class SocialMedia
        {
            public static string Facebook => 
                GetLink("FacebookSocialMedia");

            public static string WhatsApp => 
                GetLink("WhatsAppSocialMedia");

            public static string Viber => 
                GetLink("ViberSocialMedia");
            
            public static string Telegram => 
                GetLink("TelegramSocialMedia");
            
            public static string ViberChat => 
                GetLink("ViberChatSocialMedia");

            public static string SkypeChat => 
                GetLink("SkypeChatSocialMedia");

            public static string Vk =>
                GetLink("VkSocialMedia");
            
            public static string MetaMessenger => 
                GetLink("MetaMessengerSocialMedia");

            public static string Apple => 
                GetLink("AppleSocialMedia");
            
            public static string YouTube => 
                GetLink("YouTubeSocialMedia");
            
            public static string ShortYouTube => 
                GetLink("ShortYouTubeSocialMedia");

            public static string Ok => 
                GetLink("OkSocialMedia");
            
            public static string Instagram => 
                GetLink("InstagramSocialMedia");
            
            public static string GoogleSupport => 
                GetLink("GoogleSupportSocialMedia");
            
            public static string Twitter =>
                GetLink("TwitterSocialMedia");
            
            public static string YandexZen => 
                GetLink("YandexZenSocialMedia");

            public static string Rutube => 
                GetLink("RutubeSocialMedia");
            
            public static string Max => 
                GetLink("MaxSocialMedia");

            public static string Yandex => 
                GetLink("YandexSocialMedia");
            
            public static string VimeoImageCdn =>
                GetLink("VimeoImageCdnSocialMedia");
            
            public static string YouTubeImageCdn =>
                GetLink("YouTubeImageCdnSocialMedia");
        }

        public static class PaymentMethod
        {
            public static string OnPay => 
                GetLink("OnPayPaymentMethod");

            public static string PayAnyWay => 
                GetLink("PayAnyWayPaymentMethod");
            
            public static string Avangard =>
                GetLink("AvangardPaymentMethod");
            
            public static string IntellectMoney => 
                GetLink("IntellectMoneyPaymentMethod");

            public static string Interkassa2 => 
                GetLink("Interkassa2PaymentMethod");

            public static string InvoiceBox => 
                GetLink("InvoiceBoxPaymentMethod");

            public static string LiqPay => 
                GetLink("LiqPayPaymentMethod");

            public static string MasterBank => 
                GetLink("MasterBankPaymentMethod");

            public static string Paymaster => 
                GetLink("PaymasterPaymentMethod");
            
            public static string Platron => 
                GetLink("PlatronPaymentMethod");

            public static string Qiwi => 
                GetLink("QiwiPaymentMethod");

            public static string RsbCredit => 
                GetLink("RsbCreditPaymentMethod");

            public static string WalletOneCheckout => 
                GetLink("WalletOneCheckoutPaymentMethod");

            public static string WebMoney => 
                GetLink("WebMoneyPaymentMethod");
            
            public static class Assist
            {
                public static string Test => 
                    GetLink("TestAssistPaymentMethod");

                public static string Working => 
                    GetLink("WorkingAssistPaymentMethod");
            }

            public static class BePaid
            {
                public static string Checkout => 
                    GetLink("CheckoutBePaidPaymentMethod");
                
                public static string Gateway => 
                    GetLink("GatewayBePaidPaymentMethod");
                
                public static string Api => 
                    GetLink("ApiBePaidPaymentMethod");
            }

            public static class Alfabank
            {
                public static string TestMode => 
                    GetLink("TestModeAlfabankPaymentMethod");
                
                public static string Test2Mode => 
                    GetLink("Test2ModeAlfabankPaymentMethod");

                public static string TestByMode =>
                    GetLink("TestByModeAlfabankPaymentMethod");

                public static string Kz => 
                    GetLink("KzAlfabankPaymentMethod");
                
                public static string Ru => 
                    GetLink("RuAlfabankPaymentMethod");
                
                public static string RuNew => 
                    GetLink("RuNewAlfabankPaymentMethod");
                
                public static string Ru2 => 
                    GetLink("Ru2AlfabankPaymentMethod");

                public static string By =>
                    GetLink("ByAlfabankPaymentMethod");

                public static string Anketa => 
                    GetLink("AnketaAlfabankPaymentMethod");
                
                public static string Ua =>
                    GetLink("UaAlfabankPaymentMethod");
            }

            public static class Tinkoff
            {
                public static string Credit => 
                    GetLink("CreditTinkoffPaymentMethod");

                public static string General => 
                    GetLink("GeneralTinkoffPaymentMethod");
            }

            public static class Modulbank
            {
                public static string Pay => 
                    GetLink("PayModulbankPaymentMethod");

                public static string Api => 
                    GetLink("ApiModulbankPaymentMethod");
            }

            public static class Mokka
            {
                public static string Sandbox => 
                    GetLink("SandboxMokkaPaymentMethod");
                
                public static string Base => 
                    GetLink("BaseMokkaPaymentMethod");
            }

            public static class NetPay
            {
                public static string Test => 
                    GetLink("TestNetPayPaymentMethod");
                
                public static string Working => 
                    GetLink("WorkingNetPayPaymentMethod");
            }

            public static class PSBank
            {
                public static string Test => 
                    GetLink("TestPSBankPaymentMethod");
                
                public static string General => 
                    GetLink("GeneralPSBankPaymentMethod");
            }

            public static class PayOnline
            {
                public static string Qiwi => 
                    GetLink("QiwiPayOnlinePaymentMethod");

                public static string WebMoney => 
                    GetLink("WebMoneyPayOnlinePaymentMethod");

                public static string YandexMoney => 
                    GetLink("YandexMoneyPayOnlinePaymentMethod");

                public static string CreditCardEN => 
                    GetLink("CreditCardENPayOnlinePaymentMethod");
                
                public static string CreditCardRU => 
                    GetLink("CreditCardRUPayOnlinePaymentMethod");

                public static string Select => 
                    GetLink("SelectPayOnlinePaymentMethod");
            }
            
            public static class PayPalExpressCheckout
            {
                public static string Test => 
                    GetLink("TestPayPalExpressCheckoutPaymentMethod");
                
                public static string General => 
                    GetLink("GeneralPayPalExpressCheckoutPaymentMethod");

                public static string TestApi => 
                    GetLink("TestApiPayPalExpressCheckoutPaymentMethod");
                
                public static string GeneralApi => 
                    GetLink("GeneralApiPayPalExpressCheckoutPaymentMethod");
            }

            public static class Rbkmoney2
            {
                public static string Checkout => 
                    GetLink("CheckoutRbkmoney2PaymentMethod");
                
                public static string Api => 
                    GetLink("ApiRbkmoney2PaymentMethod");
            }

            public static class Robokassa
            {
                public static string Ru => 
                    GetLink("RuRobokassaPaymentMethod");
                
                public static string Kz => 
                    GetLink("KzRobokassaPaymentMethod");
            }

            public static class SberBankAcquiring
            {
                public static string Test => 
                    GetLink("TestSberBankAcquiringPaymentMethod");
                
                public static string General => 
                    GetLink("GeneralSberBankAcquiringPaymentMethod");
            }

            public static class WebPay
            {
                public static string Test => 
                    GetLink("TestWebPayPaymentMethod");
                
                public static string General => 
                    GetLink("GeneralWebPayPaymentMethod");
            }

            public static class Yandex
            {
                public static string Script => 
                    GetLink("ScriptYandexPaymentMethod");
                
                public static string General => 
                    GetLink("GeneralYandexPaymentMethod");

                public static string Api => 
                    GetLink("ApiYandexPaymentMethod");
            }

            public static class Thawani
            {
                public static string SandboxApi => 
                    GetLink("SandboxThawaniPaymentMethod");
                
                public static string BaseApi => 
                    GetLink("BaseThawaniPaymentMethod");
                
                public static string SandboxReturnUrl => 
                    GetLink("SandboxThawaniReturnUrl");
                
                public static string BaseReturnUrl => 
                    GetLink("BaseThawaniReturnUrl");
            }
        }

        public static class ShippingMethod
        {
            public static string OtpravkaPochta => 
                GetLink("OtpravkaPochtaShippingMethod");
            
            public static string TrackingPochta => 
                GetLink("TrackingPochtaShippingMethod");
            
            public static string YandexDostavka => 
                GetLink("YandexDostavkaShippingMethod");

            public static string DDelivery => 
                GetLink("DDeliveryShippingMethod");

            public static string FivePost => 
                GetLink("FivePostShippingMethod");

            public static string Hermes => 
                GetLink("HermesShippingMethod");

            public static string LPost => 
                GetLink("LPostShippingMethod");

            public static string Measoft => 
                GetLink("MeasoftShippingMethod");

            public static string NovaPoshta =>
                GetLink("NovaPoshtaShippingMethod");

            public static string Pec => 
                GetLink("PecShippingMethod");

            public static string PecEasyway => 
                GetLink("PecEasywayShippingMethod");

            public static string PickPoint =>
                GetLink("PickPointShippingMethod");

            public static string Sberlogistic => 
                GetLink("SberlogisticShippingMethod");

            public static string Shiptor => 
                GetLink("ShiptorShippingMethod");
            
            public static string Edost => 
                GetLink("EdostShippingMethod");
            
            public static string EmsPost => 
                GetLink("EmsPostShippingMethod");
            
            public static string Grastin => 
                GetLink("GrastinShippingMethod");
            
            public static string Usps => 
                GetLink("UspsShippingMethod");
            
            public static class ApiShip
            {
                public static string Test => 
                    GetLink("TestApiShipShippingMethod");
                
                public static string General => 
                    GetLink("GeneralApiShipShippingMethod");
            }

            public static class Dpd
            {
                public static string Geography => 
                    GetLink("GeographyDpdShippingMethod");
                
                public static string GeographyTest => 
                    GetLink("GeographyTestDpdShippingMethod");

                public static string Calculator => 
                    GetLink("CalculatorDpdShippingMethod");
                
                public static string CalculatorTest => 
                    GetLink("CalculatorTestDpdShippingMethod");
            }

            public static class Ozon
            {
                public static string Api => 
                    GetLink("ApiOzonShippingMethod");

                public static string Rocket => 
                    GetLink("RocketOzonShippingMethod");
            }

            public static class RussianPost
            {
                public static string Api => 
                    GetLink("ApiRussianPostShippingMethod");

                public static string Tariff => 
                    GetLink("TariffRussianPostShippingMethod");

                public static string Tracking => 
                    GetLink("TrackingRussianPostShippingMethod");
            }
            
            public static class Sdek
            {
                public static string Api => 
                    GetLink("ApiSdekShippingMethod");

                public static string GetCity =>
                    GetLink("GetCitySdekShippingMethod");
            }

            public static class Yandex
            {
                public static string B2B => 
                    GetLink("B2BYandexShippingMethod");

                public static string B2BTest =>
                    GetLink("B2BTestYandexShippingMethod");

                public static string Api => 
                    GetLink("ApiYandexShippingMethod");
            }

            public static class Boxberry
            {
                public static string ApiDe => 
                    GetLink("ApiDeBoxberryShippingMethod");

                public static string ApiRu => 
                    GetLink("ApiRuBoxberryShippingMethod");
            }
        }

        public static class Docs
        {
            public static string BePaid => 
                GetLink("BePaidDocs");
            
            public static string Facebook => 
                GetLink("FacebookDocs");
            
            public static string Yandex => 
                GetLink("YandexDocs");
        }
        
        private static string GetLink(string internalSettingKey)
        {
            if (string.IsNullOrWhiteSpace(internalSettingKey))
                throw new ArgumentNullException(nameof(internalSettingKey));

            var link = SettingProvider.GetInternalSetting(internalSettingKey);

            if (string.IsNullOrWhiteSpace(link))
                throw new Exception($"Link with key \"{internalSettingKey}\" was not found in the database.");
            
            return link.TrimEnd('/');
        }
    }
}