using System;
using System.Collections.Generic;
using System.IO;
using System.Web;
using AdvantShop.Core;
using AdvantShop.Core.Services.CMS;
using AdvantShop.Core.Services.Localization;
using AdvantShop.FilePath;
using AdvantShop.Helpers;
using AdvantShop.Web.Infrastructure.Handlers;

namespace AdvantShop.Web.Admin.Handlers.Cms.Carousel
{
    public class UploadVideoHandler : ICommandHandler<string>
    {
        private readonly int _carouselId;
        private readonly List<HttpPostedFileBase> _file;

        public UploadVideoHandler(int carouselId, List<HttpPostedFileBase> file)
        {
            _carouselId = carouselId;
            _file = file;
        }

        public string Execute()
        {
            Validate();

            var videoFolder = FoldersHelper.GetPathAbsolut(FolderType.CarouselVideo) + _carouselId + "/";
            FileHelpers.CreateDirectory(videoFolder);
            FileHelpers.DeleteFilesFromPath(videoFolder);
            var fileBase = _file[0];
            bool fileNameIsNotTaken = false;
            var fileName = string.Empty;
            var fileExtension = Path.GetExtension(fileBase.FileName);
            while (!fileNameIsNotTaken)
            {
                fileName = Guid.NewGuid() + fileExtension;
                if (CarouselVideoService.GetCarouselVideoByVideoName(fileName) == null) fileNameIsNotTaken = true;
            }
            fileBase.SaveAs(videoFolder + fileName);

            if (_carouselId > 0)
            {
                var carouselVideo = CarouselVideoService.GetCarouselVideoByCarousel(_carouselId);
                if (carouselVideo == null)
                {
                    CarouselVideoService.AddCarouselVideo(new CarouselVideo
                    {
                        CarouselId = _carouselId,
                        VideoName = fileName,
                        ModifiedDate = DateTime.Now
                    });
                }
                else
                {
                    carouselVideo.VideoName = fileName;
                    carouselVideo.ModifiedDate = DateTime.Now;
                    CarouselVideoService.UpdateCarouselVideo(carouselVideo);
                }
            }

            return "../videos/carousel/" + _carouselId + "/" + fileName;
        }
        
        private void Validate()
        {
            if (_file == null || _file.Count == 0)
                throw new BlException(LocalizationService.GetResource("Admin.Error.FileNotFound"));
            var availableExtensions = FileHelpers.GetAllowedFileExtensions(EFileType.Video);
            if (!availableExtensions.Contains(Path.GetExtension(_file[0].FileName)))
                throw new BlException(LocalizationService.GetResourceFormat("Admin.Error.InvalidVideoFormat", string.Join(", ", availableExtensions)));
            if (_file[0].ContentLength > 15728640)
                throw new BlException(LocalizationService.GetResourceFormat("Admin.Error.FileSizeLimit", "15 MB"));
        }
    }
}