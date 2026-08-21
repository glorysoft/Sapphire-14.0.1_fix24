using System;
using System.Collections.Generic;
using System.Web.Mvc;
using AdvantShop.Configuration;
using AdvantShop.Customers;
using AdvantShop.Models;
using AdvantShop.Repository;
using AdvantShop.Repository.Currencies;
using AdvantShop.Handlers.Location;

namespace AdvantShop.ViewModel.Home
{
    public sealed class TopPanelViewModel : BaseModel
    {
        public TopPanelViewModel(Customer currentCustomer)
        {
            IsRegistered = currentCustomer.RegistredUser;
            IsShowAdminLink = currentCustomer.Enabled && (currentCustomer.IsAdmin || currentCustomer.IsModerator);
            IsAdmin = currentCustomer.IsAdmin;
            
            Currencies = new List<SelectListItem>();
            
            IsShowCity = !SettingsDesign.HideCityInTopPanel;
            if (IsShowCity)
            {
                CurrentCity = GetCurrentCityHandler.Execute()?.Name ?? string.Empty;
            }

            IsShowCurrency = SettingsCatalog.AllowToChangeCurrency;
            IsShowWishList = SettingsDesign.WishListVisibility && !SettingsDesign.AutodetectCity;
            IsTemplatePreview = currentCustomer.IsAdmin && SettingsDesign.PreviewTemplate != null;
            
            RegistrationIsProhibited = SettingsMain.RegistrationIsProhibited;
        }

        [Obsolete]
        public bool IsShowDesignConstructor { get; set; }


        public bool IsRegistered { get; }

        public bool IsShowAdminLink { get; }

        public bool IsShowCurrency { get; }

        public bool IsShowCity { get; }

        public bool IsShowWishList { get; }

        public string CurrentCity { get; }

        public string WishCount { get; set; }

        public Currency CurrentCurrency { get; set; }

        public List<SelectListItem> Currencies { get; set; }

        public bool IsTemplatePreview { get; }

        public bool HasTemplate { get; set; }

        public string TemplatePreviewName { get; set; }

        public string BuyTemplateLink { get; set; }
        
        public bool IsAdmin { get; }
        public bool IsShowNotificationTechDomain { get; set; }
        public bool IsShowNotificationStoreClosed { get; set; }
        public string NotAllowCheckoutText { get; set; }

        /// <summary>
        /// Регистрация запрещена
        /// </summary>
        public bool RegistrationIsProhibited { get; }
    }
}