using AdvantShop.Core.Modules;

namespace AdvantShop.Module.RemindAboutReceipt.Service
{
    public class ModuleSettings
    {
        public static string ModuleID = RemindAboutReceipt.ModuleStringId;

        public static bool RarActive
        {
            get { return ModuleSettingsProvider.GetSettingValue<bool>("RarActive", ModuleID); }
            set { ModuleSettingsProvider.SetSettingValue("RarActive", value, ModuleID); }
        }

        public static bool ShowCommentInForm
        {
            get { return ModuleSettingsProvider.GetSettingValue<bool>("ShowCommentInForm", ModuleID); }
            set { ModuleSettingsProvider.SetSettingValue("ShowCommentInForm", value, ModuleID); }
        }

        public static bool ShowEmailInForm
        {
            get { return ModuleSettingsProvider.GetSettingValue<bool>("ShowEmailInForm", ModuleID); }
            set { ModuleSettingsProvider.SetSettingValue("ShowEmailInForm", value, ModuleID); }
        }

        public static bool ShowNameInForm
        {
            get { return ModuleSettingsProvider.GetSettingValue<bool>("ShowNameInForm", ModuleID); }
            set { ModuleSettingsProvider.SetSettingValue("ShowNameInForm", value, ModuleID); }
        }

        public static bool ShowSurnameInForm
        {
            get { return ModuleSettingsProvider.GetSettingValue<bool>("ShowSurnameInForm", ModuleID); }
            set { ModuleSettingsProvider.SetSettingValue("ShowSurnameInForm", value, ModuleID); }
        }

        public static bool ShowPhoneNumberInForm
        {
            get { return ModuleSettingsProvider.GetSettingValue<bool>("ShowPhoneNumberInForm", ModuleID); }
            set { ModuleSettingsProvider.SetSettingValue("ShowPhoneNumberInForm", value, ModuleID); }
        }

        public static string FormHeader
        {
            get { return ModuleSettingsProvider.GetSettingValue<string>("FormHeader", ModuleID); }
            set { ModuleSettingsProvider.SetSettingValue("FormHeader", value, ModuleID); }
        }
        
        public static string AfterFormTextForUser
        {
            get { return ModuleSettingsProvider.GetSettingValue<string>("AfterFormTextForUser", ModuleID); }
            set { ModuleSettingsProvider.SetSettingValue("AfterFormTextForUser", value, ModuleID); }
        }

        public static int OrderSourseId
        {
            get { return ModuleSettingsProvider.GetSettingValue<int>("OrderSourseId", ModuleID); }
            set { ModuleSettingsProvider.SetSettingValue("OrderSourseId", value, ModuleID); }
        }

        public static int MailForUserId
        {
            get { return ModuleSettingsProvider.GetSettingValue<int>("MailForUserId", ModuleID); }
            set { ModuleSettingsProvider.SetSettingValue("MailForUserId", value, ModuleID); }
        }

        public static string PromoHelpEmail
        {
            get { return ModuleSettingsProvider.GetSettingValue<string>("PromoHelpEmail", ModuleID); }
            set { ModuleSettingsProvider.SetSettingValue("PromoHelpEmail", value, ModuleID); }
        }

        public static string MailSubject
        {
            get { return ModuleSettingsProvider.GetSettingValue<string>("MailSubject", ModuleID); }
            set { ModuleSettingsProvider.SetSettingValue("MailSubject", value, ModuleID); }
        }

        public static string MailBody
        {
            get { return ModuleSettingsProvider.GetSettingValue<string>("MailBody", ModuleID); }
            set { ModuleSettingsProvider.SetSettingValue("MailBody", value, ModuleID); }
        }

        public static bool CreateLead
        {
            get { return ModuleSettingsProvider.GetSettingValue<bool>("CreateLead", ModuleID); }
            set { ModuleSettingsProvider.SetSettingValue("CreateLead", value, ModuleID); }
        }

        public static int SalesFunnelId
        {
            get { return ModuleSettingsProvider.GetSettingValue<int>("SalesFunnelId", ModuleID); }
            set { ModuleSettingsProvider.SetSettingValue("SalesFunnelId", value, ModuleID); }
        }

        #region discount 

        public static bool RadActive
        {
            get { return ModuleSettingsProvider.GetSettingValue<bool>("RadActive", ModuleID); }
            set { ModuleSettingsProvider.SetSettingValue("RadActive", value, ModuleID); }
        }

        public static bool RadShowCommentInForm
        {
            get { return ModuleSettingsProvider.GetSettingValue<bool>("RadShowCommentInForm", ModuleID); }
            set { ModuleSettingsProvider.SetSettingValue("RadShowCommentInForm", value, ModuleID); }
        }

        public static bool RadShowEmailInForm
        {
            get { return ModuleSettingsProvider.GetSettingValue<bool>("RadShowEmailInForm", ModuleID); }
            set { ModuleSettingsProvider.SetSettingValue("RadShowEmailInForm", value, ModuleID); }
        }

        public static bool RadShowNameInForm
        {
            get { return ModuleSettingsProvider.GetSettingValue<bool>("RadShowNameInForm", ModuleID); }
            set { ModuleSettingsProvider.SetSettingValue("RadShowNameInForm", value, ModuleID); }
        }

        public static bool RadShowSurnameInForm
        {
            get { return ModuleSettingsProvider.GetSettingValue<bool>("RadShowSurnameInForm", ModuleID); }
            set { ModuleSettingsProvider.SetSettingValue("RadShowSurnameInForm", value, ModuleID); }
        }

        public static bool RadShowPhoneNumberInForm
        {
            get { return ModuleSettingsProvider.GetSettingValue<bool>("RadShowPhoneNumberInForm", ModuleID); }
            set { ModuleSettingsProvider.SetSettingValue("RadShowPhoneNumberInForm", value, ModuleID); }
        }

        public static string RadFormHeader
        {
            get { return ModuleSettingsProvider.GetSettingValue<string>("RadFormHeader", ModuleID); }
            set { ModuleSettingsProvider.SetSettingValue("RadFormHeader", value, ModuleID); }
        }

        public static bool RadCheckAmount
        {
            get { return ModuleSettingsProvider.GetSettingValue<bool>("RadCheckAmount", ModuleID); }
            set { ModuleSettingsProvider.SetSettingValue("RadCheckAmount", value, ModuleID); }
        }
        
        public static string RadAfterFormTextForUser
        {
            get { return ModuleSettingsProvider.GetSettingValue<string>("RadAfterFormTextForUser", ModuleID); }
            set { ModuleSettingsProvider.SetSettingValue("RadAfterFormTextForUser", value, ModuleID); }
        }

        public static int RadOrderSourseId
        {
            get { return ModuleSettingsProvider.GetSettingValue<int>("RadOrderSourseId", ModuleID); }
            set { ModuleSettingsProvider.SetSettingValue("RadOrderSourseId", value, ModuleID); }
        }

        public static int RadMailForUserId
        {
            get { return ModuleSettingsProvider.GetSettingValue<int>("RadMailForUserId", ModuleID); }
            set { ModuleSettingsProvider.SetSettingValue("RadMailForUserId", value, ModuleID); }
        }
        public static string RadTextForUser
        {
            get { return ModuleSettingsProvider.GetSettingValue<string>("RadTextForUser", ModuleID); }
            set { ModuleSettingsProvider.SetSettingValue("RadTextForUser", value, ModuleID); }
        }

        public static string RadImagePath
        {
            get { return ModuleSettingsProvider.GetSettingValue<string>("RadImagePath", ModuleID); }
            set { ModuleSettingsProvider.SetSettingValue("RadImagePath", value, ModuleID); }
        }

        public static string RadLetterSubject
        {
            get { return ModuleSettingsProvider.GetSettingValue<string>("RadLetterSubject", ModuleID); }
            set { ModuleSettingsProvider.SetSettingValue("RadLetterSubject", value, ModuleID); }
        }
        public static string RadLetterBody
        {
            get { return ModuleSettingsProvider.GetSettingValue<string>("RadLetterBody", ModuleID); }
            set { ModuleSettingsProvider.SetSettingValue("RadLetterBody", value, ModuleID); }
        }

        public static bool RadCreateLead
        {
            get { return ModuleSettingsProvider.GetSettingValue<bool>("RadCreateLead", ModuleID); }
            set { ModuleSettingsProvider.SetSettingValue("RadCreateLead", value, ModuleID); }
        }

        public static int RadSalesFunnelId
        {
            get { return ModuleSettingsProvider.GetSettingValue<int>("RadSalesFunnelId", ModuleID); }
            set { ModuleSettingsProvider.SetSettingValue("RadSalesFunnelId", value, ModuleID); }
        }

        #endregion

        public static bool SetDefaultSettings()
        {
            if (!ModuleSettingsProvider.IsSqlSettingExist("RarActive", ModuleID))
                RarActive = true;

            if (!ModuleSettingsProvider.IsSqlSettingExist("ShowCommentInForm", ModuleID))
                ShowCommentInForm = false;

            if (!ModuleSettingsProvider.IsSqlSettingExist("FormHeader", ModuleID))
                FormHeader = "Оставьте заявку, и мы пришлем Вам ссылку на электронную почту, когда товар появится в наличии";

            if (!ModuleSettingsProvider.IsSqlSettingExist("ShowCommentInForm", ModuleID))
                ShowCommentInForm = false;

            if (!ModuleSettingsProvider.IsSqlSettingExist("ShowNameInForm", ModuleID))
                ShowNameInForm = true;

            if (!ModuleSettingsProvider.IsSqlSettingExist("ShowEmailInForm", ModuleID))
                ShowEmailInForm = true;

            if (!ModuleSettingsProvider.IsSqlSettingExist("ShowSurnameInForm", ModuleID))
                ShowSurnameInForm = false;

            if (!ModuleSettingsProvider.IsSqlSettingExist("ShowPhoneNumberInForm", ModuleID))
                ShowPhoneNumberInForm = false;

            if (!ModuleSettingsProvider.IsSqlSettingExist("CreateLead", ModuleID))
                CreateLead = false;

            if (!ModuleSettingsProvider.IsSqlSettingExist("SalesFunnelId", ModuleID))
                SalesFunnelId = -1;

            if (!ModuleSettingsProvider.IsSqlSettingExist("AfterFormTextForUser", ModuleID))
                AfterFormTextForUser = "Благодарим! Мы обязательно Вам напишем, когда товар будет в наличии!";

            if (!ModuleSettingsProvider.IsSqlSettingExist("MailSubject", ModuleID))
                MailSubject = "Уведомление о поступлении товара";

            if (!ModuleSettingsProvider.IsSqlSettingExist("MailBody", ModuleID))
                MailBody = "<div style='color:#4c4f56; font-family: Arial, Helvetica, sans-serif; font-size: 15px;'><div class='header' style='border-bottom: 1px solid #ededed; display: table; margin-bottom: 25px; padding-bottom: 25px; width: 100%;'><div class='logo' style='display: table-cell; text-align: left; vertical-align: middle;'>#LOGO#</div>" +
                "<div class='phone' style='display: table - cell; text - align: right; vertical - align: middle;'><div class='tel' style='font-size: 26px; font-weight: bold; line-height: 1; margin-bottom: 5px;'>&nbsp;</div>" +
                "<div class='inform' style='font-size: 15px;'><span style='line-height:115%'>Здравствуйте!</span></div></div></div>" +
                "<p>В интернет-магазине #SITE_NAME# Вы были подписаны на получение информации о поступлении в наличие товара:&nbsp;&nbsp;#PRODUCT_NAME#</p>" +
                "<p>Для покупки, перейдите по ссылке:&nbsp;<a href='#PRODUCT_LINK#'>#PRODUCT_LINK#<a></p>";

            PromoHelpEmail = "help@promo-z.ru";

            OrderSourseId = ModuleService.AddOrderSource();

            if (!ModuleSettingsProvider.IsSqlSettingExist("RadActive", ModuleID))
                RadActive = true;

            if (!ModuleSettingsProvider.IsSqlSettingExist("RadFormHeader", ModuleID))
                RadFormHeader = "Оставьте заявку, и мы пришлем Вам ссылку на электронную почту, когда цена на товар снизится!";

            if (!ModuleSettingsProvider.IsSqlSettingExist("RadShowCommentInForm", ModuleID))
                RadShowCommentInForm = false;

            if (!ModuleSettingsProvider.IsSqlSettingExist("RadShowNameInForm", ModuleID))
                RadShowNameInForm = true;

            if (!ModuleSettingsProvider.IsSqlSettingExist("RadShowEmailInForm", ModuleID))
                RadShowEmailInForm = true;
            
            if (!ModuleSettingsProvider.IsSqlSettingExist("RadShowSurnameInForm", ModuleID))
                RadShowSurnameInForm = false;

            if (!ModuleSettingsProvider.IsSqlSettingExist("RadImagePath", ModuleID))
                RadImagePath = "icon.png";

            if (!ModuleSettingsProvider.IsSqlSettingExist("RadShowPhoneNumberInForm", ModuleID))
                RadShowPhoneNumberInForm = false;

            if (!ModuleSettingsProvider.IsSqlSettingExist("RadCreateLead", ModuleID))
                RadCreateLead = false;

            if (!ModuleSettingsProvider.IsSqlSettingExist("RadSalesFunnelId", ModuleID))
                RadSalesFunnelId = -1;

            if (!ModuleSettingsProvider.IsSqlSettingExist("RadAfterFormTextForUser", ModuleID))
                RadAfterFormTextForUser = "Благодарим! Мы обязательно Вам напишем, когда цена на товар снизится!";

            if (!ModuleSettingsProvider.IsSqlSettingExist("RadTextForUser", ModuleID))
                RadTextForUser = "Узнать о снижении цены";

            if (!ModuleSettingsProvider.IsSqlSettingExist("RadCheckAmount", ModuleID))
                RadCheckAmount = true;

            if (!ModuleSettingsProvider.IsSqlSettingExist("RadLetterSubject", ModuleID))
                RadLetterSubject = "Цена снижена!";

            if (!ModuleSettingsProvider.IsSqlSettingExist("RadLetterBody", ModuleID))
                RadLetterBody = "<div style=\"color:#4c4f56; font-family: Arial, Helvetica, sans-serif; font-size: 15px;\"><div class=\"header\" style=\"border-bottom: 1px solid #ededed; display: table; margin-bottom: 25px; padding-bottom: 25px; width: 100%;\"><div class=\"logo\" style=\"display: table-cell; text-align: left; vertical-align: middle;\">#LOGO#</div><div class=\"phone\" style=\"display: table - cell; text - align: right; vertical - align: middle;\"><div class=\"tel\" style=\"font-size: 26px; font-weight: bold; line-height: 1; margin-bottom: 5px;\">&nbsp;</div><div class=\"inform\" style=\"font-size: 15px;\"><span style = \"line-height:115%\"> Здравствуйте! </span></div></div></div> <p> В интернет-магазине <a href=\"#SHOPURL#\">#SHOPURL#</a> Вы были подписаны на получение информации о снижении цены на товар:&nbsp;#PRODUCTNAME#</p><p>Для покупки, перейдите по ссылке:&nbsp;<a href =\"#PRODUCTLINK#\">#PRODUCTLINK#</a></p></div>";
            
            ModuleService.RadSetDefaultImage();

            //ModuleService.CreateMailFormat();

            return true;
        }

        public static bool RemoveSettings()
        {
            //MailFormatService.Delete(MailForUserId);

            ModuleService.DeleteOrderSource();

            return true;
        }
    }
}
