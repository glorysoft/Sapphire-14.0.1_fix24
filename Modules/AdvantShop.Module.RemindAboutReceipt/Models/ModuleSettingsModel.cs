namespace AdvantShop.Module.RemindAboutReceipt.Models
{
    public class ModuleSettingsModel
    {
        public bool Active { get; set; }

        public bool ShowCommentInForm { get; set; }

        public bool ShowEmailInForm { get; set; }

        public bool ShowNameInForm { get; set; }

        public bool ShowSurnameInForm { get; set; }

        public bool ShowPhoneNumberInForm { get; set; }

        public string FormHeader { get; set; }

        public string AfterFormTextForUser { get; set; }

        public string MailSubject { get; set; }

        public string MailBody { get; set; }

        public bool CreateLead { get; set; }

        public int SalesFunnelId { get; set; }
    }
}
