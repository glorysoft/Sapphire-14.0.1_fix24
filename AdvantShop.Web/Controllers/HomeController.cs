using System.Collections.Generic;
using System.Linq;
using System.Web.Mvc;
using System.Web.SessionState;
using AdvantShop.Catalog;
using AdvantShop.Configuration;
using AdvantShop.Core.Common.Extensions;
using AdvantShop.Core.Services.CMS;
using AdvantShop.Core.Services.Configuration;
using AdvantShop.Core.Services.Customers;
using AdvantShop.Core.Services.InplaceEditor;
using AdvantShop.Core.Services.SEO;
using AdvantShop.Customers;
using AdvantShop.GeoModes;
using AdvantShop.Handlers.Home;
using AdvantShop.ViewModel.Home;
using AdvantShop.Web.Infrastructure.Controllers;
using AdvantShop.Web.Infrastructure.Extensions;
using AdvantShop.Web.Infrastructure.Filters;

namespace AdvantShop.Controllers
{
    [SessionState(SessionStateBehavior.ReadOnly)]
    public partial class HomeController : BaseClientController
    {
        [AccessByChannel(EProviderSetting.StoreActive, ETypeRedirect.LandingSite)]
        public ActionResult Index()
        {
            var view = "";

            switch (GetMainPageMode())
            {
                case SettingsDesign.eMainPageMode.Default:
                    view = "_ColumnsOne";
                    break;
                case SettingsDesign.eMainPageMode.TwoColumns:
                    view = "_ColumnsTwo";
                    break;
                case SettingsDesign.eMainPageMode.ThreeColumns:
                    view = "_ColumnsThree";
                    break;
            }

            SetMetaInformation(null, string.Empty);
            SetNgController(NgControllers.NgControllersTypes.HomeCtrl);

            var tagManager = GoogleTagManagerContext.Current;
            if (tagManager.Enabled)
            {
                tagManager.PageType = ePageType.home;
            }

            WriteLog("", Url.AbsoluteRouteUrl("Home"), ePageType.home);

            if (CustomerContext.CurrentCustomer.IsAdmin)
            {
                Track.TrackService.TrackEvent(Track.ETrackEvent.Trial_VisitClientSide);
                Track.TrackService.TrackEvent(Track.ETrackEvent.Achievements_VisitClientSide);
            }

            ReferralService.ApplyReferralProgram(null, true);

            return View(view);
        }

        [ChildActionOnly]
        public ActionResult Carousel(CarouselOptions options)
        {
            List<Carousel> slides = null;

            if (SettingsDesign.PreviewTemplate != null && SettingsDesign.IsDefaultSlides && !string.IsNullOrEmpty(SettingsDesign.DefaultSlides))
            {
                slides =
                    SettingsDesign.DefaultSlides.Split(';')
                        .Select(x => new Carousel() { Url = "", Picture = new CarouselPhoto() { PhotoName = x } })
                        .ToList();
            }

            if (slides == null)
            {
                var currentMode = GetMainPageMode();
                slides = CarouselService.GetAllCarouselsMainPage((ECarouselPageMode)currentMode);
            }

            if (slides.Count == 0 && InplaceEditorService.CanUseInplace(RoleAction.Catalog))
            {
                slides = slides.DeepCloneJson();
                slides.Add(new Carousel { Url = "", Picture = new CarouselPhoto() { PhotoName = "" } });
            }

            if (slides.Count == 0 || !SettingsDesign.CarouselVisibility)
                return new EmptyResult();
            
            var model = new CarouselViewModel()
            {
                Sliders = slides,
                Options = options ?? new CarouselOptions()
            };

            return PartialView("Carousel", model);
        }

        [ChildActionOnly]
        public ActionResult MainPageProducts()
        {
            if (!SettingsDesign.MainPageProductsVisibility)
                return new EmptyResult();

            var model = new MainPageProductsHandler(SettingsDesign.OnePageCatalog).Execute();
            
            return PartialView("MainPageProducts", model);
        }

        [ChildActionOnly]
        public ActionResult MainPageCategories()
        {
            if (!SettingsDesign.MainPageCategoriesVisibility)
                return new EmptyResult();

            var model = new MainPageCategoriesHandler().Get();
            
            return PartialView("MainPageCategories", model);
        }

        [ChildActionOnly]
        public ActionResult GeoMode()
        {
            var geoModeService = new GeoModeService();
            
            if (!geoModeService.ShowGeoMode())
                return new EmptyResult();

            var model = new GetGeoMode(geoModeService).Execute();
            
            return PartialView("GeoMode", model);
        }
    }
}