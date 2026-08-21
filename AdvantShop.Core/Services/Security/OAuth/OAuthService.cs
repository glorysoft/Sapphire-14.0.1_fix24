//--------------------------------------------------
// Project: AdvantShop.NET
// Web site: http:\\www.advantshop.net
//--------------------------------------------------

using System;
using System.Diagnostics;
using AdvantShop.Configuration;
using AdvantShop.Core.Common.Extensions;
using AdvantShop.Customers;
using AdvantShop.Mails;
using AdvantShop.Core.Services.Mails;
using Debug = AdvantShop.Diagnostics.Debug;

namespace AdvantShop.Security.OpenAuth
{
    public class OAuthService
    {
        public static void AuthOrRegCustomer(Customer customer)
        {
            AuthOrRegCustomer(customer, customer.EMail);
        }

        public static void AuthOrRegCustomer(Customer customer, string identifier)
        {
            if (!CustomerService.IsExistOpenIdLinkCustomer(identifier))
            {
                customer = GetCustomer(customer);
                if (customer == null)
                    return;
                
                CustomerService.AddOpenIdLinkCustomer(customer.Id, identifier);
            }
            else
            {
                customer = CustomerService.GetCustomerByOpenAuthIdentifier(identifier);
            }

            if (customer.EMail.IsNotEmpty())
            {
                AuthorizeService.SignIn(customer.EMail, customer.Password, true, true);
            }
            else if (customer.StandardPhone != null && customer.StandardPhone != 0)
            {
                AuthorizeService.SignInByPhone(customer.StandardPhone, customer.Password, true, true);
            }
        }

        private static Customer GetCustomer(Customer customer)
        {
            var customerByEmail = GetCustomerByEmail(customer);
            if (customerByEmail != null)
                return customerByEmail;

            var customerByPhone = GetCustomerByPhone(customer);
            if (customerByPhone != null)
                return customerByPhone;
            
            if (customer.EMail.IsNullOrEmpty())
                customer.EMail = Guid.NewGuid() + "@temp.adv";
                
            CustomerService.InsertNewCustomer(customer);

            if (customer.Id == Guid.Empty)
            {
                Debug.Log.Warn($"OAuth Не смогли добавить покупателя с почтой {customer.EMail} и телефоном {customer.StandardPhone}");
                return null;
            }

            customer = CustomerService.GetCustomer(customer.Id);
            MailService.SendMailNow(SettingsMail.EmailForRegReport, new RegistrationMailTemplate(customer));

            return customer;
        }

        private static Customer GetCustomerByEmail(Customer customer)
        {
            if (customer.EMail.IsNullOrEmpty())
                return null;
            
            return CustomerService.GetCustomerByEmail(customer.EMail);
        }
        
        private static Customer GetCustomerByPhone(Customer customer)
        {
            if (customer.StandardPhone == null || customer.StandardPhone == 0) 
                return null;
            
            return CustomerService.GetCustomerByPhone(customer.Phone, customer.StandardPhone);
        }
    }
}