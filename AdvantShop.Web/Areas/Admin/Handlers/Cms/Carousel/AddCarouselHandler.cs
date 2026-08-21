using System;
using System.IO;
using System.Linq;
using AdvantShop.Catalog;
using AdvantShop.Configuration;
using AdvantShop.Core;
using AdvantShop.Core.Services.Screenshot;
using AdvantShop.Core.Common.Extensions;
using AdvantShop.Core.Services.CMS;
using AdvantShop.Core.Services.Localization;
using AdvantShop.Web.Admin.Models.Cms.Carousel;
using AdvantShop.Web.Infrastructure.Handlers;
using AdvantShop.FilePath;
using AdvantShop.Helpers;
using AdvantShop.Images.ImageConvertor;

namespace AdvantShop.Web.Admin.Handlers.Cms.Carousel
{
    public class AddCarouselHandler : ICommandHandler
    {
        private readonly CarouselFilterModel _model;

        public AddCarouselHandler(CarouselFilterModel model)
        {
            _model = model;
        }

        public void Execute()
        {
            var fullPhotoFileName = FoldersHelper.GetPathAbsolut(FolderType.ImageTemp, _model.ImageSrc);
            _model.VideoSrc = _model.VideoSrc?.Split('/').Last() ?? string.Empty;
            var fullVideoFileName = FoldersHelper.GetPathAbsolut(FolderType.CarouselVideo, "0/" + _model.VideoSrc);

            Validate(fullPhotoFileName, fullVideoFileName);

            var carousel = new Core.Services.CMS.Carousel
            {
                Url = _model.CarouselUrl,
                SortOrder = _model.SortOrder.TryParseInt(),
                Enabled = Convert.ToBoolean(_model.Enabled),
                DisplayInOneColumn = Convert.ToBoolean(_model.DisplayInOneColumn),
                DisplayInTwoColumns = Convert.ToBoolean(_model.DisplayInTwoColumns),
                DisplayInMobile = Convert.ToBoolean(_model.DisplayInMobile),
                Blank = Convert.ToBoolean(_model.Blank),
                Obscuring = _model.Obscuring ?? 0,
                MarginTop = _model.MarginTop ?? 0,
                MarginBottom = _model.MarginBottom ?? 0,
                MarginLeft = _model.MarginLeft ?? 0,
                MarginRight =_model.MarginRight ?? 0,
                HeaderTextColorCode = _model.HeaderTextColorCode,
                IsVideo = _model.IsVideo ?? false,
            };
            var carouselId = CarouselService.AddCarousel(carousel);

            AddCarouselPhoto(carouselId, fullPhotoFileName);
            
            AddCarouselVideo(carouselId, fullVideoFileName);

            UpdateStoreScreenShotInBackground(carousel);

            AddCarouselText(carouselId);

            AddCarouselButtons(carouselId);

            Track.TrackService.TrackEvent(Track.ETrackEvent.Shop_Carousel_AddSlide);
        }

        private void AddCarouselPhoto(int carouselId, string fullFileName)
        {
            if (_model.ImageSrc.IsNullOrEmpty() || !File.Exists(fullFileName)) return;

            var photo = new Photo(0, carouselId, PhotoType.Carousel)
            {
                Description = _model.Description,
                OriginName = Path.GetFileName(fullFileName),
                PhotoSortOrder = 0,
                ColorID = null
            };
            
            photo.PhotoName = PhotoService.AddPhoto(photo);

            if (string.IsNullOrEmpty(photo.PhotoName)) return;

            if (FeaturesService.IsEnabled(EFeature.ImageConvertor))
                ImageConvertor.CovertAndSave(
                    File.ReadAllBytes(fullFileName),
                    photo,
                    FoldersHelper.GetPathAbsolut(FolderType.Carousel, photo.PhotoName),
                    SettingsPictureSize.CarouselBigWidth, 
                    SettingsPictureSize.CarouselBigHeight);
            else 
                using (var image = System.Drawing.Image.FromFile(fullFileName))
                    FileHelpers.SaveResizePhotoFile(
                        FoldersHelper.GetPathAbsolut(FolderType.Carousel, photo.PhotoName), 
                        SettingsPictureSize.CarouselBigWidth, 
                        SettingsPictureSize.CarouselBigHeight, image);
            
            FileHelpers.DeleteFilesFromImageTemp();
        }
        
        private void AddCarouselVideo(int carouselId, string fullFileName)
        {
            if (_model.VideoSrc.IsNullOrEmpty() || !File.Exists(fullFileName)) return;
            var videoId = CarouselVideoService.AddCarouselVideo(new CarouselVideo
            {
                CarouselId = carouselId,
                VideoName = Path.GetFileName(fullFileName),
                ModifiedDate = DateTime.Now
            });

            if (videoId > 0)
            {
                var videoFolder = FoldersHelper.GetPathAbsolut(FolderType.CarouselVideo) + carouselId + "/";
                FileHelpers.CreateDirectory(videoFolder);
                FileHelpers.DeleteFilesFromPath(videoFolder);
                File.Copy(fullFileName, videoFolder + _model.VideoSrc, overwrite: true);
                File.Delete(fullFileName);
            }
        }

        private void UpdateStoreScreenShotInBackground(Core.Services.CMS.Carousel carousel)
        {
            var minSortOrder = CarouselService.GetAllCarousels().Min(x => x.SortOrder);
            if (minSortOrder == carousel.SortOrder)
                new ScreenshotService().UpdateStoreScreenShotInBackground();
        }

        private void AddCarouselText(int carouselId)
        {
            if (_model.Text != null)
            {
                _model.Text.CarouselId = carouselId;
                CarouselService.AddCarouselText(_model.Text);
            }
        }

        private void AddCarouselButtons(int carouselId)
        {
            if (_model.Buttons != null)
            {
                foreach (var button in _model.Buttons)
                {
                    button.CarouselId = carouselId;
                    CarouselService.AddCarouselButton(button);
                }
            }
        }

        private void Validate(string fullPhotoFileName, string fullVideoFileName)
        {
            if ((_model.ImageSrc.IsNullOrEmpty() || !File.Exists(fullPhotoFileName))
                && (_model.VideoSrc.IsNullOrEmpty() || !File.Exists(fullVideoFileName)))
                throw new BlException(LocalizationService.GetResource("Admin.Carousel.Errors.ImageOrVideoNotFound"));
        }
    }
}