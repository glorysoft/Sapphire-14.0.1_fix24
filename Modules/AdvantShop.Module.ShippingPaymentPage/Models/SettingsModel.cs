using System.Collections.Generic;
using System.Web.Mvc;

namespace AdvantShop.Module.ShippingPaymentPage.Models
{
    public class SettingsModel
    {
        public float DefaultWeight { get; set; }
        public float DefaultWidth { get; set; }
        public float DefaultHeight { get; set; }
        public float DefaultLength { get; set; }
        public float DefaultPrice { get; set; }
        public float DefaultShippingPrice { get; set; }
        public string ShippingTextBlock { get; set; }
        public string ShippingTextBlockBottom { get; set; }
        public string Title { get; set; }
        public string MetaDescription { get; set; }
        public string MetaKeywords { get; set; }
        public string ModuleUrl { get; set; }
        public string DefaultPriceCurrencyIso3 { get; set; }
        public List<SelectListItem>  CurrencyList { get; set; }
    }
}
