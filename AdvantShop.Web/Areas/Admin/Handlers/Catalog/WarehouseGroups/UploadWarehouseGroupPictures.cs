using System;
using System.Drawing;
using System.Web;
using AdvantShop.Catalog;
using AdvantShop.Core.Services.Localization;
using AdvantShop.Diagnostics;
using AdvantShop.FilePath;
using AdvantShop.Helpers;
using AdvantShop.Web.Admin.Models.Settings;

namespace AdvantShop.Web.Admin.Handlers.Catalog.WarehouseGroups
{
    internal sealed class UploadWarehouseGroupPictures
    {
        private readonly int _warehouseGroupId;
        private readonly bool _isEditMode;
        private readonly PhotoType _type;
        private readonly HttpPostedFileBase _file;

        public UploadWarehouseGroupPictures(HttpPostedFileBase file, PhotoType type, int? warehouseGroupId)
        {
            _warehouseGroupId = warehouseGroupId ?? -1;
            _isEditMode = _warehouseGroupId != -1;
            _type = type;
            _file = file;
        }

        public UploadPictureResult Execute()
        {
            UploadPictureResult result;

            if (_file == null || string.IsNullOrEmpty(_file.FileName))
                return new UploadPictureResult { Error = LocalizationService.GetResource("Admin.Error.FileNotFound") };

            if (!FileHelpers.CheckFileExtensionByType(_file.FileName, EFileType.Image))
                return new UploadPictureResult { Error = LocalizationService.GetResource("Core.Errors.UnsupportedImageFormat") };

            if (_type == PhotoType.WarehouseGroupPhoto)
            {
                using (var image = Image.FromStream(_file.InputStream))
                {
                    if (image.Width < 400 || image.Height < 400 || ((double)image.Width / (double)image.Height) != 1)
                        return new UploadPictureResult
                        {
                            Error = LocalizationService.GetResource("Core.UploadWarehouseGroupPictures.ImageWidthHeightError")
                        };
                }
            }

            FileHelpers.UpdateDirectories();

            switch (_type)
            {
                case PhotoType.WarehouseGroupPhoto:
                    result = AddPhoto(_file, PhotoType.WarehouseGroupPhoto, FolderType.WarehouseGroupPhoto);
                    break;
                case PhotoType.WarehouseGroupLogo:
                    result = AddPhoto(_file, PhotoType.WarehouseGroupLogo, FolderType.WarehouseGroupLogo);
                    break;
                default:
                    result = new UploadPictureResult { Error = LocalizationService.GetResource("Admin.Error.FileNotFound") };
                    break;
            }

            return result;
        }

        private UploadPictureResult AddPhoto(HttpPostedFileBase file, PhotoType type, FolderType folderType)
        {
            try
            {
                if (_isEditMode)
                    PhotoService.DeletePhotos(_warehouseGroupId, type);
                
                var photo = new Photo(0, _warehouseGroupId, type) { OriginName = file.FileName };
                var photoName = PhotoService.AddPhoto(photo);

                if (!string.IsNullOrWhiteSpace(photoName))
                {
                    var pathWithName = FoldersHelper.GetPathAbsolut(folderType, photoName);
                        
                    file.SaveAs(pathWithName);

                    return new UploadPictureResult
                    {
                        Result = true,
                        PictureId = photo.PhotoId,
                        Picture = FoldersHelper.GetPath(folderType, photoName, false)
                    };
                }
            }
            catch (OutOfMemoryException ex)
            {
                Debug.Log.Error("UploadCategoryPictures", ex);
                return new UploadPictureResult { Error = LocalizationService.GetResource("Admin.Catalog.ErrorUploadImageFormat") };
            }
            catch (Exception ex)
            {
                Debug.Log.Error("UploadCategoryPictures", ex);
            }
            
            return new UploadPictureResult { Error = LocalizationService.GetResource("Admin.Catalog.ErrorLoadingImage") };
        }
    }
}