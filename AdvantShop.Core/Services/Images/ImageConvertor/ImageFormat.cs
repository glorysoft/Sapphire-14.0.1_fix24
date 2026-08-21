using System;
using AdvantShop.Core.Common.Attributes;

namespace AdvantShop.Images.ImageConvertor
{
    public enum ImageFormat
    {
        [StringName("webp")] 
        Webp = 0,
        [StringName("jpeg")] 
        Jpeg = 1,
        [StringName("jpeg_progressive")] 
        ProgressiveJpeg = 2,
        [StringName("png")] 
        Png = 3,
        [StringName("avif")] 
        Avif = 4,
    }
    
    public static class FormatExtensions
    {
        public static string GetFormatString(this ImageFormat format)
        {
            switch (format)
            {
                case ImageFormat.Webp:
                    return ".webp";
                case ImageFormat.Jpeg:
                    return ".jpeg";
                case ImageFormat.ProgressiveJpeg:
                    return ".jpg";
                case ImageFormat.Png:
                    return ".png";
                case ImageFormat.Avif:
                    return ".avif";
                default:
                    throw new ArgumentException("Invalid format");
            }
        }
    }
}