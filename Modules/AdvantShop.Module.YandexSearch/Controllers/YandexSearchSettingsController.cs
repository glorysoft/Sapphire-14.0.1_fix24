using System.Web.Mvc;
using AdvantShop.Core.Common.Extensions;
using AdvantShop.Module.YandexSearch.Core;
using AdvantShop.Module.YandexSearch.Models;
using AdvantShop.Web.Infrastructure.Controllers;
using AdvantShop.Web.Infrastructure.Filters;

namespace AdvantShop.Module.YandexSearch.Controllers
{
    public class YandexSearchSettingsController : ModuleAdminController
    {
        [ChildActionOnly]
        public ActionResult Settings()
        {
            return PartialView("~/Modules/YandexSearch/Views/Admin/_Settings.cshtml");
        }

        [HttpGet]
        public JsonResult GetSettings()
        {
            return Json(new SettingsModel()
            {
                ApiKey = YandexSearchSettings.ApiKey,
                SearchId = YandexSearchSettings.SearchId,
                OfferIdType = YandexSearchSettings.IdIsArtNo ? "artno" : "id",
                SearchMaxItems = YandexSearchSettings.SearchMaxItems,
            });
        }

        [HttpPost, ValidateJsonAntiForgeryToken]
        public JsonResult SaveSettings(SettingsModel model)
        {
            YandexSearchSettings.ApiKey = model.ApiKey.DefaultOrEmpty();
            YandexSearchSettings.SearchId = model.SearchId.DefaultOrEmpty();
            YandexSearchSettings.IdIsArtNo = model.OfferIdType == "artno";
            YandexSearchSettings.SearchMaxItems = model.SearchMaxItems;

            return JsonOk();
        }
    }
}
