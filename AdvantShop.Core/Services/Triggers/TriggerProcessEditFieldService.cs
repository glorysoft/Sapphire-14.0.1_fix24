using System;
using System.Collections.Generic;
using System.Linq;
using AdvantShop.Catalog;
using AdvantShop.Core.Common.Extensions;
using AdvantShop.Core.Primitives;
using AdvantShop.Core.Services.Bonuses;
using AdvantShop.Core.Services.ChangeHistories;
using AdvantShop.Core.Services.Crm;
using AdvantShop.Core.Services.Crm.BusinessProcesses;
using AdvantShop.Core.Services.Crm.BusinessProcesses.Customers;
using AdvantShop.Core.Services.Crm.DealStatuses;
using AdvantShop.Core.Services.Customers;
using AdvantShop.Core.Services.Localization;
using AdvantShop.Core.Services.Loging.Triggers.Logs;
using AdvantShop.Customers;
using AdvantShop.Orders;
using AdvantShop.Payment;
using AdvantShop.Shipping;

namespace AdvantShop.Core.Services.Triggers
{
    public sealed class TriggerProcessEditFieldService
    {
        private static string Basis(TriggerRule trigger) => 
            $"Триггер {trigger.Name}";
        
        private static OrderChangedBy OrderChangedBy(TriggerRule trigger) => 
            new OrderChangedBy(Basis(trigger));
        
        private static ChangedBy ChangedBy(TriggerRule trigger) => 
            new ChangedBy(Basis(trigger));
        
        private readonly List<TriggerEditFieldLog> _logChanges = new List<TriggerEditFieldLog>();
        
        public bool EditField(
            TriggerRule trigger, 
            TriggerAction action, 
            ITriggerObject triggerObject,
            ITriggerLogger logger
        )
        {
            switch (trigger.EventType)
            {
                case ETriggerEventType.OrderCreated:
                case ETriggerEventType.OrderStatusChanged:
                case ETriggerEventType.OrderPaied:
                {
                    var orderField = (EOrderFieldType) action.EditField.Type;
                    var order = (Order) triggerObject;
                    var customer = CustomerService.GetCustomer(order.OrderCustomer.CustomerID);
                    var customerExist = customer != null;

                    if (!customerExist)
                        customer = (Customer) order.OrderCustomer;

                    EditFieldOrder(action, orderField, order, customer, trigger);
                    EditFieldCustomerContact(action, TriggerCustomerContactFieldType.Create(orderField),  customer.Id, trigger);

                    if (customerExist)
                        CustomerService.UpdateCustomer(customer, changedBy: ChangedBy(trigger));
                    
                    break;
                }

                case ETriggerEventType.LeadCreated:
                case ETriggerEventType.LeadStatusChanged:
                {
                    var leadField = (ELeadFieldType) action.EditField.Type;
                    var lead = (Lead) triggerObject;
                    var leadCustomer = lead.Customer ?? new Customer();

                    EditFieldLead(action, leadField, lead, leadCustomer, trigger);
                    EditFieldCustomerContact(action, TriggerCustomerContactFieldType.Create(leadField),  leadCustomer.Id, trigger);
                    
                    break;
                }
                case ETriggerEventType.CustomerCreated:
                case ETriggerEventType.TimeFromLastOrder:
                case ETriggerEventType.SignificantDate:
                case ETriggerEventType.SignificantCustomerDate:
                case ETriggerEventType.InstallMobileApp:
                {
                    var customerField = (ECustomerFieldType) action.EditField.Type;
                    var customer = (Customer) triggerObject;
                    
                    EditFieldCustomer(action, customerField, customer, trigger);
                    EditFieldCustomerContact(action, TriggerCustomerContactFieldType.Create(customerField), customer.Id, trigger);

                    break;
                }
                
                default:
                {
                    logger.Error(TriggerLogEventType.Edit, $"Неизвестное событие {trigger.EventType}", action.Id);
                    throw new BlException("Wrong type " + trigger.EventType);
                }
            }

            logger.Success(
                TriggerLogEventType.Edit,
                action.Id,
                _logChanges.Select(x => x.ToKeyValue()).ToList()
            );

            return true;
        }
        
        private void EditFieldCustomer(
            TriggerAction action, 
            ECustomerFieldType customerField, 
            Customer customer,
            TriggerRule trigger
        )
        {
            var newValue = action.EditField.EditFieldValue;
            
            switch (customerField)
            {
                case ECustomerFieldType.LastName:
                    _logChanges.Add(new TriggerEditFieldLog(customerField, customer.LastName, newValue));
                    customer.LastName = newValue;
                    break;
                
                case ECustomerFieldType.FirstName:
                    _logChanges.Add(new TriggerEditFieldLog(customerField, customer.FirstName, newValue));
                    customer.FirstName = newValue;
                    break;
                
                case ECustomerFieldType.Patronymic:
                    _logChanges.Add(new TriggerEditFieldLog(customerField, customer.Patronymic, newValue));
                    customer.Patronymic = newValue;
                    break;
                
                case ECustomerFieldType.Email:
                    _logChanges.Add(new TriggerEditFieldLog(customerField, customer.EMail, newValue));
                    customer.EMail = newValue;
                    break;
                
                case ECustomerFieldType.Phone:
                    _logChanges.Add(new TriggerEditFieldLog(customerField, customer.Phone, newValue));
                    customer.Phone = newValue;
                    break;
                
                case ECustomerFieldType.CustomerGroup:
                    var groupId = newValue.TryParseInt(true);
                    var group = groupId.HasValue ? CustomerGroupService.GetCustomerGroup(groupId.Value) : null;
                    if (group != null)
                    {
                        _logChanges.Add(new TriggerEditFieldLog(customerField,
                            CustomerGroupService.GetCustomerGroup(customer.CustomerGroupId)?.GroupName,
                            group.GroupName));
                        customer.CustomerGroupId = group.CustomerGroupId;
                    }
                    break;
                
                case ECustomerFieldType.CustomerField:
                    if (action.EditField.ObjId.HasValue)
                    {
                        CustomerFieldService.AddUpdateMap(
                            customer.Id,
                            action.EditField.ObjId.Value,
                            newValue ?? "",
                            true,
                            onTrackChanges: (fieldName, oldValue) =>
                                _logChanges.Add(new TriggerEditFieldLog(fieldName, oldValue, newValue))
                        );
                    }
                    break;
                
                case ECustomerFieldType.Organization:
                    _logChanges.Add(new TriggerEditFieldLog(customerField, customer.Organization, newValue));
                    customer.Organization = newValue;
                    break;
                
                case ECustomerFieldType.CustomerType:
                    var customerType = (CustomerType)newValue.TryParseInt(true);
                    _logChanges.Add(new TriggerEditFieldLog(customerField, customer.CustomerType.Localize(), customerType.Localize()));
                    customer.CustomerType = customerType;
                    break;
                
                case ECustomerFieldType.Manager:
                    var managerId = newValue.TryParseInt(true);
                    var manager = managerId.HasValue ? ManagerService.GetManager(managerId.Value) : null;
                    if (manager != null)
                    {
                        var prevManager = customer.ManagerId != null
                            ? ManagerService.GetManager(customer.ManagerId.Value)
                            : null;
                        
                        _logChanges.Add(new TriggerEditFieldLog(customerField, prevManager?.FullName, manager.FullName));
                        customer.ManagerId = manager.ManagerId;
                    }
                    break;
                
                case ECustomerFieldType.BonusAccount:
                    if (!BonusSystem.IsActive)
                    {
                        _logChanges.Add(new TriggerEditFieldLog(customerField, "Бонусная не активна"));
                        break;
                    }

                    if (action.EditField.Params == null)
                    {
                        _logChanges.Add(new TriggerEditFieldLog(customerField, "Действие триггера не настроено"));
                        break;
                    }
                    
                    var sum = newValue.TryParseInt();
                    if (sum <= 0)
                    {
                        _logChanges.Add(new TriggerEditFieldLog(customerField, "Сумма <= 0"));
                        break;
                    }

                    // Реализует или нет бонусная списание/начисление, можно через BonusSystem.ImplementIBonusService
                    
                    if (action.EditField.Params.BonusOperationType == EnEditFieldBonusOperationType.AddBonus)
                    {
                        var result = BonusSystem.AddBonuses(
                            customer,
                            sum,
                            $"{trigger.EventType.DescriptionKey()} - {trigger.Name}");
                        
                        _logChanges.Add(result
                            ? new TriggerEditFieldLog($"Начислить бонусы {customer?.GetFullName()}", null, sum)
                            : new TriggerEditFieldLog($"Начислить бонусы {customer?.GetFullName()}", null,"не было начисления"));
                    }
                    else if (action.EditField.Params.BonusOperationType == EnEditFieldBonusOperationType.SubstractBonus)
                    {
                        var result = BonusSystem.RemoveBonuses(
                            customer,
                            sum,
                            $"{trigger.EventType.DescriptionKey()} - {trigger.Name}");
                        
                        _logChanges.Add(result
                            ? new TriggerEditFieldLog($"Списать бонусы {customer?.GetFullName()}", null, sum)
                            : new TriggerEditFieldLog($"Списать бонусы {customer?.GetFullName()}", null,"не было списания"));
                    }
                    break;
                
                case ECustomerFieldType.ReferralBonusAccount:
                    if (!BonusSystem.IsActive)
                    {
                        _logChanges.Add(new TriggerEditFieldLog(customerField, "Бонусная не активна"));
                        break;
                    }

                    if (action.EditField.Params == null)
                    {
                        _logChanges.Add(new TriggerEditFieldLog(customerField, "Действие триггера не настроено"));
                        break;
                    }
                    
                    var sumForReferral = newValue.TryParseInt();
                    if (sumForReferral <= 0)
                    {
                        _logChanges.Add(new TriggerEditFieldLog(customerField, "Сумма <= 0"));
                        break;
                    }

                    var referralCustomerId = ReferralService.GetReferralCustomerId(customer.Id);
                    if (referralCustomerId == null)
                    {
                        _logChanges.Add(new TriggerEditFieldLog(customerField, "Покупатель не найден"));
                        break;
                    }

                    var referralCustomer = CustomerService.GetCustomer(referralCustomerId.Value);
                    if (referralCustomer == null)
                    {
                        _logChanges.Add(new TriggerEditFieldLog(customerField, "Покупатель не найден"));
                        break;
                    }

                    // Реализует или нет бонусная списание/начисление, можно через BonusSystem.ImplementIBonusService
                    
                    if (action.EditField.Params.BonusOperationType == EnEditFieldBonusOperationType.AddBonus)
                    {
                        var result = BonusSystem.AddBonuses(
                            referralCustomer,
                            sumForReferral,
                            $"{trigger.EventType.DescriptionKey()} - {trigger.Name}");
                        
                        _logChanges.Add(result
                            ? new TriggerEditFieldLog($"Начислить бонусы {referralCustomer?.GetFullName()}", null, sumForReferral)
                            : new TriggerEditFieldLog($"Начислить бонусы {referralCustomer?.GetFullName()}", "не было начисления"));
                    }
                    else if (action.EditField.Params.BonusOperationType == EnEditFieldBonusOperationType.SubstractBonus)
                    {
                        var result = BonusSystem.RemoveBonuses(
                            referralCustomer,
                            sumForReferral,
                            $"{trigger.EventType.DescriptionKey()} - {trigger.Name}");
                        
                        _logChanges.Add(result
                            ? new TriggerEditFieldLog($"Списать бонусы {referralCustomer?.GetFullName()}", null, sumForReferral)
                            : new TriggerEditFieldLog($"Списать бонусы {referralCustomer?.GetFullName()}", "не было списания"));
                    }
                    break;
            }
            
            CustomerService.UpdateCustomer(customer, changedBy: ChangedBy(trigger));
        }

        private void EditFieldLead(
            TriggerAction action, 
            ELeadFieldType leadField, 
            Lead lead, 
            Customer leadCustomer,
            TriggerRule trigger
        )
        {
            var newValue = action.EditField.EditFieldValue;
            
            switch (leadField)
            {
                case ELeadFieldType.LastName:
                    _logChanges.Add(new TriggerEditFieldLog(leadField, lead.LastName, newValue));
                    lead.LastName = newValue;
                    leadCustomer.LastName = newValue;
                    break;
                
                case ELeadFieldType.FirstName:
                    _logChanges.Add(new TriggerEditFieldLog(leadField, lead.FirstName, newValue));
                    lead.FirstName = newValue;
                    leadCustomer.FirstName = newValue;
                    break;
                
                case ELeadFieldType.Patronymic:
                    _logChanges.Add(new TriggerEditFieldLog(leadField, lead.Patronymic, newValue));
                    lead.Patronymic = newValue;
                    leadCustomer.Patronymic = newValue;
                    break;
                
                case ELeadFieldType.Phone:
                    _logChanges.Add(new TriggerEditFieldLog(leadField, lead.Phone, newValue));
                    lead.Phone = newValue;
                    leadCustomer.Phone = newValue;
                    break;
                
                case ELeadFieldType.Email:
                    _logChanges.Add(new TriggerEditFieldLog(leadField, lead.Email, newValue));
                    lead.Email = newValue;
                    leadCustomer.EMail = newValue;
                    break;
                
                case ELeadFieldType.Country:
                    _logChanges.Add(new TriggerEditFieldLog(leadField, lead.Country, newValue));
                    lead.Country = newValue;
                    break;
                
                case ELeadFieldType.Region:
                    _logChanges.Add(new TriggerEditFieldLog(leadField, lead.Region, newValue));
                    lead.Region = newValue;
                    break;
                
                case ELeadFieldType.City:
                    _logChanges.Add(new TriggerEditFieldLog(leadField, lead.City, newValue));
                    lead.City = newValue;
                    break;
                
                case ELeadFieldType.CustomerGroup:
                    var groupId = newValue.TryParseInt(true);
                    var group = groupId.HasValue ? CustomerGroupService.GetCustomerGroup(groupId.Value) : null;
                    if (group != null)
                    {
                        _logChanges.Add(new TriggerEditFieldLog(leadField, leadCustomer.CustomerGroup?.GroupName, group.GroupName));
                        leadCustomer.CustomerGroupId = group.CustomerGroupId;
                    }
                    break;
                
                case ELeadFieldType.SalesFunnel:
                    var funnelId = newValue.TryParseInt(true);
                    var funnel = funnelId.HasValue ? Crm.SalesFunnels.SalesFunnelService.Get(funnelId.Value) : null;

                    if (funnel != null)
                    {
                        DealStatus status = null;
                        var statuses = DealStatusService.GetList(funnel.Id).OrderBy(x => x.SortOrder).ToList();

                        if (action.EditField.DealStatusId.HasValue)
                        {
                            status = statuses.FirstOrDefault(x => x.Id == action.EditField.DealStatusId.Value);
                        }
                        else
                        {
                            status = statuses.FirstOrDefault(x => x.Status != SalesFunnelStatusType.Canceled
                                                               && x.Status != SalesFunnelStatusType.FinalSuccess)
                                  ?? statuses.FirstOrDefault(x => x.Status != SalesFunnelStatusType.Canceled)
                                  ?? statuses.FirstOrDefault();
                        }

                        if (status != null)
                        {
                            var prevSalesFunnel = Crm.SalesFunnels.SalesFunnelService.Get(lead.SalesFunnelId);
                            
                            _logChanges.Add(new TriggerEditFieldLog(leadField, prevSalesFunnel?.Name, funnel.Name));
                            _logChanges.Add(new TriggerEditFieldLog(LocalizationService.GetResource("Core.Crm.Lead.DealStatus"), lead.DealStatus?.Name, status.Name));
                            
                            lead.SalesFunnelId = funnel.Id;
                            lead.DealStatusId = status.Id;
                        }
                    }
                    break;
                
                case ELeadFieldType.Source:
                    var orderSourceId = newValue.TryParseInt(true);
                    var orderSource = orderSourceId.HasValue ? OrderSourceService.GetOrderSource(orderSourceId.Value) : null;
                    if (orderSource != null)
                    {
                        _logChanges.Add(new TriggerEditFieldLog(leadField, OrderSourceService.GetOrderSource(lead.OrderSourceId)?.Name, orderSource.Name));
                        lead.OrderSourceId = orderSource.Id;
                    }
                    break;
                
                case ELeadFieldType.Organization:
                    _logChanges.Add(new TriggerEditFieldLog(leadField, lead.Organization, newValue));
                    lead.Organization = newValue;
                    leadCustomer.Organization = newValue;
                    break;
                
                case ELeadFieldType.Title:
                    _logChanges.Add(new TriggerEditFieldLog(leadField, lead.Title, newValue));
                    lead.Title = newValue;
                    break;
                
                case ELeadFieldType.Description:
                    _logChanges.Add(new TriggerEditFieldLog(leadField, lead.Description, newValue));
                    lead.Description = newValue;
                    break;
                
                case ELeadFieldType.CustomerField:
                    if (action.EditField.ObjId.HasValue)
                    {
                        CustomerFieldService.AddUpdateMap(
                            leadCustomer.Id,
                            action.EditField.ObjId.Value,
                            newValue ?? "",
                            true,
                            onTrackChanges: (fieldName, oldValue) => 
                                _logChanges.Add(new TriggerEditFieldLog(fieldName, oldValue, newValue))
                        );
                    }
                    break;
                
                case ELeadFieldType.Manager:
                    var managerId = newValue.TryParseInt(true);
                    var manager = managerId.HasValue ? ManagerService.GetManager(managerId.Value) : null;
                    if (manager != null)
                    {
                        var prevManager = lead.ManagerId != null
                            ? ManagerService.GetManager(lead.ManagerId.Value)
                            : null;
                        
                        _logChanges.Add(new TriggerEditFieldLog(leadField, prevManager?.FullName, manager.FullName));
                        lead.ManagerId = manager.ManagerId;
                    }
                    break;
                
                case ELeadFieldType.CustomerManager:
                    var customerManagerId = newValue.TryParseInt(true);
                    var customerManager = customerManagerId.HasValue ? ManagerService.GetManager(customerManagerId.Value) : null;
                    if (customerManager != null)
                    {
                        var prevManager = leadCustomer.ManagerId != null
                            ? ManagerService.GetManager(leadCustomer.ManagerId.Value)
                            : null;
                        
                        _logChanges.Add(new TriggerEditFieldLog(leadField, prevManager?.FullName, customerManager.FullName));
                        leadCustomer.ManagerId = customerManager.ManagerId;
                    }
                    break;
                
                case ELeadFieldType.CustomerType:
                    var customerType = (CustomerType)newValue.TryParseInt(true);
                    _logChanges.Add(new TriggerEditFieldLog(leadField, lead.CustomerType.Localize(), customerType.Localize()));
                    lead.CustomerType = customerType;
                    leadCustomer.CustomerType = customerType;
                    break;
                
                case ELeadFieldType.BonusAccount:
                    if (!BonusSystem.IsActive)
                    {
                        _logChanges.Add(new TriggerEditFieldLog(leadField, "Бонусная не активна"));
                        break;
                    }

                    if (action.EditField.Params == null)
                    {
                        _logChanges.Add(new TriggerEditFieldLog(leadField, "Действие триггера не настроено"));
                        break;
                    }
                    
                    var bonusMultiple = 0;
                    if (action.EditField.Params.AddBonusesByItemComparers && trigger.Filter is LeadFilter filter)
                    {
                        foreach (var comparer in filter.Comparers)
                        {
                            if (comparer.CompareType != BizObjectFieldCompareType.Equal)
                                continue;
                            if (comparer.FieldComparer.Type == EFieldComparerType.Categories && comparer.FieldComparer is FieldsCategoriesComparer categoriesComparer)
                            {
                                bonusMultiple += lead.LeadItems
                                                    .Where(item => item.ProductId.HasValue
                                                                    && ProductService.GetProduct(item.ProductId.Value).Multiplicity == 1
                                                                    && categoriesComparer.Categories.Any(category => ProductService.GetCategoriesIDsByProductId(item.ProductId.Value, false).Contains(category.Id)))
                                                    .Sum(x => (int)Math.Ceiling(x.Amount));
                            }
                            else if (comparer.FieldComparer.Type == EFieldComparerType.Products && comparer.FieldComparer is FieldsProductsComparer productsComparer)
                            {
                                bonusMultiple += lead.LeadItems
                                                    .Where(item => item.ProductId.HasValue
                                                                    && ProductService.GetProduct(item.ProductId.Value).Multiplicity == 1
                                                                    && productsComparer.Products.Any(product => product.Id == item.ProductId.Value))
                                                    .Sum(x => (int)Math.Ceiling(x.Amount));
                            }
                        }
                        
                        if (bonusMultiple == 0)
                        {
                            _logChanges.Add(new TriggerEditFieldLog(leadField, "Нет подходящих товаров"));
                            break;
                        }
                    }
                    else
                    {
                        bonusMultiple = 1;
                    }

                    var sum = newValue.TryParseInt() * bonusMultiple;
                    if (sum <= 0)
                    {
                        _logChanges.Add(new TriggerEditFieldLog(leadField, "Сумма <= 0"));
                        break;
                    }

                    if (action.EditField.Params.BonusOperationType == EnEditFieldBonusOperationType.AddBonus)
                    {
                        var result = BonusSystem.AddBonuses(
                            leadCustomer,
                            sum,
                            $"{trigger.EventType.DescriptionKey()} - {trigger.Name}");
                        
                        _logChanges.Add(result
                            ? new TriggerEditFieldLog($"Начислить бонусы {leadCustomer?.GetFullName()}", null, sum)
                            : new TriggerEditFieldLog($"Начислить бонусы {leadCustomer?.GetFullName()}", "не было начисления"));
                    }
                    else if (action.EditField.Params.BonusOperationType == EnEditFieldBonusOperationType.SubstractBonus)
                    {
                        var result = BonusSystem.RemoveBonuses(
                            leadCustomer,
                            sum,
                            $"{trigger.EventType.DescriptionKey()} - {trigger.Name}");
                        
                        _logChanges.Add(result
                            ? new TriggerEditFieldLog($"Списать бонусы {leadCustomer?.GetFullName()}", null, sum)
                            : new TriggerEditFieldLog($"Списать бонусы {leadCustomer?.GetFullName()}", "не было списания"));
                    }
                    break;
            }
            
            LeadService.UpdateLead(lead, true, ChangedBy(trigger));
        }

        private void EditFieldOrder(
            TriggerAction action, 
            EOrderFieldType orderField, 
            Order order, 
            Customer orderCustomer, 
            TriggerRule trigger
        )
        {
            var newValue = action.EditField.EditFieldValue;
            
            switch (orderField)
            {
                case EOrderFieldType.LastName:
                    _logChanges.Add(new TriggerEditFieldLog(orderField, order.OrderCustomer.LastName, newValue));
                    order.OrderCustomer.LastName = newValue;
                    orderCustomer.LastName = newValue;
                    break;
                
                case EOrderFieldType.FirstName:
                    _logChanges.Add(new TriggerEditFieldLog(orderField, order.OrderCustomer.FirstName, newValue));
                    order.OrderCustomer.FirstName = newValue;
                    orderCustomer.FirstName = newValue;
                    break;
                
                case EOrderFieldType.Patronymic:
                    _logChanges.Add(new TriggerEditFieldLog(orderField, order.OrderCustomer.Patronymic, newValue));
                    order.OrderCustomer.Patronymic = newValue;
                    orderCustomer.Patronymic = newValue;
                    break;
                
                case EOrderFieldType.Phone:
                    _logChanges.Add(new TriggerEditFieldLog(orderField, order.OrderCustomer.Phone, newValue));
                    order.OrderCustomer.Phone = newValue;
                    orderCustomer.Phone = newValue;
                    break;
                
                case EOrderFieldType.Email:
                    _logChanges.Add(new TriggerEditFieldLog(orderField, order.OrderCustomer.Email, newValue));
                    order.OrderCustomer.Email = newValue;
                    orderCustomer.EMail = newValue;
                    break;
                
                case EOrderFieldType.Country:
                    _logChanges.Add(new TriggerEditFieldLog(orderField, order.OrderCustomer.Country, newValue));
                    order.OrderCustomer.Country = newValue;
                    break;
                
                case EOrderFieldType.Region:
                    _logChanges.Add(new TriggerEditFieldLog(orderField, order.OrderCustomer.Region, newValue));
                    order.OrderCustomer.Region = newValue;
                    break;
                
                case EOrderFieldType.City:
                    _logChanges.Add(new TriggerEditFieldLog(orderField, order.OrderCustomer.City, newValue));
                    order.OrderCustomer.City = newValue;
                    break;
                
                case EOrderFieldType.Organization:
                    _logChanges.Add(new TriggerEditFieldLog(orderField, order.OrderCustomer.Organization, newValue));
                    order.OrderCustomer.Organization = newValue;
                    orderCustomer.Organization = newValue;
                    break;
                
                case EOrderFieldType.CustomerGroup:
                    var groupId = newValue.TryParseInt(true);
                    var group = groupId.HasValue ? CustomerGroupService.GetCustomerGroup(groupId.Value) : null;
                    if (group != null)
                    {
                        _logChanges.Add(new TriggerEditFieldLog(orderField, orderCustomer.CustomerGroup?.GroupName, group.GroupName));

                        orderCustomer.CustomerGroupId = group.CustomerGroupId;
                    }
                    break;
                
                case EOrderFieldType.CustomerType:
                    var customerType = (CustomerType)newValue.TryParseInt(true);
                    _logChanges.Add(new TriggerEditFieldLog(orderField, order.OrderCustomer.CustomerType.Localize(), customerType.Localize()));
                    order.OrderCustomer.CustomerType = customerType;
                    orderCustomer.CustomerType = customerType;
                    break;
                
                case EOrderFieldType.OrderSource:
                    var orderSourceId = newValue.TryParseInt(true);
                    var orderSource = orderSourceId.HasValue ? OrderSourceService.GetOrderSource(orderSourceId.Value) : null;
                    if (orderSource != null)
                    {
                        _logChanges.Add(new TriggerEditFieldLog(orderField, order.OrderSource?.Name, orderSource.Name));
                        order.OrderSourceId = orderSource.Id;
                    }
                    break;
                
                case EOrderFieldType.OrderStatus:
                    var orderStatusId = newValue.TryParseInt(true);
                    var orderStatus = orderStatusId.HasValue ? OrderStatusService.GetOrderStatus(orderStatusId.Value) : null;
                    if (orderStatus != null)
                    {
                        _logChanges.Add(new TriggerEditFieldLog(orderField, order.OrderStatus?.StatusName, orderStatus.StatusName));
                        
                        order.OrderStatusId = orderStatus.StatusID;
                        order.OrderStatus = orderStatus;

                        OrderStatusService.ChangeOrderStatus(order.OrderID, order.OrderStatusId, Basis(trigger));
                    }
                    break;
                
                case EOrderFieldType.IsPaid:
                    var pay = newValue.TryParseBool();
                    _logChanges.Add(new TriggerEditFieldLog(orderField, order.Payed, newValue));
                    
                    OrderService.PayOrder(order.OrderID, pay, changedBy: OrderChangedBy(trigger));
                    break;

                case EOrderFieldType.PaymentMethod:
                    var paymentId = newValue.TryParseInt(true);
                    var payment = paymentId.HasValue ? PaymentService.GetPaymentMethod(paymentId.Value) : null;
                    if (payment != null)
                    {
                        _logChanges.Add(new TriggerEditFieldLog(orderField, order.ArchivedPaymentName, payment.Name));
                        order.PaymentMethodId = payment.PaymentMethodId;
                        order.ArchivedPaymentName = payment.Name;
                    }
                    break;
                
                case EOrderFieldType.ShippingMethod:
                    var shippingId = newValue.TryParseInt(true);
                    var shipping = shippingId.HasValue ? ShippingMethodService.GetShippingMethod(shippingId.Value) : null;
                    if (shipping != null)
                    {
                        _logChanges.Add(new TriggerEditFieldLog(orderField, order.ArchivedShippingName, shipping.Name));
                        order.ShippingMethodId = shipping.ShippingMethodId;
                        order.ArchivedShippingName = shipping.Name;
                    }
                    break;
                
                case EOrderFieldType.CustomerField:
                    if (action.EditField.ObjId.HasValue)
                    {
                        CustomerFieldService.AddUpdateMap(
                            orderCustomer.Id,
                            action.EditField.ObjId.Value,
                            newValue ?? "",
                            true,
                            true,
                            ChangedBy(trigger),
                            (fieldName, oldValue) =>
                                _logChanges.Add(new TriggerEditFieldLog(fieldName, oldValue, newValue ?? "")));
                    }
                    break;
                
                case EOrderFieldType.Manager:
                    var managerId = newValue.TryParseInt(true);
                    var manager = managerId.HasValue ? ManagerService.GetManager(managerId.Value) : null;
                    if (manager != null)
                    {
                        _logChanges.Add(new TriggerEditFieldLog(orderField, order.Manager?.FullName, manager.FullName));
                        order.ManagerId = manager.ManagerId;
                    }
                    break;
                
                case EOrderFieldType.CustomerManager:
                    var customerManagerId = newValue.TryParseInt(true);
                    var customerManager = customerManagerId.HasValue ? ManagerService.GetManager(customerManagerId.Value) : null;
                    if (customerManager != null)
                    {
                        _logChanges.Add(new TriggerEditFieldLog(orderField, orderCustomer.Manager?.FullName, customerManager.FullName));
                        orderCustomer.ManagerId = customerManager.ManagerId;    
                    }
                    break;

                case EOrderFieldType.UseIn1C:
                    _logChanges.Add(new TriggerEditFieldLog(orderField, order.UseIn1C, newValue));
                    order.UseIn1C = newValue.TryParseBool();
                    break;
                
                case EOrderFieldType.BonusAccount:
                {
                    var log = ProcessOrderBonusCase(orderField, action, order, orderCustomer, trigger, isReferral: false, isPercentage: false);
                    if (log != null) _logChanges.Add(log);
                    break;
                }
                
                case EOrderFieldType.ReferralBonusAccount:
                {
                    var log = ProcessOrderBonusCase(orderField, action, order, orderCustomer, trigger, isReferral: true, isPercentage: false);
                    if (log != null) _logChanges.Add(log);
                    break;
                }
                
                case EOrderFieldType.ReferralBonusAccountOrderAmountPercentage:
                {
                    var log = ProcessOrderBonusCase(orderField, action, order, orderCustomer, trigger, isReferral: true, isPercentage: true);
                    if (log != null) _logChanges.Add(log);
                    break;
                }
            }
            
            
            OrderService.UpdateOrderMain(order, updateModules: true, changedBy: OrderChangedBy(trigger));
            OrderService.UpdateOrderCustomer(order.OrderCustomer, changedBy: OrderChangedBy(trigger));
        }

        private TriggerEditFieldLog ProcessOrderBonusCase(
            EOrderFieldType type, 
            TriggerAction action, 
            Order order, 
            Customer orderCustomer, 
            TriggerRule trigger, 
            bool isReferral, 
            bool isPercentage)
        {
            if (!BonusSystem.IsActive)
                return new TriggerEditFieldLog(type, "Бонусная не активна");

            if (action.EditField.Params == null)
                return new TriggerEditFieldLog(type, "Действие триггера не настроено");
            
            var bonusMultiple = 0;
            if (action.EditField.Params.AddBonusesByItemComparers && trigger.Filter is OrderFilter filter)
            {
                foreach (var comparer in filter.Comparers)
                {
                    if (comparer.CompareType != BizObjectFieldCompareType.Equal)
                        continue;
                    if (comparer.FieldComparer.Type == EFieldComparerType.Categories && comparer.FieldComparer is FieldsCategoriesComparer categoriesComparer)
                    {
                        bonusMultiple += order.OrderItems
                                            .Where(item => item.ProductID.HasValue 
                                                            && ProductService.GetProduct(item.ProductID.Value).Multiplicity == 1 
                                                            && categoriesComparer.Categories.Any(category => ProductService.GetCategoriesIDsByProductId(item.ProductID.Value, false).Contains(category.Id)))
                                            .Sum(x => (int)Math.Ceiling(x.Amount));
                    }
                    else if (comparer.FieldComparer.Type == EFieldComparerType.Products && comparer.FieldComparer is FieldsProductsComparer productsComparer)
                    {
                        bonusMultiple += order.OrderItems
                                            .Where(item => item.ProductID.HasValue 
                                                            && ProductService.GetProduct(item.ProductID.Value).Multiplicity == 1 
                                                            && productsComparer.Products.Any(product => product.Id == item.ProductID.Value))
                                            .Sum(x => (int)Math.Ceiling(x.Amount));
                    }
                }
                if (bonusMultiple == 0)
                    return new TriggerEditFieldLog(type, "Нет подходящих товаров");
            }
            else
            {
                bonusMultiple = 1;
            }

            var baseBonus = action.EditField.EditFieldValue.TryParseInt();
            var sumBonus = isPercentage 
                ? order.Sum * baseBonus / 100 * bonusMultiple
                : baseBonus * bonusMultiple;
            
            if (sumBonus <= 0)
                return new TriggerEditFieldLog(type, "Сумма <= 0");
            
            
            var bonusRecipient = orderCustomer;
            if (isReferral)
            {
                var referralCustomerId = ReferralService.GetReferralCustomerId(orderCustomer.Id);
                if (referralCustomerId == null)
                    return new TriggerEditFieldLog(type, "Покупатель не найден");

                var referralCustomer = CustomerService.GetCustomer(referralCustomerId.Value);
                if (referralCustomer == null)
                    return new TriggerEditFieldLog(type, "Покупатель не найден");

                bonusRecipient = referralCustomer;
            }

            // Реализует или нет бонусная списание/начисление, можно через BonusSystem.ImplementIBonusService

            if (action.EditField.Params.BonusOperationType == EnEditFieldBonusOperationType.AddBonus)
            {
                var result = BonusSystem.AddBonuses(
                    bonusRecipient,
                    sumBonus,
                    $"{trigger.EventType.DescriptionKey()} - {trigger.Name}");

                return result
                    ? new TriggerEditFieldLog($"Начислить бонусы {bonusRecipient?.GetFullName()}", null, sumBonus)
                    : new TriggerEditFieldLog($"Начислить бонусы {bonusRecipient?.GetFullName()}", "не было начисления");
            }
            else if (action.EditField.Params.BonusOperationType == EnEditFieldBonusOperationType.SubstractBonus)
            {
                var result = BonusSystem.RemoveBonuses(
                    bonusRecipient,
                    sumBonus,
                    $"{trigger.EventType.DescriptionKey()} - {trigger.Name}");

                return result
                    ? new TriggerEditFieldLog($"Списать бонусы {bonusRecipient?.GetFullName()}", null, bonusRecipient)
                    : new TriggerEditFieldLog($"Списать бонусы {bonusRecipient?.GetFullName()}", "не было списания");
            }

            return null;
        }
        
        private void EditFieldCustomerContact(
            TriggerAction action,
            TriggerCustomerContactFieldType fieldType,
            Guid customerId, 
            TriggerRule trigger
        )
        {
            if (fieldType == null || fieldType.Type == ETriggerCustomerContactFieldType.None)
                return;
            
            var customerContact = CustomerService.GetCustomerContacts(customerId).FirstOrDefault();
            
            if (customerContact == null)
                return;

            var newValue = action.EditField.EditFieldValue;

            switch (fieldType.Type)
            {
                case ETriggerCustomerContactFieldType.Country:
                    _logChanges.Add(new TriggerEditFieldLog(fieldType.Type, customerContact.Country, newValue));
                    customerContact.Country = newValue;
                    break;
                case ETriggerCustomerContactFieldType.Region:
                    _logChanges.Add(new TriggerEditFieldLog(fieldType.Type, customerContact.Region, newValue));
                    customerContact.Region = newValue;
                    break;
                case ETriggerCustomerContactFieldType.City:
                    _logChanges.Add(new TriggerEditFieldLog(fieldType.Type, customerContact.City, newValue));
                    customerContact.City = newValue;
                    break;
            }
            
            CustomerService.UpdateContact(
                customerContact, 
                trackChanges: true, 
                changedBy: ChangedBy(trigger)
            );
        }
    }
}