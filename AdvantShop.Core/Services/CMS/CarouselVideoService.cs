using System;
using System.Data;
using System.Data.SqlClient;
using AdvantShop.Core.SQL;
using AdvantShop.Helpers;

namespace AdvantShop.Core.Services.CMS
{
    public class CarouselVideoService
    {
        public static CarouselVideo GetCarouselVideo(int carouselVideoId) =>
            SQLDataAccess.ExecuteReadOne("SELECT TOP 1 * FROM [CMS].[CarouselVideo] WHERE [Id] = @Id",
                CommandType.Text, GetCarouselVideoFromReader, new SqlParameter("@Id", carouselVideoId));

        public static CarouselVideo GetCarouselVideoByCarousel(int carouselId) =>
            SQLDataAccess.ExecuteReadOne("SELECT TOP 1 * FROM [CMS].[CarouselVideo] WHERE [CarouselId] = @CarouselId",
                CommandType.Text, GetCarouselVideoFromReader, new SqlParameter("@CarouselId", carouselId));
        
        public static CarouselVideo GetCarouselVideoByVideoName(string videoName) =>
            SQLDataAccess.ExecuteReadOne("SELECT TOP 1 * FROM [CMS].[CarouselVideo] WHERE [VideoName] = @VideoName",
                CommandType.Text, GetCarouselVideoFromReader, new SqlParameter("@VideoName", videoName));
        
        private static CarouselVideo GetCarouselVideoFromReader(SqlDataReader reader) =>
            new CarouselVideo
            {
                Id = SQLDataHelper.GetInt(reader, "Id"),
                CarouselId = SQLDataHelper.GetInt(reader, "CarouselId"),
                VideoName = SQLDataHelper.GetString(reader, "VideoName"),
                ModifiedDate = SQLDataHelper.GetDateTime(reader, "ModifiedDate"),
                Description = SQLDataHelper.GetString(reader, "Description"),
                OriginName = SQLDataHelper.GetString(reader, "OriginName"),
            };
        
        public static int AddCarouselVideo(CarouselVideo video) =>
            SQLDataAccess.ExecuteScalar<int>(
                "INSERT INTO [CMS].[CarouselVideo] ([CarouselId], [VideoName], [ModifiedDate], [Description], [OriginName]) " +
                "VALUES (@CarouselId, @VideoName, @ModifiedDate, @Description, @OriginName); SELECT SCOPE_IDENTITY()",
                CommandType.Text,
                new SqlParameter("@CarouselId", video.CarouselId),
                new SqlParameter("@VideoName", video.VideoName ?? string.Empty),
                new SqlParameter("@ModifiedDate", video.ModifiedDate),
                new SqlParameter("@Description", video.Description ?? (object)DBNull.Value),
                new SqlParameter("@OriginName", video.OriginName ?? (object)DBNull.Value));
        
        public static void UpdateCarouselVideo(CarouselVideo video) =>
            SQLDataAccess.ExecuteNonQuery(
                "UPDATE [CMS].[CarouselVideo] SET [CarouselId] = @CarouselId, [VideoName] = @VideoName, " +
                "[ModifiedDate] = @ModifiedDate, [Description] = @Description, [OriginName] = @OriginName WHERE Id = @Id",
                CommandType.Text,
                new SqlParameter("@Id", video.Id),
                new SqlParameter("@CarouselId", video.CarouselId),
                new SqlParameter("@VideoName", video.VideoName ?? string.Empty),
                new SqlParameter("@ModifiedDate", video.ModifiedDate),
                new SqlParameter("@Description", video.Description ?? (object)DBNull.Value),
                new SqlParameter("@OriginName", video.OriginName ?? (object)DBNull.Value));
        
        public static void DeleteCarouselVideo(int carouselVideoId) =>
            SQLDataAccess.ExecuteNonQuery("DELETE FROM [CMS].[CarouselVideo] WHERE Id = @Id",
                CommandType.Text, new SqlParameter("@Id", carouselVideoId));
        
        public static void DeleteCarouselVideoByCarousel(int carouselId) =>
            SQLDataAccess.ExecuteNonQuery("DELETE FROM [CMS].[CarouselVideo] WHERE CarouselId = @CarouselId",
                CommandType.Text, new SqlParameter("@CarouselId", carouselId));
    }
}