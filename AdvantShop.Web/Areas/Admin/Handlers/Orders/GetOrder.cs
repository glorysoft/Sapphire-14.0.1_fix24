using System.Linq;
using AdvantShop.Configuration;
using AdvantShop.Core.Common.Extensions;
using AdvantShop.Core.Services.Attachments;
using AdvantShop.Core.Services.Bonuses;
using AdvantShop.Core.Services.Bonuses.Internal;
using AdvantShop.Core.Services.Landing;
using AdvantShop.Core.Services.Loging.TrafficSource;
using AdvantShop.Core.Services.Orders;
using AdvantShop.Customers;
using AdvantShop.Helpers;
using AdvantShop.Orders;
using AdvantShop.Repository.Currencies;
using AdvantShop.Web.Admin.Models.Orders.OrdersEdit;

namespace AdvantShop.Web.Admin.Handlers.Orders
{
    public class GetOrder
    {
        private readonly string _customerId;
        private readonly string _phone;
        private readonly bool _isEditMode;
        private readonly int _orderId;

        public GetOrder(string customerId, string phone)
        {
            _customerId = customerId;
            _phone = phone;
        }

        public GetOrder(bool isEditMode, int orderId)
        {
            _isEditMode = isEditMode;
            _orderId = orderId;
        }

        public OrderModel Execute()
        {
            var currentManager = ManagerService.GetManager(CustomerContext.CustomerId);

            var model = new OrderModel()
            {
                IsEditMode = _isEditMode,
                OrderId = _orderId,
                Order = new Order
                {
                    ManagerId = currentManager != null ? currentManager.ManagerId : (int?)null,
                    IsDraft = true
                }
            };
            model.Order.OrderCustomer = new OrderCustomer { CustomerType = model.ShowCustomerType || SettingsCustomers.IsRegistrationAsPhysicalEntity ? CustomerType.PhysicalEntity : CustomerType.LegalEntity };

            if (!string.IsNullOrEmpty(_customerId) || !string.IsNullOrWhiteSpace(_phone))
                GetByCustomer(model);

            if (!_isEditMode)
                return model;

            var order = OrderService.GetOrder(_orderId);
            if (order == null || !OrderService.CheckAccess(order))
                return null;
            
            // если сотруднику назначены склады и в заказе нет ни одного товара с этого склада,
            // то сотрудник не должен видеть заказ
            if (_isEditMode && !OrderService.CheckAccessForEmployeeWithAssignedWarehouses(order))
                return null;
            
            model.Order = order;

            model.PrevOrderId = OrderService.GetPrevOrder(order.OrderID, !CustomerContext.CurrentCustomer.IsAdmin ? currentManager : null);
            model.NextOrderId = OrderService.GetNextOrder(order.OrderID, !CustomerContext.CurrentCustomer.IsAdmin ? currentManager : null);

            if (order.OrderCurrency != null)
            {
                model.OrderCurrency = order.OrderCurrency;
                var currency = CurrencyService.GetAllCurrencies(true).FirstOrDefault(x => x.Iso3 == model.OrderCurrency.Iso3);
                if (currency != null)
                    model.OrderCurrency.Name = currency.Name;
            }

            if (order.OrderCustomer != null)
            {
                model.Customer = CustomerService.GetCustomer(order.OrderCustomer.CustomerID);
            }

            if (model.Customer == null && order.LinkedCustomerId != null)
            {
                model.LinkedCustomer =  CustomerService.GetCustomer(order.LinkedCustomerId.Value);
            }

            model.BonusCard = order.GetOrderBonusCard();
            model.InternalBonusCard = order.GetOrderInternalBonusCard();
            
            model.OrderTrafficSource = OrderTrafficSourceService.Get(order.OrderID, TrafficSourceType.Order);

            if (order.LpId != null)
                model.LpLink = new LpService().GetLpLink(order.LpId.Value);

            model.FilesHelpText = FileHelpers.GetFilesHelpText(AttachmentService.FileTypes[AttachmentType.AdminOrderFile], "15MB");
            model.AllowedFileExtensions = FileHelpers.GetAllowedFileExtensions(AttachmentService.FileTypes[AttachmentType.AdminOrderFile]).AggregateString(",");

            return model;
        }

        private void GetByCustomer(OrderModel model)
        {
            var customer = CustomerService.GetCustomer(_customerId.TryParseGuid());
            if (customer == null)
            {
                if (!string.IsNullOrEmpty(_phone))
                    customer = CustomerService.GetCustomersByPhone(_phone).FirstOrDefault();
            }

            if (customer == null)
            {
                model.Order.OrderCustomer = new OrderCustomer()
                {
                    Phone = _phone,
                    StandardPhone = StringHelper.ConvertToStandardPhone(_phone, true, true)
                };
                return;
            }

            model.Order.OrderCustomer = (OrderCustomer) customer;
            
            model.Customer = customer;
        }
    }
}
