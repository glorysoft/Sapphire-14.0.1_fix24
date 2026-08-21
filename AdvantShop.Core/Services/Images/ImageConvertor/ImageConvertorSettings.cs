using System;
using System.Collections.Generic;
using AdvantShop.Catalog;
using AdvantShop.Configuration;
using Newtonsoft.Json;

namespace AdvantShop.Images.ImageConvertor
{
    public static class ImageConvertorSettings
    {
        public static int TakeCount
        {
            get
            {
                var value = SettingProvider.Items["ImageConvertorSettings_TakeCount"];
                
                return string.IsNullOrWhiteSpace(value)
                    ? 200 
                    : Convert.ToInt32(value); 
            }
        }

        public static ImageFormat TargetFormat
        {
            get
            {
                var value = SettingProvider.Items["ImageConvertorSettings_TargetFormat"];

                return string.IsNullOrWhiteSpace(value)
                    ? ImageFormat.Webp 
                    : (ImageFormat)Convert.ToInt32(value);
            }
        }

        public static List<PhotoType> PhotoTypes
        {
            get
            {
                var value = SettingProvider.Items["ImageConvertorSettings_PhotoTypes"];

                return string.IsNullOrWhiteSpace(value)
                    ? new List<PhotoType>
                    {
                        PhotoType.Product,
                        PhotoType.CategoryBig,
                        PhotoType.CategorySmall,
                        PhotoType.CategoryIcon,
                    }
                    : JsonConvert.DeserializeObject<List<PhotoType>>(value);
            }
        }
    }
}