using AdvantShop.Configuration;
using AdvantShop.Core.UrlRewriter;
using AdvantShop.Module.ShippingPaymentPage.Models;
using AdvantShop.Module.ShippingPaymentPage.Services;
using AdvantShop.Repository.Currencies;
using AdvantShop.Web.Infrastructure.Controllers;
using AdvantShop.Web.Infrastructure.Filters;
using System;
using System.Linq;
using System.Web.Mvc;

namespace AdvantShop.Module.ShippingPaymentPage.Controllers
{
    public class ShippingPaymentPageAdminController : ModuleAdminController
    {
        [ChildActionOnly]
        public ActionResult Settings()
        {
            return PartialView("~/modules/" + ShippingPaymentPage.ModuleID + "/Views/Admin/_Settings.cshtml");
        }

        [HttpGet]
        public JsonResult GetSettings()
        {
            return JsonOk(new SettingsModel()
            {
                DefaultHeight = ShippingPaymentPageSettings.DefaultHeight,
                DefaultWidth = ShippingPaymentPageSettings.DefaultWidth,
                DefaultWeight = ShippingPaymentPageSettings.DefaultWeight,
                DefaultLength = ShippingPaymentPageSettings.DefaultLength,
                DefaultPrice = ShippingPaymentPageSettings.DefaultPrice,
                DefaultShippingPrice = ShippingPaymentPageSettings.DefaultShippingPrice,
                ShippingTextBlock = ShippingPaymentPageSettings.ShippingTextBlock,
                ShippingTextBlockBottom = ShippingPaymentPageSettings.ShippingTextBlockBottom,
                Title = ShippingPaymentPageSettings.Title,
                MetaDescription = ShippingPaymentPageSettings.MetaDescription,
                MetaKeywords = ShippingPaymentPageSettings.MetaKeywords,
                ModuleUrl = UrlService.GetUrl("shipping-payment"),
                DefaultPriceCurrencyIso3 = ShippingPaymentPageSettings.DefaultPriceCurrencyIso3,
                CurrencyList = CurrencyService.GetAllCurrencies()
                    .Select(x => new SelectListItem
                    {
                        Text = x.Symbol,
                        Value = x.Iso3
                    }).ToList()
            });
        }

        [HttpPost, ValidateJsonAntiForgeryToken]
        public ActionResult SaveSettings(SettingsModel model)
        {
            ShippingPaymentPageSettings.DefaultHeight = model.DefaultHeight;
            ShippingPaymentPageSettings.DefaultWidth = model.DefaultWidth;
            ShippingPaymentPageSettings.DefaultWeight = model.DefaultWeight;
            ShippingPaymentPageSettings.DefaultLength = model.DefaultLength;
            ShippingPaymentPageSettings.DefaultPrice = model.DefaultPrice;
            ShippingPaymentPageSettings.DefaultShippingPrice = model.DefaultShippingPrice;
            ShippingPaymentPageSettings.ShippingTextBlock = model.ShippingTextBlock ?? "";
            ShippingPaymentPageSettings.ShippingTextBlockBottom = model.ShippingTextBlockBottom ?? "";
            ShippingPaymentPageSettings.Title = model.Title ?? "";
            ShippingPaymentPageSettings.MetaDescription = model.MetaDescription ?? "";
            ShippingPaymentPageSettings.MetaKeywords = model.MetaKeywords ?? "";
            ShippingPaymentPageSettings.DefaultPriceCurrencyIso3 = model.DefaultPriceCurrencyIso3;

            return JsonOk();
        }
    }
}
