using System;
using System.IO;
using System.Web.Mvc;
using System.Drawing;
using System.Drawing.Imaging;
using System.Drawing.Drawing2D;
using AdvantShop.FilePath;
using AdvantShop.Catalog;
using System.Linq;
using System.Web.SessionState;
using AdvantShop.Core.Services.Helpers;
using AdvantShop.Diagnostics;
using AdvantShop.Helpers;
using AdvantShop.Images.WebpDowngrader;

namespace AdvantShop.Controllers
{
    [SessionState(SessionStateBehavior.Disabled)]
    public class AvitoController : BaseClientController
    {
        public FileResult AvitoPhoto(int photoId)
        {
            var photo = PhotoService.GetPhoto<ProductPhoto>(photoId, PhotoType.Product);

            if (photo == null || string.IsNullOrEmpty(photo.PhotoName))
                return null;

            string contentType = null;
            var photoName = photo.PhotoName;

            var extension =
                !photo.PhotoName.Contains("://")
                    ? FileHelpers.GetExtensionWithoutException(photoName).ToLower()
                    : null;

            var isWebp = extension == ".webp";
            if (isWebp)
                photoName = photoName.Replace(".webp", ".jpeg");

            var photoAvitoPath = FoldersHelper.GetPathAbsolut(FolderType.Avito, photoName);

            if (System.IO.File.Exists(photoAvitoPath))
            {
                if (isWebp || !new FileExtensionContentTypeHelper().TryGetContentType(extension, out contentType))
                    contentType = "image/jpeg";

                return File(photoAvitoPath, contentType);
            }

            try
            {
                FileHelpers.UpdateDirectories();

                var photoPath = FoldersHelper.GetImageProductPathAbsolut(ProductImageType.Big, photo.PhotoName);

                if (photo.PhotoName.Contains("://"))
                {
                    if (photo.PhotoName.Contains("cs71.advantshop.net")) // https://cs71.advantshop.net/15705.jpg
                    {
                        photoName = photoPath.Split('/').LastOrDefault();
                        photoPath = FoldersHelper.GetPathAbsolut(FolderType.ImageTemp, photoName);

                        var name = photo.PhotoName.Split('/').LastOrDefault();
                        var url = photo.PhotoName.Replace(name, "") + "pictures/product/big/" +
                                  name.Replace(".", "_big.");

                        if (!FileHelpers.DownloadRemoteImageFile(url, photoPath))
                            return null;

                        photoName = photoName.Replace(".", "_tmp.");
                    }
                    else
                    {
                        photoName = Guid.NewGuid() + "_" + photo.PhotoName.Split('/').LastOrDefault();
                        photoPath = FoldersHelper.GetPathAbsolut(FolderType.ImageTemp, photoName);

                        if (!FileHelpers.DownloadRemoteImageFile(photo.PhotoName, photoPath))
                            return null;

                        photoName = photoName.Replace(".", "_tmp.");
                    }
                }
                else if (isWebp)
                {
                    var fileLink = photo.ImageSrcBig();
                    var tempPath = FoldersHelper.GetPathAbsolut(FolderType.ImageTemp, Guid.NewGuid() + ".jpeg");

                    if (!WebpDownGraderService.DowngradeImageByUri(fileLink, tempPath))
                        return null;

                    try
                    {
                        using (var image = Image.FromFile(tempPath))
                        {
                            if (NeedResize(image) && Resize(image, photoAvitoPath, ".jpeg"))
                                return File(photoAvitoPath, "image/jpeg");
                        }

                        System.IO.File.Copy(tempPath, photoAvitoPath, true);
                        
                        return File(photoAvitoPath, "image/jpeg");
                    }
                    finally
                    {
                        FileHelpers.DeleteFile(tempPath);
                    }
                }

                if (!System.IO.File.Exists(photoPath))
                    return null;

                if (!new FileExtensionContentTypeHelper().TryGetContentType(photoPath, out contentType))
                    contentType = "image/jpeg";

                using (var image = Image.FromFile(photoPath))
                {
                    var path = FoldersHelper.GetPathAbsolut(FolderType.Avito, photoName);

                    if (NeedResize(image) && Resize(image, path, extension))
                        return File(path, contentType);
                }

                return File(photoPath, contentType);
            }
            catch (Exception ex)
            {
                Debug.Log.Error(ex);
            }
            
            return null;
        }

        private bool NeedResize(Image image) =>
            image.Width < 210
            || image.Height < 210
            || (double)image.Width / image.Height > 1.33
            || (double)image.Height / image.Width > 1.33;

        private bool Resize(Image image, string resultPath, string extension)
        {
            var width = image.Width;
            var height = image.Height;
            if (width > height && (double)width / height > 1.33)
            {
                height = Convert.ToInt32(width / 1.33);
            }
            if (width > height && (double)height / width > 1.33)
            {
                width = Convert.ToInt32(height * 1.33);
            }

            try
            {
                using (var img = new Bitmap(image))
                using (var result = new Bitmap(width, height))
                {
                    result.MakeTransparent();
                    using (var graphics = Graphics.FromImage(result))
                    {
                        graphics.Clear(System.Drawing.Color.White);
                        graphics.CompositingQuality = CompositingQuality.HighQuality;
                        graphics.SmoothingMode = SmoothingMode.HighQuality;
                        graphics.InterpolationMode = InterpolationMode.HighQualityBicubic;
                        graphics.PixelOffsetMode = PixelOffsetMode.HighQuality;
                        graphics.DrawImage(img, Math.Abs(image.Width - width) / 2, Math.Abs(image.Height - height) / 2, img.Width, img.Height);

                        graphics.Flush();
                        using (var stream = new FileStream(resultPath, FileMode.CreateNew))
                        {
                            result.Save(stream, GetImageFormat(extension));
                            stream.Close();
                        }
                    }
                }
            }
            catch //(Exception ex)
            {
                //_logger.Error(ex);
                return false;
            }
            return true;
        }
        
        private static ImageFormat GetImageFormat(string fileExt)
        {
            switch (fileExt)
            {
                case ".jpg":
                case ".jpeg":
                    return ImageFormat.Jpeg;
                case ".png":
                    return ImageFormat.Png;
                case ".gif":
                    return ImageFormat.Gif;
                case ".tiff":
                    return ImageFormat.Tiff;
                case ".bmp":
                    return ImageFormat.Bmp;
                default:
                    return ImageFormat.Jpeg;
            }
        }
    }
}