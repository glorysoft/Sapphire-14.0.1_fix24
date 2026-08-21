using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using AdvantShop.Catalog;
using AdvantShop.Core.Common.Extensions;
using AdvantShop.Core.Services.CMS;
using AdvantShop.Core.Services.SalesChannels;
using AdvantShop.Core.Services.Screenshot;
using AdvantShop.Customers;
using AdvantShop.FilePath;
using AdvantShop.Helpers;
using AdvantShop.Web.Admin.Attributes;
using AdvantShop.Web.Admin.Handlers.Cms.Carousel;
using AdvantShop.Web.Admin.Models;
using AdvantShop.Web.Admin.Models.Cms.Carousel;
using AdvantShop.Web.Admin.ViewModels.Cms.Carousel;
using AdvantShop.Web.Infrastructure.Admin;
using AdvantShop.Web.Infrastructure.Controllers;
using AdvantShop.Web.Infrastructure.Filters;

namespace AdvantShop.Web.Admin.Controllers.Cms
{
    [Auth(RoleAction.Store)]
    [SalesChannel(ESalesChannelType.Store)]
    public partial class CarouselController : BaseAdminController
    {
        public ActionResult Index()
        {
            var model = new CarouselViewModel();
            SetMetaInformation(T("Admin.Carousel.Index.Title"));
            SetNgController(NgControllers.NgControllersTypes.CarouselPageCtrl);

            return View(model);
        }

        #region Add/Edit/Get/Delete

        [HttpPost, ValidateJsonAntiForgeryToken]
        public JsonResult AddCarousel(CarouselFilterModel model) =>
            ProcessJsonResult(new AddCarouselHandler(model));
        
        public JsonResult GetCarousel(CarouselFilterModel model)
        {
            var result = new GetCarousel(model).Execute();

            if (result.DataItems != null)
            {
                for(var i = 0; i < result.DataItems.Count; i++)
                {
                    result.DataItems[i].ImageSrc = result.DataItems[i].Picture.ImageSrc();
                    result.DataItems[i].VideoSrc = result.DataItems[i].Video?.VideoSrc();
                }
            }
            
            return Json(result);
        }

        public JsonResult DeleteCarousel(CarouselFilterModel model)
        {
            Command(model, (id, c) =>
            {
                CarouselService.DeleteCarousel(id);
                return true;
            });

            new ScreenshotService().UpdateStoreScreenShotInBackground();
            Track.TrackService.TrackEvent(Track.ETrackEvent.Shop_Carousel_DeleteSlide);

            return Json(true);
        }

        #endregion

        #region Upload

        [HttpPost, ValidateJsonAntiForgeryToken]
        public JsonResult Upload(int carouselId)
        {            
            var result = new UploadPicture(carouselId).Execute();
            return result.Result
                ? JsonOk(new { picture = result.Picture, pictureName = result.FileName })
                : JsonError(result.Error);
        }

        [HttpPost]
        [ValidateJsonAntiForgeryToken]
        public JsonResult UploadByLink(int carouselId, string fileLink)
        {            
            var result = new UploadPictureByLink(carouselId, fileLink).Execute();
            return result.Result
                ? JsonOk(new { picture = result.Picture, pictureName = result.FileName })
                : JsonError(result.Error);
        }

        [HttpPost]
        [ValidateJsonAntiForgeryToken]
        public JsonResult DeleteFile(int carouselId)
        {
            if (carouselId > 0)
            {
                PhotoService.DeletePhotos(carouselId, PhotoType.Carousel);
                CarouselService.ClearCacheCarousel();
            }
            else
            {
                FileHelpers.DeleteFilesFromImageTemp();
            }

            return JsonOk(new { picture = "../images/nophoto_small.png", pictureName = string.Empty });
        }

        #endregion

        #region Inplace

        public JsonResult InplaceCarousel(CarouselFilterModel model) =>
            ProcessJsonResult(new UpdateCarouselHandler(model));

        #endregion

        #region Command

        private void Command(CarouselFilterModel model, Func<int, CarouselFilterModel, bool> func)
        {
            if (model.SelectMode == SelectModeCommand.None)
            {
                foreach (var id in model.Ids)
                {
                    func(id, model);
                }
            }
            else
            {
                var handler = new GetCarousel(model);
                var ids = handler.GetItemsIds();

                foreach (int id in ids)
                {
                    if (model.Ids == null || !model.Ids.Contains(id))
                        func(id, model);
                }
            }
        }


        #endregion
        
        #region Alignment
        
        public JsonResult GetAlignments() =>
            Json(Enum.GetValues(typeof(ETextAlignment))
                .Cast<ETextAlignment>()
                .Select(x => new SelectItemModel<ETextAlignment>(x.Localize(), x)));

        #endregion
        
        #region Position
        
        public JsonResult GetHorizontalPositions() =>
            Json(Enum.GetValues(typeof(ETextPositionHorizontal))
                .Cast<ETextPositionHorizontal>()
                .Select(x => new SelectItemModel<ETextPositionHorizontal>(x.Localize(), x)));
        
        public JsonResult GetVerticalPositions() =>
            Json(Enum.GetValues(typeof(ETextPositionVertical))
                .Cast<ETextPositionVertical>()
                .Select(x => new SelectItemModel<ETextPositionVertical>(x.Localize(), x)));

        #endregion
        
        #region Animation
        
        public JsonResult GetAnimations() =>
            Json(Enum.GetValues(typeof(ETextAnimation))
                .Cast<ETextAnimation>()
                .Select(x => new SelectItemModel<ETextAnimation>(x.Localize(), x)));
        
        #endregion
        
        #region Video

        [HttpPost, ValidateJsonAntiForgeryToken]
        public JsonResult UploadVideo(int carouselId, List<HttpPostedFileBase> file) =>
            ProcessJsonResult(new UploadVideoHandler(carouselId, file));

        public JsonResult GetVideos(int carouselId)
        {
            var videoFolder = FoldersHelper.GetPathAbsolut(FolderType.CarouselVideo) + carouselId + "/";
            FileHelpers.CreateDirectory(videoFolder);
            var videoExtensions = FileHelpers.GetAllowedFileExtensions(EFileType.Video);
            var files = Directory.GetFiles(videoFolder)
                .Where(file => videoExtensions.Contains(Path.GetExtension(file)))
                .Select(Path.GetFileName);

            return Json(files);
        }

        [HttpPost, ValidateJsonAntiForgeryToken]
        public JsonResult DeleteVideo(int carouselId, string name)
        {
            if (carouselId > 0) CarouselVideoService.DeleteCarouselVideoByCarousel(carouselId);
            var videoFile = FoldersHelper.GetPathAbsolut(FolderType.CarouselVideo, carouselId + "/" + name);
            FileHelpers.DeleteFile(videoFile);

            return JsonOk();
        }

        #endregion
    }
}
