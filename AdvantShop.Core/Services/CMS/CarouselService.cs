//--------------------------------------------------
// Project: AdvantShop.NET
// Web site: http:\\www.advantshop.net
//--------------------------------------------------

using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using AdvantShop.Catalog;
using AdvantShop.Core.SQL;
using AdvantShop.Helpers;
using System;
using AdvantShop.Configuration;
using AdvantShop.Core.Caching;
using AdvantShop.Core.Common.Extensions;
using AdvantShop.FilePath;

namespace AdvantShop.Core.Services.CMS
{
    public static class CarouselService
    {
        private const string CarouselCacheKey = "Carousel";

        public static Carousel GetCarousel(int carouselId)
        {
            return SQLDataAccess.ExecuteReadOne<Carousel>("Select TOP 1 * From CMS.Carousel Where CarouselID=@CarouselID",
                CommandType.Text, GetCarouselFromReader, new SqlParameter("@CarouselID", carouselId));
        }

        public static void SetActive(int carouselId, bool active)
        {
            SQLDataAccess.ExecuteNonQuery("Update CMS.Carousel set Enabled=@Enabled where CarouselID=@CarouselID", CommandType.Text,
                                        new SqlParameter("@CarouselID", carouselId),
                                        new SqlParameter("@Enabled", active));

            CacheManager.RemoveByPattern(CarouselCacheKey);
        }

        public static void DeleteCarousel(int id)
        {
            SQLDataAccess.ExecuteNonQuery(
                "DELETE FROM [CMS].[Carousel] WHERE [CMS].[Carousel].[CarouselID] = @CarouselID",
                CommandType.Text, new SqlParameter("@CarouselID", id));
            PhotoService.DeletePhotos(id, PhotoType.Carousel);
            FileHelpers.DeleteDirectory(FoldersHelper.GetPathAbsolut(FolderType.CarouselVideo, id + "/"));

            CacheManager.RemoveByPattern(CarouselCacheKey);

            SettingsDesign.IsDefaultSlides = false;
        }

        public static int AddCarousel(Carousel carousel)
        {
            CacheManager.RemoveByPattern(CarouselCacheKey);

            SettingsDesign.IsDefaultSlides = false;

            carousel.CarouselId = SQLDataAccess.ExecuteScalar<int>(
                    "INSERT INTO [CMS].[Carousel] ([Url], [SortOrder], [Enabled], [DisplayInOneColumn], " +
                    "[DisplayInTwoColumns], [DisplayInMobile], [Blank], [Obscuring], [MarginTop], [MarginBottom], " +
                    "[MarginLeft], [MarginRight], [HeaderTextColorCode], [IsVideo]) " +
                    "VALUES (@Url, @SortOrder, @Enabled, @DisplayInOneColumn, @DisplayInTwoColumns, @DisplayInMobile, " +
                    "@Blank, @Obscuring, @MarginTop, @MarginBottom, @MarginLeft, @MarginRight, @HeaderTextColorCode, @IsVideo); " +
                    "SELECT SCOPE_IDENTITY()",
                    CommandType.Text,
                    new SqlParameter("@URL", carousel.Url ?? string.Empty),
                    new SqlParameter("@Enabled", carousel.Enabled),
                    new SqlParameter("@SortOrder", carousel.SortOrder),
                    new SqlParameter("@DisplayInOneColumn", carousel.DisplayInOneColumn),
                    new SqlParameter("@DisplayInTwoColumns", carousel.DisplayInTwoColumns),
                    new SqlParameter("@DisplayInMobile", carousel.DisplayInMobile),
                    new SqlParameter("@Blank", carousel.Blank),
                    new SqlParameter("@Obscuring", carousel.Obscuring),
                    new SqlParameter("@MarginTop", carousel.MarginTop),
                    new SqlParameter("@MarginBottom", carousel.MarginBottom),
                    new SqlParameter("@MarginLeft", carousel.MarginLeft),
                    new SqlParameter("@MarginRight", carousel.MarginRight),
                    new SqlParameter("@HeaderTextColorCode", carousel.HeaderTextColorCode ?? (object)DBNull.Value),
                    new SqlParameter("@IsVideo", carousel.IsVideo));

            return carousel.CarouselId;
        }

        public static int GetMaxSortOrder()
        {
            return SQLDataHelper.GetInt(SQLDataAccess.ExecuteScalar("Select max(sortorder) from [CMS].[Carousel]", CommandType.Text)) + 10;
        }


        public static void UpdateCarousel(Carousel carousel)
        {
            CacheManager.RemoveByPattern(CarouselCacheKey);

            SQLDataAccess.ExecuteNonQuery(
                "UPDATE [CMS].[Carousel] SET [URL] = @URL, [SortOrder] = @SortOrder, [Enabled] = @Enabled, " +
                "[DisplayInOneColumn] = @DisplayInOneColumn, [DisplayInTwoColumns] = @DisplayInTwoColumns, " +
                "[DisplayInMobile] = @DisplayInMobile, [Blank] = @Blank, [Obscuring] = @Obscuring, [MarginTop] = @MarginTop, " +
                "[MarginBottom] = @MarginBottom, [MarginLeft] = @MarginLeft, [MarginRight] = @MarginRight, " +
                "[HeaderTextColorCode] = @HeaderTextColorCode, [IsVideo] = @IsVideo WHERE CarouselID = @CarouselID",
                CommandType.Text,
                new SqlParameter("@CarouselID", carousel.CarouselId),
                new SqlParameter("@URL", carousel.Url),
                new SqlParameter("@SortOrder", carousel.SortOrder),
                new SqlParameter("@Enabled", carousel.Enabled),
                new SqlParameter("@DisplayInOneColumn", carousel.DisplayInOneColumn),
                new SqlParameter("@DisplayInTwoColumns", carousel.DisplayInTwoColumns),
                new SqlParameter("@DisplayInMobile", carousel.DisplayInMobile),
                new SqlParameter("@Blank", carousel.Blank),
                new SqlParameter("@Obscuring", carousel.Obscuring),
                new SqlParameter("@MarginTop", carousel.MarginTop),
                new SqlParameter("@MarginBottom", carousel.MarginBottom),
                new SqlParameter("@MarginLeft", carousel.MarginLeft),
                new SqlParameter("@MarginRight", carousel.MarginRight),
                new SqlParameter("@HeaderTextColorCode", carousel.HeaderTextColorCode ?? (object)DBNull.Value),
                new SqlParameter("@IsVideo", carousel.IsVideo));
        }

        private static Carousel GetCarouselFromReader(IDataReader reader)
        {
            return new Carousel
            {
                CarouselId = SQLDataHelper.GetInt(reader, "CarouselID"),
                Url = SQLDataHelper.GetString(reader, "URL"),
                SortOrder = SQLDataHelper.GetInt(reader, "SortOrder"),
                Enabled = SQLDataHelper.GetBoolean(reader, "Enabled"),
                DisplayInOneColumn = SQLDataHelper.GetBoolean(reader, "DisplayInOneColumn"),
                DisplayInTwoColumns = SQLDataHelper.GetBoolean(reader, "DisplayInTwoColumns"),
                DisplayInMobile = SQLDataHelper.GetBoolean(reader, "DisplayInMobile"),
                Blank = SQLDataHelper.GetBoolean(reader, "Blank"),
                Obscuring = SQLDataHelper.GetInt(reader, "Obscuring"),
                MarginTop = SQLDataHelper.GetInt(reader, "MarginTop"),
                MarginBottom = SQLDataHelper.GetInt(reader, "MarginBottom"),
                MarginLeft = SQLDataHelper.GetInt(reader, "MarginLeft"),
                MarginRight = SQLDataHelper.GetInt(reader, "MarginRight"),
                HeaderTextColorCode = SQLDataHelper.GetString(reader, "HeaderTextColorCode"),
                IsVideo = SQLDataHelper.GetBoolean(reader, "IsVideo"),
            };
        }

        public static List<Carousel> GetAllCarousels()
        {
            return SQLDataAccess.ExecuteReadList("Select * From CMS.Carousel Order by SortOrder", CommandType.Text, GetCarouselFromReader);
        }

        public static int GetCountEnabledCarouselsMainPage()
        {
            return SQLDataAccess.ExecuteScalar<int>("Select COUNT(*) From CMS.Carousel WHERE Enabled = 1", CommandType.Text);
        }

        public static List<Carousel> GetAllCarouselsMainPage(ECarouselPageMode mainPageMode)
        {
            string where = "";
            var isAdvancedCarouselSettings  = FeaturesService.IsEnabled(EFeature.AdvancedCarouselSettings);
            
            switch (mainPageMode)
            {
                case ECarouselPageMode.OneColumn:
                    where += " and DisplayInOneColumn=1";
                    break;
                case ECarouselPageMode.TwoColumns:
                    where += " and DisplayInTwoColumns=1";
                    break;
                case ECarouselPageMode.Mobile:
                    where += " and DisplayInMobile=1";
                    break;
                default: throw new NotImplementedException(mainPageMode.ToString() + " not implemented");
            }

            if (!isAdvancedCarouselSettings)
            {
                where += " and IsVideo=0";
            }

            return
                    CacheManager.Get(CarouselCacheKey + mainPageMode.ToString() + (SettingsMain.EnableInplace ? "Inplace" : "") 
                                     + (isAdvancedCarouselSettings ? "AdvancedCarouselSettings": ""), 
                        () =>
                    SQLDataAccess.ExecuteReadList(
                        "Select CarouselID, PhotoId, ObjId, URL, PhotoName, Description, DisplayInOneColumn, " +
                        "DisplayInTwoColumns, DisplayInMobile, Blank, Obscuring, MarginTop, MarginBottom, MarginLeft, " +
                        "MarginRight, HeaderTextColorCode, IsVideo " +
                        "From CMS.Carousel Left Join Catalog.Photo on Photo.ObjId = Carousel.CarouselID and Type = @Type " +
                        "Where Enabled = 1 " + where +
                        "Order by SortOrder",
                        CommandType.Text,
                        reader => new Carousel
                        {
                            CarouselId = SQLDataHelper.GetInt(reader, "CarouselID"),
                            Url = SQLDataHelper.GetString(reader, "URL"),
                            Picture =
                                new CarouselPhoto(SQLDataHelper.GetInt(reader, "PhotoId"),
                                    SQLDataHelper.GetInt(reader, "ObjId"))
                                {
                                    PhotoName = SQLDataHelper.GetString(reader, "PhotoName"),
                                    Description = SQLDataHelper.GetString(reader, "Description")
                                },
                            DisplayInOneColumn = SQLDataHelper.GetBoolean(reader, "DisplayInOneColumn"),
                            DisplayInTwoColumns = SQLDataHelper.GetBoolean(reader, "DisplayInTwoColumns"),
                            DisplayInMobile = SQLDataHelper.GetBoolean(reader, "DisplayInMobile"),
                            Blank = SQLDataHelper.GetBoolean(reader, "Blank"),
                            Obscuring = SQLDataHelper.GetInt(reader, "Obscuring"),
                            MarginTop = SQLDataHelper.GetInt(reader, "MarginTop"),
                            MarginBottom = SQLDataHelper.GetInt(reader, "MarginBottom"),
                            MarginLeft = SQLDataHelper.GetInt(reader, "MarginLeft"),
                            MarginRight = SQLDataHelper.GetInt(reader, "MarginRight"),
                            HeaderTextColorCode = SQLDataHelper.GetString(reader, "HeaderTextColorCode"),
                            IsVideo = SQLDataHelper.GetBoolean(reader, "IsVideo"),
                        },
                        new SqlParameter("@Type", PhotoType.Carousel.ToString())));
        }

        public static void ClearCacheCarousel()
        {
            CacheManager.RemoveByPattern(CarouselCacheKey);
        }
        
        #region CarouselText
        
        private static CarouselText GetCarouselTextFromReader(IDataReader reader) =>
            new CarouselText
            {
                Id = SQLDataHelper.GetInt(reader, "Id"),
                CarouselId = SQLDataHelper.GetInt(reader, "CarouselId"),
                Title = SQLDataHelper.GetString(reader, "Title"),
                TitleSize = SQLDataHelper.GetInt(reader, "TitleSize"),
                TitleLineHeight = SQLDataHelper.GetFloat(reader, "TitleLineHeight"),
                Text = SQLDataHelper.GetString(reader, "Text"),
                TextSize = SQLDataHelper.GetInt(reader, "TextSize"),
                TextLineHeight = SQLDataHelper.GetFloat(reader, "TextLineHeight"),
                ColorCode = SQLDataHelper.GetString(reader, "ColorCode"),
                BlockSize = SQLDataHelper.GetInt(reader, "BlockSize"),
                Alignment = SQLDataHelper.GetString(reader, "Alignment").TryParseEnum<ETextAlignment>(),
                PositionHorizontal = SQLDataHelper.GetString(reader, "PositionHorizontal").TryParseEnum<ETextPositionHorizontal>(),
                PositionVertical = SQLDataHelper.GetString(reader, "PositionVertical").TryParseEnum<ETextPositionVertical>(),
                Animation = SQLDataHelper.GetString(reader, "Animation").TryParseEnum<ETextAnimation>(),
                Enabled = SQLDataHelper.GetBoolean(reader, "Enabled"),
            };
        
        public static CarouselText GetCarouselText(int carouselTextId) =>
            SQLDataAccess.ExecuteReadOne("Select TOP 1 * From [CMS].[CarouselText] Where Id=@Id",
                CommandType.Text, GetCarouselTextFromReader, new SqlParameter("@Id", carouselTextId));
        
        public static CarouselText GetCarouselTextByCarousel(int carouselId) =>
            SQLDataAccess.ExecuteReadOne("Select TOP 1 * From [CMS].[CarouselText] Where CarouselId=@CarouselId",
                CommandType.Text, GetCarouselTextFromReader, new SqlParameter("@CarouselId", carouselId));

        public static int AddCarouselText(CarouselText text) =>
            SQLDataAccess.ExecuteScalar<int>(
                "INSERT INTO [CMS].[CarouselText] ([CarouselId], [Title], [TitleSize], [TitleLineHeight], [Text], [TextSize], " +
                "[TextLineHeight], [ColorCode], [BlockSize], [Alignment], [PositionHorizontal], [PositionVertical], [Animation], [Enabled]) " +
                "VALUES (@CarouselId, @Title, @TitleSize, @TitleLineHeight, @Text, @TextSize, @TextLineHeight, @ColorCode, @BlockSize, " +
                "@Alignment, @PositionHorizontal, @PositionVertical, @Animation, @Enabled); SELECT SCOPE_IDENTITY()",
                CommandType.Text,
                new SqlParameter("@CarouselId", text.CarouselId),
                new SqlParameter("@Title", text.Title ?? string.Empty),
                new SqlParameter("@TitleSize", text.TitleSize),
                new SqlParameter("@TitleLineHeight", Math.Round(text.TitleLineHeight, 2, MidpointRounding.AwayFromZero)),
                new SqlParameter("@Text", text.Text ?? string.Empty),
                new SqlParameter("@TextSize", text.TextSize),
                new SqlParameter("@TextLineHeight", Math.Round(text.TextLineHeight, 2, MidpointRounding.AwayFromZero)),
                new SqlParameter("@ColorCode", text.ColorCode),
                new SqlParameter("@BlockSize", text.BlockSize),
                new SqlParameter("@Alignment", text.Alignment.ToString()),
                new SqlParameter("@PositionHorizontal", text.PositionHorizontal.ToString()),
                new SqlParameter("@PositionVertical", text.PositionVertical.ToString()),
                new SqlParameter("@Animation", text.Animation.ToString()),
                new SqlParameter("@Enabled", text.Enabled));
        
        public static void UpdateCarouselText(CarouselText text) =>
            SQLDataAccess.ExecuteNonQuery(
                "UPDATE [CMS].[CarouselText] SET [CarouselId] = @CarouselId, [Title] = @Title, " +
                "[TitleSize] = @TitleSize, [TitleLineHeight] = @TitleLineHeight, [Text] = @Text, [TextSize] = @TextSize, " +
                "[TextLineHeight] = @TextLineHeight, [ColorCode] = @ColorCode, [BlockSize] = @BlockSize, " +
                "[Alignment] = @Alignment, [PositionHorizontal] = @PositionHorizontal, [PositionVertical] = @PositionVertical, " +
                "[Animation] = @Animation, [Enabled] = @Enabled WHERE Id = @Id",
                CommandType.Text,
                new SqlParameter("@Id", text.Id),
                new SqlParameter("@CarouselId", text.CarouselId),
                new SqlParameter("@Title", text.Title ?? string.Empty),
                new SqlParameter("@TitleSize", text.TitleSize),
                new SqlParameter("@TitleLineHeight", Math.Round(text.TitleLineHeight, 2, MidpointRounding.AwayFromZero)),
                new SqlParameter("@Text", text.Text ?? string.Empty),
                new SqlParameter("@TextSize", text.TextSize),
                new SqlParameter("@TextLineHeight", Math.Round(text.TextLineHeight, 2, MidpointRounding.AwayFromZero)),
                new SqlParameter("@ColorCode", text.ColorCode),
                new SqlParameter("@BlockSize", text.BlockSize),
                new SqlParameter("@Alignment", text.Alignment.ToString()),
                new SqlParameter("@PositionHorizontal", text.PositionHorizontal.ToString()),
                new SqlParameter("@PositionVertical", text.PositionVertical.ToString()),
                new SqlParameter("@Animation", text.Animation.ToString()),
                new SqlParameter("@Enabled", text.Enabled));
        
        public static void DeleteCarouselText(int carouselTextId) =>
            SQLDataAccess.ExecuteNonQuery("DELETE FROM [CMS].[CarouselText] WHERE Id = @Id", CommandType.Text, 
                new SqlParameter("@Id", carouselTextId));
        
        public static void DeleteCarouselTextByCarousel(int carouselId) =>
            SQLDataAccess.ExecuteNonQuery("DELETE FROM [CMS].[CarouselText] WHERE CarouselId = @CarouselId", CommandType.Text, 
                new SqlParameter("@CarouselId", carouselId));

        #endregion
        
        #region CarouselButton
        
        private static CarouselButton GetCarouselButtonFromReader(IDataReader reader) =>
            new CarouselButton
            {
                Id = SQLDataHelper.GetInt(reader, "Id"),
                CarouselId = SQLDataHelper.GetInt(reader, "CarouselId"),
                Text = SQLDataHelper.GetString(reader, "Text"),
                Url = SQLDataHelper.GetString(reader, "URL"),
                Blank = SQLDataHelper.GetBoolean(reader, "Blank"),
                ButtonColorCode = SQLDataHelper.GetString(reader, "ButtonColorCode"),
                TextColorCode = SQLDataHelper.GetString(reader, "TextColorCode"),
                Enabled = SQLDataHelper.GetBoolean(reader, "Enabled"),
                UseStoreColorScheme = SQLDataHelper.GetBoolean(reader, "UseStoreColorScheme"),
            };
        
        public static CarouselButton GetCarouselButton(int carouselButtonId) =>
            SQLDataAccess.ExecuteReadOne("Select TOP 1 * From [CMS].[CarouselButton] Where Id=@Id",
                CommandType.Text, GetCarouselButtonFromReader, new SqlParameter("@Id", carouselButtonId));
        
        public static List<CarouselButton> GetCarouselButtonsByCarousel(int carouselId) =>
            SQLDataAccess.ExecuteReadList("Select * From [CMS].[CarouselButton] Where CarouselId=@CarouselId",
                CommandType.Text, GetCarouselButtonFromReader, new SqlParameter("@CarouselId", carouselId));

        public static int AddCarouselButton(CarouselButton button) =>
            SQLDataAccess.ExecuteScalar<int>(
                "INSERT INTO [CMS].[CarouselButton] ([CarouselId], [Text], [URL], [Blank], [ButtonColorCode], [TextColorCode], [Enabled], [UseStoreColorScheme]) " +
                "VALUES (@CarouselId, @Text, @URL, @Blank, @ButtonColorCode, @TextColorCode, @Enabled, @UseStoreColorScheme); SELECT SCOPE_IDENTITY()",
                CommandType.Text,
                new SqlParameter("@CarouselId", button.CarouselId),
                new SqlParameter("@Text", button.Text ?? string.Empty),
                new SqlParameter("@URL", button.Url ?? string.Empty),
                new SqlParameter("@Blank", button.Blank),
                new SqlParameter("@ButtonColorCode", button.ButtonColorCode),
                new SqlParameter("@TextColorCode", button.TextColorCode),
                new SqlParameter("@Enabled", button.Enabled),
                new SqlParameter("@UseStoreColorScheme", button.UseStoreColorScheme));
        
        public static void UpdateCarouselButton(CarouselButton button) =>
            SQLDataAccess.ExecuteNonQuery(
                "UPDATE [CMS].[CarouselButton] SET [CarouselId] = @CarouselId, [Text] = @Text, [URL] = @URL, [Blank] = @Blank, " +
                "[ButtonColorCode] = @ButtonColorCode, [TextColorCode] = @TextColorCode, [Enabled] = @Enabled, [UseStoreColorScheme] = @UseStoreColorScheme WHERE Id = @Id",
                CommandType.Text,
                new SqlParameter("@Id", button.Id),
                new SqlParameter("@CarouselId", button.CarouselId),
                new SqlParameter("@Text", button.Text ?? string.Empty),
                new SqlParameter("@URL", button.Url ?? string.Empty),
                new SqlParameter("@Blank", button.Blank),
                new SqlParameter("@ButtonColorCode", button.ButtonColorCode),
                new SqlParameter("@TextColorCode", button.TextColorCode),
                new SqlParameter("@Enabled", button.Enabled),
                new SqlParameter("@UseStoreColorScheme", button.UseStoreColorScheme));
        
        public static void DeleteCarouselButton(int carouselButtonId) =>
            SQLDataAccess.ExecuteNonQuery("DELETE FROM [CMS].[CarouselButton] WHERE Id = @Id", CommandType.Text, 
                new SqlParameter("@Id", carouselButtonId));
        
        public static void DeleteCarouselButtonsByCarousel(int carouselId) =>
            SQLDataAccess.ExecuteNonQuery("DELETE FROM [CMS].[CarouselButton] WHERE CarouselId = @CarouselId", CommandType.Text, 
                new SqlParameter("@CarouselId", carouselId));

        #endregion
    }
}