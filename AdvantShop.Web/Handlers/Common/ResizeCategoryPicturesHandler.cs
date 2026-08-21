using System;
using AdvantShop.Catalog;
using AdvantShop.Configuration;
using AdvantShop.Core;
using AdvantShop.Core.Services.Localization;
using AdvantShop.Diagnostics;
using AdvantShop.FilePath;
using AdvantShop.Helpers;
using AdvantShop.Statistic;
using AdvantShop.Web.Infrastructure.Handlers;

namespace AdvantShop.Handlers.Common
{
    public class ResizeCategoryPicturesHandler : ICommandHandler<bool>
    {
        private readonly bool _isEnabledImageConvertor = FeaturesService.IsEnabled(EFeature.ImageConvertor);
        
        private readonly CategoryImageType _type;

        public ResizeCategoryPicturesHandler(CategoryImageType type)
        {
            _type = type;
        }

        public bool Execute()
        {
            if (_isEnabledImageConvertor)
            {
                switch (_type)
                {
                    case CategoryImageType.Big:
                        PhotoService.MarkPhotoAsNotConverted(PhotoType.CategoryBig);
                        break;
                    case CategoryImageType.Small:
                        PhotoService.MarkPhotoAsNotConverted(PhotoType.CategorySmall);
                        break;
                    default:
                        throw new BlException(
                            LocalizationService.GetResource("Admin.Designs.MarkPhotoAsNotConvertedError"));
                }
            }
            else
                ResizePictures();
            
            return !_isEnabledImageConvertor;
        }

        private void ResizePictures()
        {
            if (CommonStatistic.IsRun)
                throw new BlException(LocalizationService.GetResource("Admin.Designs.NotPossibleToCompressPhotos"));

            try
            {
                CommonStatistic.StartNew(
                    () => FileHelpers.ResizeCategoryPhotos(_type),
                    "settingstemplate#?settingsTab=catalog",
                    LocalizationService.GetResource("Admin.Designs.ResizeCategoryPictures"));
            }
            catch (Exception ex)
            {
                Debug.Log.Error(ex);
            }
        }
    }
}