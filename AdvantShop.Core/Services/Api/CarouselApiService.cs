using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using AdvantShop.Catalog;
using AdvantShop.Core.Services.Configuration.Settings;
using AdvantShop.Core.SQL;
using AdvantShop.Customers;
using AdvantShop.Helpers;

namespace AdvantShop.Core.Services.Api
{
    public class CarouselApiService
    {
         public static CarouselApi Get(int id)
         {
             return SQLDataAccess.Query<CarouselApi>("Select * From CMS.CarouselApi Where id=@id", new {id})
                 .FirstOrDefault();
         }
         
         public static List<CarouselApi> GetList()
         {
             return SQLDataAccess.Query<CarouselApi>("Select * From CMS.CarouselApi Order by SortOrder").ToList();
         }
         
         public static List<CarouselApi> GetListByApi(Customer customer)
         {
             if (customer == null
                 || !customer.RegistredUser && SettingsApiAuth.HideCarouselForUnauthorizedCustomers)
             {
                 return new List<CarouselApi>();
             }

             return SQLDataAccess
                 .Query<CarouselApi>(
                     @"Select * From CMS.CarouselApi 
                           Where Enabled = 1 
                             and (ExpirationDate is null or ExpirationDate > getdate()) 
                             and (
                                    not exists (Select 1 From CMS.CarouselApi_CustomerGroup ccg Where ccg.CarouselId = CarouselApi.Id) 
                                     or exists (Select 1 From CMS.CarouselApi_CustomerGroup ccg Where ccg.CarouselId = CarouselApi.Id and ccg.CustomerGroupId = @customerGroupId)
                                 )
                           Order by SortOrder",
                     new { customerGroupId = customer.CustomerGroupId }
                 ).ToList();
         }

        public static void Delete(int id)
        {
            SQLDataAccess.ExecuteNonQuery(
                "Delete From CMS.CarouselApi Where id=@id", CommandType.Text,
                new SqlParameter("@id", id));
            PhotoService.DeletePhotos(id, PhotoType.CarouselApi);
        }

        public static int Add(CarouselApi carousel)
        {
            carousel.Id = SQLDataAccess.ExecuteScalar<int>(
                "Insert Into CMS.CarouselApi ([Title], [ShortDescription], Enabled, SortOrder, FullDescription, ExpirationDate, ShowOnMain, CouponCode, ProductId, CategoryId, UrlLink) " +
                "Values (@Title, @ShortDescription, @Enabled, @SortOrder, @FullDescription, @ExpirationDate, @ShowOnMain, @CouponCode, @ProductId, @CategoryId, @UrlLink); " +
                "Select scope_identity();",
                CommandType.Text,
                new SqlParameter("@Title", carousel.Title ?? string.Empty),
                new SqlParameter("@ShortDescription", carousel.ShortDescription ?? (object)DBNull.Value),
                new SqlParameter("@FullDescription", carousel.FullDescription ?? (object)DBNull.Value),
                new SqlParameter("@ExpirationDate", carousel.ExpirationDate ?? (object)DBNull.Value),
                new SqlParameter("@ShowOnMain", carousel.ShowOnMain),
                new SqlParameter("@CouponCode", carousel.CouponCode ?? (object)DBNull.Value),
                new SqlParameter("@ProductId", carousel.ProductId ?? (object)DBNull.Value),
                new SqlParameter("@CategoryId", carousel.CategoryId ?? (object)DBNull.Value),
                new SqlParameter("@UrlLink", carousel.UrlLink ?? (object)DBNull.Value),
                new SqlParameter("@Enabled", carousel.Enabled),
                new SqlParameter("@SortOrder", carousel.SortOrder));

            return carousel.Id;
        }

        public static int GetMaxSortOrder()
        {
            return SQLDataHelper.GetInt(SQLDataAccess.ExecuteScalar("Select max(sortorder) from [CMS].[CarouselApi]", CommandType.Text)) + 10;
        }

        public static void Update(CarouselApi carousel)
        {
            SQLDataAccess.ExecuteNonQuery(
                "Update CMS.CarouselApi " + 
                "Set [Title]=@Title, [ShortDescription]=@ShortDescription, Enabled=@Enabled, SortOrder=@SortOrder, " +
                "FullDescription=@FullDescription, ExpirationDate=@ExpirationDate, ShowOnMain=@ShowOnMain, " +
                "CouponCode=@CouponCode, ProductId=@ProductId, CategoryId=@CategoryId, UrlLink=@UrlLink " +
                "Where Id=@Id", 
                CommandType.Text,
                new SqlParameter("@Id", carousel.Id),
                new SqlParameter("@Title", carousel.Title ?? string.Empty),
                new SqlParameter("@ShortDescription", carousel.ShortDescription ?? (object)DBNull.Value),
                new SqlParameter("@FullDescription", carousel.FullDescription ?? (object)DBNull.Value),
                new SqlParameter("@ExpirationDate", carousel.ExpirationDate ?? (object)DBNull.Value),
                new SqlParameter("@ShowOnMain", carousel.ShowOnMain),
                new SqlParameter("@CouponCode", carousel.CouponCode ?? (object)DBNull.Value),
                new SqlParameter("@ProductId", carousel.ProductId ?? (object)DBNull.Value),
                new SqlParameter("@CategoryId", carousel.CategoryId ?? (object)DBNull.Value),
                new SqlParameter("@UrlLink", carousel.UrlLink ?? (object)DBNull.Value),
                new SqlParameter("@Enabled", carousel.Enabled),
                new SqlParameter("@SortOrder", carousel.SortOrder));
        }
        
        #region CustomerGroup link

        public static void AddCustomerGroup(int carouselId, int customerGroupId)
        {
            SQLDataAccess.ExecuteNonQuery(
                "INSERT INTO [CMS].[CarouselApi_CustomerGroup] (CarouselId, CustomerGroupId) VALUES (@CarouselId, @CustomerGroupId)",
                CommandType.Text,
                new SqlParameter("@CarouselId", carouselId),
                new SqlParameter("@CustomerGroupId", customerGroupId));
        }

        public static List<int> GetCustomerGroupIds(int carouselId)
        {
            return SQLDataAccess
                .Query<int>(
                    "SELECT [CustomerGroupId] FROM [CMS].[CarouselApi_CustomerGroup] WHERE CarouselId = @carouselId",
                    new { carouselId })
                .ToList();
        }

        public static void DeleteAllCustomerGroups(int carouselId)
        {
            SQLDataAccess.ExecuteNonQuery("DELETE FROM [CMS].[CarouselApi_CustomerGroup] WHERE CarouselId = @CarouselId",
                                            CommandType.Text,
                                            new SqlParameter("@CarouselId", carouselId));
        }

        #endregion
    }
}