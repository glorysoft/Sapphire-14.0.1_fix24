using System;
using System.Drawing;
using System.IO;
using AdvantShop.Catalog;
using AdvantShop.Core.Common.Extensions;
using AdvantShop.Core.Services.Localization;
using AdvantShop.Diagnostics;
using AdvantShop.FilePath;
using AdvantShop.Helpers;
using AdvantShop.Web.Admin.Models.Catalog.Categories;

namespace AdvantShop.Web.Admin.Handlers.Catalog.WarehouseGroups
{
    public class UploadWarehouseGroupPicturesByLink
    {
        private readonly int _warehouseGroupId;
        private readonly bool _isEditMode;
        private readonly PhotoType _type;
        private readonly string _fileLink;

        public UploadWarehouseGroupPicturesByLink(PhotoType type, int? warehouseGroupId, string fileLink)
        {
            _warehouseGroupId = warehouseGroupId ?? -1;
            _isEditMode = _warehouseGroupId != -1;
            _type = type;
            _fileLink = fileLink;
        }

        public UploadPictureResult Execute()
        {
            if (string.IsNullOrEmpty(_fileLink))
                return new UploadPictureResult { Error = LocalizationService.GetResource("Admin.Error.FileNotFound") };

            if (!FileHelpers.CheckFileExtensionByType(_fileLink, EFileType.Image))
                return new UploadPictureResult { Error = LocalizationService.GetResource("Admin.Errors.UnsupportedImageFormat") };

            UploadPictureResult result;

            FileHelpers.UpdateDirectories();

            switch (_type)
            {
                case PhotoType.WarehouseGroupPhoto:
                    result = AddPhoto(_fileLink, PhotoType.WarehouseGroupPhoto, FolderType.WarehouseGroupPhoto);
                    break;
                case PhotoType.WarehouseGroupLogo:
                    result = AddPhoto(_fileLink, PhotoType.WarehouseGroupLogo, FolderType.WarehouseGroupLogo);
                    break;
                default:
                    result = new UploadPictureResult { Error = LocalizationService.GetResource("Admin.Error.FileNotFound") };
                    break;
            }

            return result;
        }

        private UploadPictureResult AddPhoto(string fileLink, PhotoType type, FolderType folderType)
        {
            string error = null;

            try
            {
                var photo = new Photo(0, _warehouseGroupId, type) {OriginName = fileLink.Split('?')[0] };
                var tempPhotoName = Path.GetFileName(fileLink.Split('?')[0]);
                if (tempPhotoName.Length > 100)
                {
                    var ext = FileHelpers.GetExtension(fileLink);
                    tempPhotoName = Guid.NewGuid() + ext;
                }
                    
                var tempPhotoFullName = FoldersHelper.GetPathAbsolut(FolderType.ImageTemp, tempPhotoName);

                if (!string.IsNullOrWhiteSpace(tempPhotoName) &&
                    FileHelpers.DownloadRemoteImageFile(fileLink, tempPhotoFullName, out error))
                {
                    if (_type == PhotoType.WarehouseGroupPhoto)
                    {
                        using (var image = Image.FromFile(tempPhotoFullName))
                        {
                            if (image.Width < 400 || image.Height < 400 || ((double)image.Width / (double)image.Height) != 1)
                                return new UploadPictureResult
                                {
                                    Error = LocalizationService.GetResource("Core.UploadWarehouseGroupPictures.ImageWidthHeightError")
                                };
                        }
                    }
                    
                    if (_isEditMode)
                        PhotoService.DeletePhotos(_warehouseGroupId, type);

                    var photoName = PhotoService.AddPhoto(photo);
                    
                    if (!string.IsNullOrWhiteSpace(photoName))
                    {
                        var pathWithName = FoldersHelper.GetPathAbsolut(folderType, photoName);
                        
                        File.Copy(tempPhotoFullName, pathWithName);
                        FileHelpers.DeleteFile(tempPhotoFullName);

                        return new UploadPictureResult
                        {
                            Result = true,
                            PictureId = photo.PhotoId,
                            Picture = FoldersHelper.GetPath(folderType, photoName, false)
                        };
                    }
                }
            }
            catch (OutOfMemoryException ex)
            {
                Debug.Log.Error($"UploadCategoryPicturesByLink {fileLink}", ex);
                error = LocalizationService.GetResource("Admin.Catalog.ErrorUploadImageFormat");
            }
            catch (Exception ex)
            {
                Debug.Log.Error($"UploadCategoryPicturesByLink {fileLink}", ex);
            }
            
            return new UploadPictureResult { Error = error ?? LocalizationService.GetResource("Admin.Catalog.ErrorLoadingImage") };
        }

    }
}
