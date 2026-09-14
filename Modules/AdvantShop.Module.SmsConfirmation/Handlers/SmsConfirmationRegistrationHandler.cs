using System.Web;
using AdvantShop.Configuration;
using AdvantShop.Core.Modules;
using AdvantShop.Customers;
using AdvantShop.Helpers;
using AdvantShop.Mails;
using AdvantShop.Core.Services.Mails;
using AdvantShop.Module.SmsConfirmation.Models;
using AdvantShop.Module.SmsConfirmation.Service;
using AdvantShop.Security;

namespace AdvantShop.Module.SmsConfirmation.Handlers
{
    public class SmsConfirmationRegistrationHandler
    {
        public Customer Register(SmsConfirmationCode  model)
        {
            var phone = HttpUtility.HtmlEncode(model.Phone);
            var customer = new Customer(CustomerGroupService.DefaultCustomerGroup)
            {
                Id = model.CustomerId,
                Password = StringHelper.GeneratePassword(8),
                FirstName = string.Empty,
                LastName = string.Empty,
                Patronymic = string.Empty,
                Phone = phone,
                StandardPhone = StringHelper.ConvertToStandardPhone(phone),
                EMail = SmsConfirmationService.GetEmailByPhone(phone),
                CustomerRole = Role.User
            };

            CustomerService.InsertNewCustomer(customer);
            //SmsConfirmationService.AuthorizeUser(customer, false, true);
            AuthorizeService.SignIn(customer.EMail, customer.Password, false, true);

            if (!CustomerContext.CurrentCustomer.IsVirtual)
            {
                var mail = new RegistrationMailTemplate(customer);
                MailService.SendMailNow(customer.Id, customer.EMail, mail);
                MailService.SendMailNow(SettingsMail.EmailForRegReport, mail, replyTo: customer.EMail);
            }

            ModulesExecuter.Registration(customer);

            return customer;
        }
    }
}