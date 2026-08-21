using AdvantShop.Core.Services.Triggers;
using AdvantShop.Customers;
using AdvantShop.Helpers;

namespace AdvantShop.Core.Services.Customers
{
    public sealed class CustomerWithLastOrderDto : Customer, ITriggerObject
    {
        public int LastOrderId { get; set; }

        public CustomerWithLastOrderDto(Customer customer)
        {
            Id = customer.Id;
            CustomerGroupId = customer.CustomerGroupId;
            EMail = customer.EMail;
            FirstName = customer.FirstName;
            LastName = customer.LastName;
            Patronymic = customer.Patronymic;
            RegistrationDateTime = customer.RegistrationDateTime;
            Phone = customer.Phone;
            StandardPhone = customer.StandardPhone;
            Password = customer.Password;
            CustomerRole = customer.CustomerRole;
            AdminComment = customer.AdminComment;
            ManagerId = customer.ManagerId;
            Rating = customer.Rating;
            Avatar = customer.Avatar;
            Enabled = customer.Enabled;
            HeadCustomerId = customer.HeadCustomerId;
            BirthDay = customer.BirthDay;
            City = customer.City;
            InnerId = customer.InnerId;
            SortOrder = customer.SortOrder;
            Organization = customer.Organization;
            ClientStatus = customer.ClientStatus;
            RegisteredFrom = customer.RegisteredFrom;
            RegisteredFromIp = customer.RegisteredFromIp;
            CustomerType = customer.CustomerType;
            RegistredUser = true;
        }


        public new TriggerProcessObject GetTriggerProcessObject()
        {
            return new TriggerProcessObject()
            {
                CustomerId = Id,
                Email = EMail,
                Phone = StandardPhone ?? StringHelper.ConvertToStandardPhone(Phone) ?? 0,
                EntityId = LastOrderId
            };
        }
    }
}