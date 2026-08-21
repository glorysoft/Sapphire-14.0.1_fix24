using System;
using AdvantShop.Core.Common.Attributes;

namespace AdvantShop.Customers
{
    public enum Role
    {
        [Localize("Core.Customers.Role.User")]
        User = 0,
        [Localize("Core.Customers.Role.Moderator")]
        Moderator = 50,
        [Localize("Core.Customers.Role.Administrator")]
        Administrator = 100,
        [Localize("Core.Customers.Role.Guest")]
        Guest = 150
    }
    
    public enum RoleAction
    {
        [Localize("Core.Customers.RoleActionCategory.None")]
        None,

        [AccessSettingsGroup(AccessSettingsGroup.Base)]
        [Localize("Core.Customers.RoleActionCategory.Orders")]
        Orders,

        [AccessSettingsGroup(AccessSettingsGroup.Base)]
        [Localize("Core.Customers.RoleActionCategory.Crm")]
        Crm,

        [AccessSettingsGroup(AccessSettingsGroup.Base)]
        [Localize("Core.Customers.RoleActionCategory.Customers")]
        Customers,

        [AccessSettingsGroup(AccessSettingsGroup.Base)]
        [Localize("Core.Customers.RoleActionCategory.Catalog")]
        Catalog,

        [AccessSettingsGroup(AccessSettingsGroup.Base)]
        [Localize("Core.Customers.RoleActionCategory.Tasks")]
        Tasks,

        [AccessSettingsGroup(AccessSettingsGroup.Base)]
        [Localize("Core.Customers.RoleActionCategory.Booking")]
        Booking,

        //[Localize("Core.Customers.RoleActionCategory.Marketing")]
        //Marketing,

        [AccessSettingsGroup(AccessSettingsGroup.Modules)]
        [Localize("Core.Customers.RoleActionCategory.Modules")]
        Modules,
        
        [AccessSettingsGroup(AccessSettingsGroup.Modules)]
        [Localize("Core.Customers.RoleActionCategory.InstallModules")]
        InstallModules,
        
        [AccessSettingsGroup(AccessSettingsGroup.Modules)]
        [Localize("Core.Customers.RoleActionCategory.UpdateModules")]
        UpdateModules,
        
        [AccessSettingsGroup(AccessSettingsGroup.Modules)]
        [Localize("Core.Customers.RoleActionCategory.DeleteModules")]
        DeleteModules,
        
        [AccessSettingsGroup(AccessSettingsGroup.Settings)]
        [Localize("Core.Customers.RoleActionCategory.Settings")]
        Settings,

        // new 
        [AccessSettingsGroup(AccessSettingsGroup.SalesChannels)]
        [Localize("Core.Customers.RoleActionCategory.Store")]
        Store,

        [AccessSettingsGroup(AccessSettingsGroup.SalesChannels)]
        [Localize("Core.Customers.RoleActionCategory.Landing")]
        Landing,

        [AccessSettingsGroup(AccessSettingsGroup.SalesChannels)]
        [Localize("Core.Customers.RoleActionCategory.Triggers")]
        Triggers,

        [AccessSettingsGroup(AccessSettingsGroup.SalesChannels)]
        [Localize("Core.Customers.RoleActionCategory.Yandex")]
        Yandex,

        [AccessSettingsGroup(AccessSettingsGroup.SalesChannels)]
        [Localize("Core.Customers.RoleActionCategory.Avito")]
        Avito,

        [AccessSettingsGroup(AccessSettingsGroup.SalesChannels)]
        [Localize("Core.Customers.RoleActionCategory.Google")]
        Google,

        [AccessSettingsGroup(AccessSettingsGroup.SalesChannels)]
        [Localize("Core.Customers.RoleActionCategory.Reseller")]
        Reseller,

        [AccessSettingsGroup(AccessSettingsGroup.SalesChannels)]
        [Localize("Core.Customers.RoleActionCategory.Vk")]
        Vk,

        [AccessSettingsGroup(AccessSettingsGroup.SalesChannels)]
        [Localize("Core.Customers.RoleActionCategory.Ok")]
        Ok,

        [AccessSettingsGroup(AccessSettingsGroup.SalesChannels)]
        [Localize("Core.Customers.RoleActionCategory.Telegram")]
        Telegram,

        [AccessSettingsGroup(AccessSettingsGroup.SalesChannels)]
        [Localize("Core.Customers.RoleActionCategory.BonusSystem")]
        BonusSystem,

        [AccessSettingsGroup(AccessSettingsGroup.SalesChannels)]
        [Localize("Core.Customers.RoleActionCategory.Partners")]
        Partners,

        [AccessSettingsGroup(AccessSettingsGroup.SalesChannels)]
        [Localize("Core.Customers.RoleActionCategory.Instagram")]
        Instagram,

        //[Localize("Core.Customers.RoleActionCategory.Facebook")]
        //Facebook,

        [AccessSettingsGroup(AccessSettingsGroup.SalesChannels)]
        [Localize("Core.Customers.RoleActionCategory.FacebookFeed")]
        FacebookFeed,

        [AccessSettingsGroup(AccessSettingsGroup.Base)]
        [Localize("Core.Customers.RoleActionCategory.Analytics")]
        Analytics,

        [AccessSettingsGroup(AccessSettingsGroup.Base)]
        [Localize("Core.Customers.RoleActionCategory.Desktop")]
        Desktop,
        
        [ActionGroup(Settings)]
        [Localize("Core.Customers.RoleActionCategory.CouponsAndDiscounts")]
        CouponsAndDiscounts,
        
        [ActionGroup(Settings)]
        [Localize("Core.Customers.RoleActionCategory.Api")]
        Api,
        
        [ActionGroup(Orders)]
        [Localize("Core.Customers.OrderActionCategory.Delete")]
        OrderDelete,
        
        [ActionGroup(Orders)]
        [Localize("Core.Customers.OrderActionCategory.ChangeStatus")]
        OrderChangeStatus,
        
        [ActionGroup(Orders)]
        [Localize("Core.Customers.OrderActionCategory.ChangePayment")]
        OrderChangePayment,
        
        [ActionGroup(Orders)]
        [Localize("Core.Customers.OrderActionCategory.EditingOrders")]
        EditingOrders,
        
        [ActionGroup(Customers)]
        [Localize("Core.Customers.CustomerActionCategory.Export")]
        CustomerExport,
        
        [ActionGroup(Customers)]
        [Localize("Core.Customers.CustomerActionCategory.Delete")]
        CustomerDelete,
        
        [ActionGroup(Settings)]
        [Localize("Core.Customers.RoleActionCategory.Settings.SystemSettings")]
        SystemSettings,
        
        [ActionGroup(Settings)]
        [Localize("Core.Customers.RoleActionCategory.Settings.DocumentTemplates")]
        DocumentTemplates,
        
        [ActionGroup(Settings)]
        [Localize("Core.Customers.RoleActionCategory.Settings.MailSmsNotifications")]
        MailSmsNotifications,
        
        [ActionGroup(Settings)]
        [Localize("Core.Customers.RoleActionCategory.Settings.IPTelephony")]
        IPTelephony,
        
        [ActionGroup(Settings)]
        [Localize("Core.Customers.RoleActionCategory.Settings.SocialMedia")]
        SocialMedia,
        
        [ActionGroup(Settings)]
        [Localize("Core.Customers.RoleActionCategory.Settings.Files")]
        Files,
        
        [ActionGroup(Settings)]
        [Localize("Core.Customers.RoleActionCategory.Settings.SEOAndCounters")]
        SeoAndCounters,
        
        [ActionGroup(Settings)]
        [Localize("Core.Customers.RoleActionCategory.Settings.Payment")]
        Payment,
        
        [ActionGroup(Settings)]
        [Localize("Core.Customers.RoleActionCategory.Settings.Delivery")]
        Delivery,
        
        [ActionGroup(Settings)]
        [Localize("Core.Customers.RoleActionCategory.Settings.ShopWindow")]
        ShopWindow,
        
        [ActionGroup(Settings)]
        [Localize("Core.Customers.RoleActionCategory.Settings.Orders")]
        OrdersInSettings,
        
        [ActionGroup(Settings)]
        [Localize("Core.Customers.RoleActionCategory.Settings.GeneralSettings")]
        GeneralSettings,
    }
    
    [AttributeUsage(AttributeTargets.Field, AllowMultiple = false)]
    public class ActionGroupAttribute : Attribute
    {
        public RoleAction ParentAction { get; }

        public ActionGroupAttribute(RoleAction parentAction)
        {
            ParentAction = parentAction;
        }
    }

    public class CustomerRoleAction
    {
        public CustomerRoleAction()
        {
            CustomerId = Guid.Empty;
        }

        public Guid CustomerId { get; set; }        
        public RoleAction Role { get; set; }
    }

    /// <summary>
    /// Какие заказы может видеть менеджер 
    /// </summary>
    public enum ManagersOrderConstraint
    {
        /// <summary>
        /// Все заказы
        /// </summary>
        [Localize("Core.Customers.ManagersOrderConstraint.All")]
        All = 0,

        /// <summary>
        /// Только назначенные заказы
        /// </summary>
        [Localize("Core.Customers.ManagersOrderConstraint.Assigned")]
        Assigned = 1,

        /// <summary>
        /// Назначенные и свободные заказы
        /// </summary>
        [Localize("Core.Customers.ManagersOrderConstraint.AssignedAndFree")]
        AssignedAndFree = 2
    }

    /// <summary>
    /// Какие лиды может видеть менеджер
    /// </summary>
    public enum ManagersLeadConstraint
    {
        [Localize("Core.Customers.ManagersLeadConstraint.All")]
        All = 0,

        [Localize("Core.Customers.ManagersLeadConstraint.Assigned")]
        Assigned = 1,

        [Localize("Core.Customers.ManagersLeadConstraint.AssignedAndFree")]
        AssignedAndFree = 2
    }

    /// <summary>
    /// Каких пользователей может видеть менеджер
    /// </summary>
    public enum ManagersCustomerConstraint
    {
        [Localize("Core.Customers.ManagersCustomerConstraint.All")]
        All = 0,

        [Localize("Core.Customers.ManagersCustomerConstraint.Assigned")]
        Assigned = 1,

        [Localize("Core.Customers.ManagersCustomerConstraint.AssignedAndFree")]
        AssignedAndFree = 2
    }

    /// <summary>
    /// Какие задачи может видеть менеджер
    /// </summary>
    public enum ManagersTaskConstraint
    {
        [Localize("Core.Customers.ManagersTaskConstraint.All")]
        All = 0,

        [Localize("Core.Customers.ManagersTaskConstraint.Assigned")]
        Assigned = 1,

        [Localize("Core.Customers.ManagersTaskConstraint.AssignedAndFree")]
        AssignedAndFree = 2
    }

    public enum AccessSettingsGroup
    {
        [Localize("Core.Customers.AccessSettingsGroup.Base")]
        Base = 0,

        [Localize("Core.Customers.AccessSettingsGroup.SalesChannels")]
        SalesChannels = 1,

        [Localize("Core.Customers.AccessSettingsGroup.Settings")]
        Settings = 2,
        
        [Localize("Core.Customers.AccessSettingsGroup.Modules")]
        Modules = 3
    }
    
    [AttributeUsage(AttributeTargets.Field, AllowMultiple = false)]
    public class AccessSettingsGroupAttribute : Attribute
    {
        public AccessSettingsGroup AccessSettingsGroup { get; }

        public AccessSettingsGroupAttribute(AccessSettingsGroup accessSettingsGroup)
        {
            AccessSettingsGroup = accessSettingsGroup;
        }
    }
}