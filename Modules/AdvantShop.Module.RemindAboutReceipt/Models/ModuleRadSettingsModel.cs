namespace AdvantShop.Module.RemindAboutReceipt.Models
{
    public class ModuleRadSettingsModel
    {
        public bool Active { get; set; }

        public bool ShowCommentInForm { get; set; }

        public bool ShowEmailInForm { get; set; }

        public bool ShowNameInForm { get; set; }

        public bool ShowSurnameInForm { get; set; }

        public bool ShowPhoneNumberInForm { get; set; }

        public string FormHeader { get; set; }

        public string AfterFormTextForUser { get; set; }

        public string TextForUser { get; set; }

        public bool CheckAmount { get; set; }

        public string ImagePath { get; set; }

        public string LetterSubject { get; set; }

        public string LetterBody { get; set; }

        public bool CreateLead { get; set; }

        public int SalesFunnelId { get; set; }
    }
}
