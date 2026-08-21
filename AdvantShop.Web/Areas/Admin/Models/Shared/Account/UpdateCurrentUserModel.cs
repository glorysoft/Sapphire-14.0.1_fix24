using System;
using AdvantShop.Customers;
using AdvantShop.Web.Admin.Models.Settings.Users;

namespace AdvantShop.Web.Admin.Models.Shared.Account
{
    public class UpdateCurrentUserModel
    {
        public Guid CustomerId { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public string Phone { get; set; }
        public string Avatar { get; set; }
        public Guid? HeadCustomerId { get; set; }
        public DateTime? BirthDay { get; set; }
        public string City { get; set; }
        public int SortOrder { get; set; }
        public int? AssociatedManagerId { get; set; }
        public int? DepartmentId { get; set; }
        public string DepartmentName { get; set; }
        public string Position { get; set; }
        public string FullName { get; set; }
        public bool EditHimself { get; set; }
        public string Sign { get; set; }
        public string PhotoEncoded { get; set; }
        public string TwoFactorSecretKey { get; set; }
        public string TwoFactorQrCode { get; set; }
        public bool TwoFactorAuthEnabled { get; set; }
        public string TwoFactorAuthCode { get; set; }

        private Customer _customer;
        private Customer Customer => _customer ?? (_customer = CustomerService.GetCustomer(CustomerId));

        public AdminUserModel GetAdminUserModel() =>
            new AdminUserModel
            {
                CustomerId = CustomerId,
                CustomerRole = Customer.CustomerRole,
                FirstName = FirstName,
                LastName = LastName,
                Email = Email,
                Phone = Phone,
                Avatar = Avatar,
                HeadCustomerId = HeadCustomerId,
                BirthDay = BirthDay,
                Enabled = Customer.Enabled,
                City = City,
                SortOrder = SortOrder,
                AssociatedManagerId = AssociatedManagerId,
                DepartmentId = DepartmentId,
                DepartmentName = DepartmentName,
                Position = Position,
                FullName = FullName,
                EditHimself = EditHimself,
                Sign = Sign,
                PhotoEncoded = PhotoEncoded,
                TwoFactorSecretKey = TwoFactorSecretKey,
                TwoFactorQrCode = TwoFactorQrCode,
                TwoFactorAuthEnabled = TwoFactorAuthEnabled,
                TwoFactorAuthCode = TwoFactorAuthCode
            };
    }
}