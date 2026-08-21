using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using AdvantShop.Core.Common.Extensions;
using AdvantShop.Core.SQL;
using AdvantShop.Helpers;

namespace AdvantShop.Core.Services.Shipping.Boxberry.DeliveryPoints
{
    public class DeliveryPointService
    {
        public static DeliveryPointDto Get(string code)
        {
            if (code.IsNotEmpty())
            {
                return SQLDataAccess.ExecuteReadOne(
                    "SELECT * FROM [Shipping].[BoxberryDeliveryPoint] WHERE [Code] = @Code",
                    CommandType.Text,
                    FromReader,
                    new SqlParameter("@Code", code ?? (object)DBNull.Value));
            }
            return null;
        }

        public static IList<DeliveryPointDto> GetList()
        {
            return SQLDataAccess.ExecuteReadList(
                "SELECT * FROM [Shipping].[BoxberryDeliveryPoint]",
                CommandType.Text,
                FromReader);
        }
     
        public static IList<DeliveryPointDto> Find(string cityCode, float? weightInKilogramm, double? volumeInMetres)
        {
            if (cityCode.IsNullOrEmpty() && weightInKilogramm is null && volumeInMetres is null)
                return GetList();
      
            
            var listParams = new List<SqlParameter>();
            var where = new List<string>();

            if (cityCode.IsNotEmpty())
            {
                listParams.Add(new SqlParameter("@CityCode", cityCode));
                where.Add("[CityCode] = @CityCode");
            }

            if (weightInKilogramm.HasValue)
            {
                listParams.Add(new SqlParameter("@Weight", weightInKilogramm.Value));
                where.Add("([WeightMax] IS NULL OR [WeightMax] >= @Weight)");
            }

            if (volumeInMetres != null)
            {
                listParams.Add(new SqlParameter("@VolumeLimit", volumeInMetres.Value));
                
                where.Add("([VolumeLimit] IS NULL OR [VolumeLimit] >= @VolumeLimit)");
            }
      
            return SQLDataAccess.ExecuteReadList(
                $"SELECT * FROM [Shipping].[BoxberryDeliveryPoint] WHERE {string.Join(" AND ", where)}",
                CommandType.Text,
                FromReader,
                listParams.ToArray());
        }
   
        public static IList<DeliveryPointDto> FindByBounds(float topLeftLatitude, float topLeftLongitude,
            float bottomRightLatitude, float bottomRightLongitude)
        {
            var listParams = new List<SqlParameter>();
            var where = new List<string>();

            listParams.Add(new SqlParameter("@topLeftLatitude", topLeftLatitude));
            where.Add("@topLeftLatitude > [Latitude]");
            listParams.Add(new SqlParameter("@topLeftLongitude", topLeftLongitude));
            where.Add("@topLeftLongitude < [Longitude]");
            listParams.Add(new SqlParameter("@bottomRightLatitude", bottomRightLatitude));
            where.Add("@bottomRightLatitude < [Latitude]");
            listParams.Add(new SqlParameter("@bottomRightLongitude", bottomRightLongitude));
            where.Add("@bottomRightLongitude > [Longitude]");

            return SQLDataAccess.ExecuteReadList(
                $"SELECT * FROM [Shipping].[BoxberryDeliveryPoint] WHERE {string.Join(" AND ", where)}",
                CommandType.Text,
                FromReader,
                listParams.ToArray());
        }
        
        public static DeliveryPointDto FromReader(SqlDataReader reader)
        {
            return new DeliveryPointDto
            {
                Code = SQLDataHelper.GetString(reader, "Code"),
                Name = SQLDataHelper.GetString(reader, "Name"),
                CityCode = SQLDataHelper.GetString(reader, "CityCode"),
                Address = SQLDataHelper.GetString(reader, "Address"),
                TripDescription = SQLDataHelper.GetString(reader, "TripDescription"),
                Latitude = SQLDataHelper.GetFloat(reader, "Latitude"),
                Longitude = SQLDataHelper.GetFloat(reader, "Longitude"),
                WorkShedule = SQLDataHelper.GetString(reader, "WorkShedule"),
                Phone = SQLDataHelper.GetString(reader, "Phone"),
                OnlyPrepaidOrders = SQLDataHelper.GetBoolean(reader, "OnlyPrepaidOrders"),
                Acquiring = SQLDataHelper.GetBoolean(reader, "Acquiring"),
                WeightMax = SQLDataHelper.GetNullableFloat(reader, "WeightMax"),
                VolumeLimit = SQLDataHelper.GetNullableFloat(reader, "VolumeLimit"),
            };
        }

        public static bool ExistsDeliveryPoints()
        {
            return SQLDataAccess.ExecuteScalar<bool>("SELECT CASE WHEN EXISTS(SELECT * FROM [Shipping].[BoxberryDeliveryPoint]) THEN 1 ELSE 0 END", CommandType.Text);
        }

        public static void Add(DeliveryPointDto pointDto)
        {
            SQLDataAccess.ExecuteNonQuery(
                @"INSERT INTO [Shipping].[BoxberryDeliveryPoint]
                    ([Code],[Name],[CityCode],[Address],[TripDescription],[Latitude],[Longitude],[WorkShedule],[Phone],
                     [OnlyPrepaidOrders],[Acquiring],[WeightMax],[VolumeLimit],[LastUpdate])
                VALUES
	                (@Code,@Name,@CityCode,@Address,@TripDescription,@Latitude,@Longitude,@WorkShedule,@Phone,
	                @OnlyPrepaidOrders,@Acquiring,@WeightMax,@VolumeLimit,@LastUpdate)",
                CommandType.Text,
                new SqlParameter("@Code", pointDto.Code ?? (object) DBNull.Value),
                new SqlParameter("@Name", pointDto.Name ?? (object) DBNull.Value),
                new SqlParameter("@CityCode", pointDto.CityCode ?? (object) DBNull.Value),
                new SqlParameter("@Address", pointDto.Address ?? (object) DBNull.Value),
                new SqlParameter("@TripDescription", pointDto.TripDescription ?? (object) DBNull.Value),
                new SqlParameter("@Latitude", pointDto.Latitude),
                new SqlParameter("@Longitude", pointDto.Longitude),
                new SqlParameter("@WorkShedule", pointDto.WorkShedule ?? (object) DBNull.Value),
                new SqlParameter("@Phone", pointDto.Phone ?? (object) DBNull.Value),
                new SqlParameter("@OnlyPrepaidOrders", pointDto.OnlyPrepaidOrders),
                new SqlParameter("@Acquiring", pointDto.Acquiring),
                new SqlParameter("@WeightMax", pointDto.WeightMax ?? (object) DBNull.Value),
                new SqlParameter("@VolumeLimit", pointDto.VolumeLimit ?? (object) DBNull.Value),
                new SqlParameter("@LastUpdate", DateTime.Now)
            );
        }

        public static void Update(DeliveryPointDto pointDto)
        {
            SQLDataAccess.ExecuteNonQuery(
                @"UPDATE [Shipping].[BoxberryDeliveryPoint]
                   SET [Name] = @Name
                      ,[CityCode] = @CityCode
                      ,[Address] = @Address
                      ,[TripDescription] = @TripDescription
                      ,[Latitude] = @Latitude
                      ,[Longitude] = @Longitude
                      ,[WorkShedule] = @WorkShedule
                      ,[Phone] = @Phone
                      ,[OnlyPrepaidOrders] = @OnlyPrepaidOrders
                      ,[Acquiring] = @Acquiring
                      ,[WeightMax] = @WeightMax
                      ,[VolumeLimit] = @VolumeLimit
                      ,[LastUpdate] = @LastUpdate
                 WHERE [Code] = @Code",
                CommandType.Text,
                new SqlParameter("@Code", pointDto.Code ?? (object) DBNull.Value),
                new SqlParameter("@Name", pointDto.Name ?? (object) DBNull.Value),
                new SqlParameter("@CityCode", pointDto.CityCode ?? (object) DBNull.Value),
                new SqlParameter("@Address", pointDto.Address ?? (object) DBNull.Value),
                new SqlParameter("@TripDescription", pointDto.TripDescription ?? (object) DBNull.Value),
                new SqlParameter("@Latitude", pointDto.Latitude),
                new SqlParameter("@Longitude", pointDto.Longitude),
                new SqlParameter("@WorkShedule", pointDto.WorkShedule ?? (object) DBNull.Value),
                new SqlParameter("@Phone", pointDto.Phone ?? (object) DBNull.Value),
                new SqlParameter("@OnlyPrepaidOrders", pointDto.OnlyPrepaidOrders),
                new SqlParameter("@Acquiring", pointDto.Acquiring),
                new SqlParameter("@WeightMax", pointDto.WeightMax ?? (object) DBNull.Value),
                new SqlParameter("@VolumeLimit", pointDto.VolumeLimit ?? (object) DBNull.Value),
                new SqlParameter("@LastUpdate", DateTime.Now)
                );
        }
        
        public static void RemoveOld(DateTime startAt)
        {
            SQLDataAccess.ExecuteNonQuery(
                @"DELETE FROM [Shipping].[BoxberryDeliveryPoint] WHERE [LastUpdate] < @startAt",
                CommandType.Text,
                new SqlParameter("startAt", startAt));
        }
        
        public static bool Sync(BoxberryApiService apiService)
        {
            var isEmptyDeliveryPoints = !ExistsDeliveryPoints();
            var startDate = DateTime.Now;

            var tablePickPointsBulk =
                isEmptyDeliveryPoints
                    ? SQLDataAccess.ExecuteTable(@"SELECT * FROM [Shipping].[BoxberryDeliveryPoint]", CommandType.Text)
                    : null;

            var deliveryPoints = apiService.GetListPoints(string.Empty);

            if (deliveryPoints is null)
                return false;

            foreach (var pointSource in deliveryPoints)
            {
                var pickPoint = isEmptyDeliveryPoints
                    ? null
                    : Get(pointSource.Code);

                var isNew = pickPoint == null;

                if (pickPoint == null)
                    pickPoint = new DeliveryPointDto();

                pickPoint.Code = pointSource.Code;
                pickPoint.Name = pointSource.Name?.Reduce(255);
                pickPoint.CityCode = pointSource.CityCode;
                pickPoint.Address = pointSource.AddressReduce?.Reduce(255);
                pickPoint.TripDescription = pointSource.TripDescription;
                
                var gps = pointSource.GPS;
                var indexSplitChar = gps.IndexOf(',');
                var latitude = gps.Substring(0, indexSplitChar).TryParseFloat();
                var longitude = gps.Substring(indexSplitChar + 1).TryParseFloat();
                pickPoint.Latitude = latitude;
                pickPoint.Longitude = longitude;
                pickPoint.WorkShedule = pointSource.WorkShedule?.Reduce(100);
                pickPoint.Phone = pointSource.Phone?.Reduce(50);
                pickPoint.OnlyPrepaidOrders = pointSource.OnlyPrepaidOrders == "Yes";
                pickPoint.Acquiring = pointSource.Acquiring == "Yes";
                pickPoint.WeightMax = pointSource.LoadLimit;
                pickPoint.VolumeLimit = pointSource.VolumeLimit;

                if (!isEmptyDeliveryPoints)
                {
                    if (isNew)
                        Add(pickPoint);
                    else
                        Update(pickPoint);
                }
                else
                {
                    var row = tablePickPointsBulk.NewRow();

                    row.SetField("Code", pickPoint.Code ?? (object) DBNull.Value);
                    row.SetField("Name", pickPoint.Name ?? (object) DBNull.Value);
                    row.SetField("CityCode", pickPoint.CityCode ?? (object) DBNull.Value);
                    row.SetField("Address", pickPoint.Address ?? (object) DBNull.Value);
                    row.SetField("TripDescription", pickPoint.TripDescription ?? (object) DBNull.Value);
                    row.SetField("Latitude", pickPoint.Latitude);
                    row.SetField("Longitude", pickPoint.Longitude);
                    row.SetField("WorkShedule", pickPoint.WorkShedule ?? (object) DBNull.Value);
                    row.SetField("Phone", pickPoint.Phone ?? (object) DBNull.Value);
                    row.SetField("OnlyPrepaidOrders", pickPoint.OnlyPrepaidOrders);
                    row.SetField("Acquiring", pickPoint.Acquiring);
                    row.SetField("WeightMax", pickPoint.WeightMax ?? (object) DBNull.Value);
                    row.SetField("VolumeLimit", pickPoint.VolumeLimit ?? (object) DBNull.Value);
                    row.SetField("LastUpdate", startDate);

                    tablePickPointsBulk.Rows.Add(row);

                    if (tablePickPointsBulk.Rows.Count % 100 == 0)
                        InsertBulk(tablePickPointsBulk);
                }
            }

            if (isEmptyDeliveryPoints)
                InsertBulk(tablePickPointsBulk);
            else if (deliveryPoints.Count != 0)
                RemoveOld(startDate);

            return true;
        }

        private static void InsertBulk(DataTable data)
        {
            if (data.Rows.Count > 0)
            {
                using (SqlConnection dbConnection = new SqlConnection(Connection.GetConnectionString()))
                {
                    dbConnection.Open();
                    using (SqlBulkCopy sqlBulkCopy = new SqlBulkCopy(dbConnection))
                    {
                        sqlBulkCopy.DestinationTableName = "[Shipping].[BoxberryDeliveryPoint]";
                        sqlBulkCopy.WriteToServer(data);
                        data.Rows.Clear();
                    }
                    dbConnection.Close();
                }
            }
        }

    }
}