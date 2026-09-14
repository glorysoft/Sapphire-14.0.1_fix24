namespace AdvantShop.Module.RemindAboutReceipt.Models
{
    public class FormRequestModel
    {
        public int Id { get; set; }

        public string Email { get; set; }

        public string Name { get; set; }

        public string Surname { get; set; }

        public string PhoneNumber { get; set; }

        public string Comment { get; set; }

        public string ProductOfferId { get; set; }

        public int ProductId { get; set; }

        public float OldPrice { get; set; }

        public bool SendNotification { get; set; }
        public bool Agreement { get; set; }
    }
}
