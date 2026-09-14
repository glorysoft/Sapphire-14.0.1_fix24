using System;
namespace AdvantShop.Module.SmsConfirmation.Models
{
    public enum ESmsConfirmationPageType
    {
        Login = 0,
        Registration,
        Checkout
    }

    public class SmsConfirmationCode
    {
        public Guid CustomerId { get; set; }

        public string Phone { get; set; }

        public string SmsCode { get; set; }

        public byte PageType { get; set; }

        public int Attempts { get; set; }

        /// <summary>Момент выдачи кода, от него считается срок жизни</summary>
        public DateTime CreatedAt { get; set; }
    }
}
