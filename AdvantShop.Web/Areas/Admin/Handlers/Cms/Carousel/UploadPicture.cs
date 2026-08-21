using System.IO;
using System.Web;
using AdvantShop.Catalog;
using AdvantShop.Configuration;
using AdvantShop.Core.Services.CMS;
using AdvantShop.Core.Services.Localization;
using AdvantShop.FilePath;
using AdvantShop.Helpers;
using AdvantShop.Images.ImageConvertor;

namespace AdvantShop.Web.Admin.Handlers.Cms.Carousel
{
    class UploadPicture
    {
        private readonly int _carouselId;
        
        public UploadPicture(int carouselId)
        {
            _carouselId = carouselId;
        }
        
        public UploadPictureResult Execute()
        {
            if (HttpContext.Current == null || HttpContext.Current.Request.Files.Count == 0)
                return new UploadPictureResult { Error = LocalizationService.GetResource("Admin.Error.FileNotFound") };

            var img = HttpContext.Current.Request.Files["file"];

            if (img != null && img.ContentLength > 0)
            {
                return AddPhoto(_carouselId, img);
            }

            return new UploadPictureResult { Error = LocalizationService.GetResource("Admin.Error.FileNotFound") };
        }

        private UploadPictureResult AddPhoto(int carouselId, HttpPostedFile file)
        {
            var fileName = file.FileName;
            if (!FileHelpers.CheckFileExtensionByType(fileName, EFileType.Image))
                return new UploadPictureResult { Error = LocalizationService.GetResource("Admin.Errors.UnsupportedImageFormat") };
            
            if (carouselId > 0)
            {
                PhotoService.DeletePhotos(carouselId, PhotoType.Carousel);
                CarouselService.ClearCacheCarousel();

                var photo = new Photo(0, carouselId, PhotoType.Carousel)
                {
                    OriginName = fileName,
                    PhotoSortOrder = 0,
                    ColorID = null
                };
                
                photo.PhotoName = PhotoService.AddPhoto(photo);

                if (!string.IsNullOrEmpty(photo.PhotoName))
                {
                    if (FeaturesService.IsEnabled(EFeature.ImageConvertor))
                        using (var memoryStream = new MemoryStream())
                        {
                            file.InputStream.CopyTo(memoryStream);  
                            
                            ImageConvertor.CovertAndSave(
                                memoryStream.ToArray(),
                                photo,
                                FoldersHelper.GetPathAbsolut(FolderType.Carousel, photo.PhotoName),
                                SettingsPictureSize.CarouselBigWidth, 
                                SettingsPictureSize.CarouselBigHeight);
                        }
                    else
                        using (var image = System.Drawing.Image.FromStream(file.InputStream))
                            FileHelpers.SaveResizePhotoFile(
                                FoldersHelper.GetPathAbsolut(FolderType.Carousel, photo.PhotoName), 
                                SettingsPictureSize.CarouselBigWidth, 
                                SettingsPictureSize.CarouselBigHeight, 
                                image);
                    
                    fileName = photo.PhotoName;
                    FileHelpers.DeleteFilesFromImageTemp();
                }
            }
            else
            {
                FileHelpers.CreateDirectory(FoldersHelper.GetPathAbsolut(FolderType.ImageTemp));
                FileHelpers.DeleteFilesFromImageTemp();
                file.SaveAs(FoldersHelper.GetPathAbsolut(FolderType.ImageTemp, fileName));
            }

            return new UploadPictureResult
            {
                Result = true,
                Picture = FoldersHelper.GetPath(carouselId > 0 ? FolderType.Carousel : FolderType.ImageTemp, fileName, true),
                FileName = fileName
            };
        }
    }
}
