using AdvantShop.Catalog;
using AdvantShop.Configuration;
using AdvantShop.Core.Services.CMS;
using AdvantShop.Core.Services.Localization;
using AdvantShop.FilePath;
using AdvantShop.Helpers;
using AdvantShop.Trial;

namespace AdvantShop.Web.Admin.Handlers.Cms.Carousel
{
    class UploadPictureByLink
    {
        private readonly int _carouselId;
        private readonly string _fileLink;

        public UploadPictureByLink(int carouselId, string fileLink)
        {
            _carouselId = carouselId;
            _fileLink = fileLink;
        }

        public UploadPictureResult Execute()
        {
            if(string.IsNullOrEmpty(_fileLink))
                return new UploadPictureResult { Error = LocalizationService.GetResource("Admin.Error.FileNotFound") };

            if (!FileHelpers.CheckFileExtensionByType(_fileLink, EFileType.Image))
                return new UploadPictureResult { Error = LocalizationService.GetResource("Admin.Errors.UnsupportedImageFormat") };

            return AddPhoto(_carouselId, _fileLink);
        }

        private UploadPictureResult AddPhoto(int carouselId, string fileLink)
        {
            string error = null;

            var fileName = fileLink.Substring(fileLink.LastIndexOf("/") + 1);

            FileHelpers.CreateDirectory(FoldersHelper.GetPathAbsolut(FolderType.ImageTemp));
            FileHelpers.DeleteFilesFromImageTemp();
            var photoFullName = FoldersHelper.GetPathAbsolut(FolderType.ImageTemp, fileName);

            if (!string.IsNullOrEmpty(fileName) && FileHelpers.DownloadRemoteImageFile(fileLink, photoFullName, out error))
            {
                if (carouselId > 0)
                {
                    PhotoService.DeletePhotos(carouselId, PhotoType.Carousel);
                    CarouselService.ClearCacheCarousel();
                    fileName = PhotoService.AddPhoto(new Photo(0, carouselId, PhotoType.Carousel)
                    {
                        OriginName = fileName,
                        PhotoSortOrder = 0,
                        ColorID = null
                    });

                    if (!string.IsNullOrEmpty(fileName))
                    {
                        using (System.Drawing.Image image = System.Drawing.Image.FromFile(photoFullName))
                        {
                            FileHelpers.SaveResizePhotoFile(FoldersHelper.GetPathAbsolut(FolderType.Carousel, fileName), SettingsPictureSize.CarouselBigWidth, SettingsPictureSize.CarouselBigHeight, image);
                        }
                        FileHelpers.DeleteFilesFromImageTemp();
                    }
                }
                TrialService.TrackEvent(TrialEvents.ChangeLogo, "");
                return new UploadPictureResult
                {
                    Result = true,
                    Picture = FoldersHelper.GetPath(carouselId > 0 ? FolderType.Carousel : FolderType.ImageTemp, fileName, true),
                    FileName = fileName
                };
            }

            return new UploadPictureResult { Error = error ?? LocalizationService.GetResource("Admin.Catalog.ErrorLoadingImage") };
        }
    }
}
