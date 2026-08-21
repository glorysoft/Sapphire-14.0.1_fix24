using System;
using AdvantShop.Catalog;
using AdvantShop.Configuration;
using AdvantShop.Core;
using AdvantShop.Core.Services.Localization;
using AdvantShop.Diagnostics;
using AdvantShop.Statistic;
using AdvantShop.Web.Infrastructure.Handlers;

namespace AdvantShop.Web.Admin.Handlers.Design
{
    public class ResizePicturesHandler : ICommandHandler<bool>
    {
        private readonly bool _isEnabledImageConvertor = FeaturesService.IsEnabled(EFeature.ImageConvertor);
        
        public bool Execute()
        {
            if (_isEnabledImageConvertor)
                PhotoService.MarkPhotoAsNotConverted(PhotoType.Product);   
            else
                ResizePictures();

            return !_isEnabledImageConvertor;
        }

        private static void ResizePictures()
        {
            if (CommonStatistic.IsRun)
                throw new BlException(LocalizationService.GetResource("Admin.Designs.NotPossibleToCompressPhotos"));

            try
            {
                CommonStatistic.StartNew(() =>
                    {
                        CommonStatistic.TotalRow = PhotoService.GetCountPhotos(0, PhotoType.Product);
                        Helpers.FileHelpers.ResizeAllProductPhotos();
                    },
                    "settingstemplate#?settingsTab=catalog",
                    LocalizationService.GetResource("Admin.Designs.ResizeProductPictures"));
            }
            catch (Exception ex)
            {
                Debug.Log.Error(ex);
            }

            Track.TrackService.TrackEvent(Track.ETrackEvent.Shop_Design_ResizePictures);
        }
    }
}