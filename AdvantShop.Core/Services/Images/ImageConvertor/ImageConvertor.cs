using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Web;
using AdvantShop.Catalog;
using AdvantShop.Configuration;
using AdvantShop.Core.Common.Extensions;
using AdvantShop.Core.Scheduler.QuartzJobLogging;
using AdvantShop.Diagnostics;
using AdvantShop.FilePath;
using AdvantShop.Helpers;
using Quartz;

namespace AdvantShop.Images.ImageConvertor
{
    public static class ImageConvertor
    {
        private const string ApiAuthHeaderKey = "x-api-key";

        public static void StartConvert(IJobExecutionContext context)
        {
            if (ImageConvertorStateManager.IsRun)
                return;

            ImageConvertorStateManager.IsRun = true;

            try
            {
                Process(context);
            }
            catch (Exception ex)
            {
                Debug.Log.Error(ex.Message, ex);
                context.LogError($"An unexpected error has occurred: {ex.Message}");
            }
            finally
            {
                ImageConvertorStateManager.IsRun = false;
            }
        }
        
        public static string CovertAndSave(
            byte[] image,
            Photo photo,
            string resultPath,
            int? maxWidth, 
            int? maxHeight, 
            long? quality = null
        )
        {
            var newFileName = photo.PhotoName.Replace(
                FileHelpers.GetExtension(photo.PhotoName),
                ImageConvertorSettings.TargetFormat.GetFormatString());
            
            FileHelpers.UpdateDirectories();

            if (File.Exists(resultPath))
                FileHelpers.DeleteFile(resultPath);
            
            var convertParams = new ConvertParams
            {
                MaxWidth = maxWidth,
                MaxHeight = maxHeight,
                Quality = quality ?? SettingsMain.ImageQuality,
                Format = ImageConvertorSettings.TargetFormat,
            };

            var convertedPhoto = Convert(image, resultPath, convertParams);
            
            SaveFile(resultPath.Replace(photo.PhotoName, newFileName), convertedPhoto);
            
            photo.PhotoName = newFileName;
            
            PhotoService.UpdatePhotoName(photo);
            PhotoService.MarkPhotoAsConverted(photo.PhotoId);

            return photo.PhotoName;
        }

        private static void Process(IJobExecutionContext context)
        {
            var photos =
                PhotoService.GetNotConvertedPhotos(
                    ImageConvertorSettings.TakeCount,
                    ImageConvertorSettings.PhotoTypes);

            if (photos == null || photos.Count == 0) return;

            foreach (var photo in photos)
            {
                context.LogInformation(
                    $@"Started the conversion of the photos with name '{photo.PhotoName}' 
and type '{photo.Type.ToString()}'");
                
                try
                {
                    switch (photo.Type)
                    {
                        case PhotoType.Product:
                            ProcessConvertPhoto(
                                GetProductTypes(),
                                GetSize,
                                FoldersHelper.GetImageProductPathAbsolut,
                                photo);
                            break;
                        case PhotoType.CategoryBig:
                            ProcessConvertPhoto(
                                GetCategoryBigTypes(),
                                GetSize,
                                FoldersHelper.GetImageCategoryPathAbsolut,
                                photo);
                            break;
                        case PhotoType.CategorySmall:
                            ProcessConvertPhoto(
                                GetCategorySmallTypes(), 
                                GetSize, 
                                FoldersHelper.GetImageCategoryPathAbsolut,
                                photo);
                            break;
                        case PhotoType.CategoryIcon:
                            //ProcessConvertPhoto(
                            //    GetCategoryIconTypes(),
                            //    GetSize,
                            //    FoldersHelper.GetImageCategoryPathAbsolut,
                            //    photo);
                            break;
                        default:
                            throw new Exception("Unsupported photo type during convert by ImageConvertor");
                    }
                    
                    context.LogInformation(
                        $@"The photos with name '{photo.PhotoName}' and type '{photo.Type.ToString()}' 
were successfully converted");
                }
                catch (Exception ex)
                {
                    Debug.Log.Error(ex.Message, ex);
                    context.LogError(
                        $@"An error occurred while converting the photos with name '{photo.PhotoName}' 
and with type '{photo.Type.ToString()}'. Error: {ex.Message}");
                }
            }
        }

        private static void ProcessConvertPhoto<TEnum>(
            IEnumerable<TEnum> types,
            Func<TEnum, (int? maxWidth, int? maxHeight)> getSize,
            Func<TEnum, string, string> getPathAbsolut,
            Photo photo
        ) where TEnum : Enum
        {
            var onDeleteFilePaths = new List<string>();
            var mainFilePath = GetMainFilePath(photo.PhotoName, photo.Type);
            var newFileName =
                photo.PhotoName.Replace(
                    FileHelpers.GetExtension(photo.PhotoName),
                    ImageConvertorSettings.TargetFormat.GetFormatString());

            foreach (var type in types)
            {
                var (maxWidth, maxHeight) = getSize(type);

                var fileBytes = Convert(File.ReadAllBytes(mainFilePath), photo.PhotoName, new ConvertParams
                {
                    MaxWidth = maxWidth,
                    MaxHeight = maxHeight,
                    Quality = SettingsMain.ImageQuality,
                    Format = ImageConvertorSettings.TargetFormat,
                });

                var currentFilePath = getPathAbsolut(type, photo.PhotoName);
                if (string.Compare(mainFilePath, currentFilePath, StringComparison.OrdinalIgnoreCase) != 0
                    && !currentFilePath.EndsWith(ImageConvertorSettings.TargetFormat.GetFormatString())
                    && File.Exists(currentFilePath))
                    onDeleteFilePaths.Add(currentFilePath);

                SaveFile(getPathAbsolut(type, newFileName), fileBytes);
            }

            photo.PhotoName = newFileName;
            PhotoService.UpdatePhotoName(photo);
            PhotoService.MarkPhotoAsConverted(photo.PhotoId);

            DeletePhotos(onDeleteFilePaths);
        }

        private static string GetMainFilePath(string photoName, PhotoType type)
        {
            const string exceptionText = "Cannot find main photo";
            string filePath;
            string additionalFilePath;

            switch (type)
            {
                case PhotoType.Product:
                    filePath = FoldersHelper.GetImageProductPathAbsolut(ProductImageType.Original, photoName);
                    if (File.Exists(filePath)) return filePath;

                    additionalFilePath = FoldersHelper.GetImageProductPathAbsolut(ProductImageType.Big, photoName);
                    if (File.Exists(additionalFilePath))
                    {
                        SaveFile(filePath, File.ReadAllBytes(additionalFilePath));
                        return filePath;
                    }

                    break;

                case PhotoType.CategoryBig:
                    filePath = FoldersHelper.GetImageCategoryPathAbsolut(CategoryImageType.BigOriginal, photoName);
                    if (File.Exists(filePath)) return filePath;

                    additionalFilePath = FoldersHelper.GetImageCategoryPathAbsolut(CategoryImageType.Big, photoName);
                    if (File.Exists(additionalFilePath))
                    {
                        SaveFile(filePath, File.ReadAllBytes(additionalFilePath));
                        return filePath;
                    }

                    break;

                case PhotoType.CategorySmall:
                    filePath = FoldersHelper.GetImageCategoryPathAbsolut(CategoryImageType.SmallOriginal, photoName);
                    if (File.Exists(filePath)) return filePath;

                    additionalFilePath = FoldersHelper.GetImageCategoryPathAbsolut(CategoryImageType.Small, photoName);
                    if (File.Exists(additionalFilePath))
                    {
                        SaveFile(filePath, File.ReadAllBytes(additionalFilePath));
                        return filePath;
                    }

                    break;

                case PhotoType.CategoryIcon:
                    filePath = FoldersHelper.GetImageCategoryPathAbsolut(CategoryImageType.Icon, photoName);
                    if (File.Exists(filePath)) return filePath;

                    break;
            }

            throw new Exception(exceptionText);
        }

        private static void DeletePhotos(List<string> paths)
        {
            foreach (var path in paths)
            {
                if (SettingsGeneral.BackupPhotosBeforeDeleting)
                {
                    FileHelpers.BackupPhoto(path);
                }
                FileHelpers.DeleteFile(path);
            }
        }

        private static byte[] Convert(byte[] image, string fileName, ConvertParams parameters)
        {
            if (image == null || image.Length == 0)
                throw new ArgumentNullException(nameof(image));

            if (parameters == null)
                throw new ArgumentNullException(nameof(parameters));

            var url = string.Format(
                "{0}/api/v1/resize?w={1}&h={2}&q={3}&fmt={4}",
                LinkService.Internal.ImageStack,
                parameters.MaxWidth,
                parameters.MaxHeight,
                parameters.Quality,
                parameters.Format.StrName());

            var request = (HttpWebRequest)WebRequest.Create(url);
            request.Method = WebRequestMethods.Http.Post;
            request.ContentType = MimeMapping.GetMimeMapping(fileName);
            request.Headers[ApiAuthHeaderKey] = SettingsLic.LicKey;

            using (var requestStream = request.GetRequestStream())
            {
                requestStream.Write(image, 0, image.Length);
                requestStream.Close();
            }

            using (var response = request.GetResponse())
            using (var responseStream = response.GetResponseStream())
            using (var memoryStream = new MemoryStream())
            {
                if (responseStream == null)
                    throw new Exception(
                        "During the process \"Convert\" in \"ImageConvertor\" of receiving a response was null");

                responseStream.CopyTo(memoryStream);
                return memoryStream.ToArray();
            }
        }
        
        private static void SaveFile(
            string path,
            byte[] fileBytes
        )
        {
            FileHelpers.UpdateDirectories();

            if (File.Exists(path))
                FileHelpers.DeleteFile(path);
            
            File.WriteAllBytes(path, fileBytes);
        }

        #region GetSize

        private static (int?, int?) GetSize(ProductImageType type)
        {
            switch (type)
            {
                case ProductImageType.Big:
                    return (SettingsPictureSize.BigProductImageWidth, SettingsPictureSize.BigProductImageHeight);
                case ProductImageType.Middle:
                    return (SettingsPictureSize.MiddleProductImageWidth, SettingsPictureSize.MiddleProductImageHeight);
                case ProductImageType.Small:
                    return (SettingsPictureSize.SmallProductImageWidth, SettingsPictureSize.SmallProductImageHeight);
                case ProductImageType.XSmall:
                    return (SettingsPictureSize.XSmallProductImageWidth, SettingsPictureSize.XSmallProductImageHeight);
                default:
                    return (null, null);
            }
        }

        private static (int?, int?) GetSize(CategoryImageType type)
        {
            switch (type)
            {
                case CategoryImageType.Big:
                    return (SettingsPictureSize.BigCategoryImageWidth, SettingsPictureSize.BigCategoryImageHeight);
                case CategoryImageType.Small:
                    return (SettingsPictureSize.SmallCategoryImageWidth, SettingsPictureSize.SmallCategoryImageHeight);
                case CategoryImageType.Icon:
                    return (SettingsPictureSize.IconCategoryImageWidth, SettingsPictureSize.IconCategoryImageHeight);
                default:
                    return (null, null);
            }
        }

        #endregion

        #region Types

        private static List<ProductImageType> GetProductTypes() =>
            Enum.GetValues(typeof(ProductImageType))
                .Cast<ProductImageType>()
                .Where(type => type != ProductImageType.Original)
                .ToList();

        private static List<CategoryImageType> GetCategoryBigTypes() =>
            new List<CategoryImageType>
            {
                CategoryImageType.Big,
            };

        private static List<CategoryImageType> GetCategorySmallTypes() =>
            new List<CategoryImageType>
            {
                CategoryImageType.Small,
            };

        private static List<CategoryImageType> GetCategoryIconTypes() =>
            new List<CategoryImageType>
            {
                CategoryImageType.Icon,
            };

        #endregion
    }
}