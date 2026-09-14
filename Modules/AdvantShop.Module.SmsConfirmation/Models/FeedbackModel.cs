
namespace AdvantShop.Module.SmsConfirmation.Models
{
    public class FeedbackModel
    {
        public string Name { get; set; }

        public string Email { get; set; }

        public string Phone { get; set; }

        public string Message { get; set; }

        public FeedbackModel() { }

        public FeedbackModel(Customers.Customer customer)
        {
            Name = customer.FirstName + " " + customer.LastName;
            Email = customer.EMail;
            Phone = customer.Phone;
            Message = "";
        }
    }
}
