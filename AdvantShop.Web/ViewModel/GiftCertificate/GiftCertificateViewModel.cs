using System.Collections.Generic;
using AdvantShop.Configuration;
using AdvantShop.Core.Services.Catalog;
using AdvantShop.Customers;
using AdvantShop.Payment;

namespace AdvantShop.ViewModel.GiftCertificate
{
    public class GiftCertificateViewModel
    {
        public List<PaymentMethod> PaymentMethods { get; set; }

        public int PaymentMethod { get; set; }

        public string PaymentKey { get; set; }

        public string NameTo { get; set; }

        public string NameFrom { get; set; }

        public float Sum { get; set; }

        public string Message { get; set; }

        public string EmailTo { get; set; }

        public string EmailFrom { get; set; }

        public string Phone { get; set; }
        
        public string CaptchaBase64 { get; set; }

        public string CaptchaSource { get; set; }

        public string CaptchaCode { get; set; }

        private string _minimumOrderPrice;
        public string MinimumOrderPrice => 
            _minimumOrderPrice 
            ?? (_minimumOrderPrice = CustomerGroupService.GetMinimumOrderPrice().FormatPrice());
        
        private string _minimalPriceCertificate;
        public string MinimalPriceCertificate => 
            _minimalPriceCertificate 
            ?? ( _minimalPriceCertificate = SettingsCheckout.MinimalPriceCertificate.FormatPrice());
        
        private string _maximalPriceCertificate;
        public string MaximalPriceCertificate => 
            _maximalPriceCertificate 
            ?? ( _maximalPriceCertificate = SettingsCheckout.MaximalPriceCertificate.FormatPrice());

        public bool Agreement { get; set; }
    }
}