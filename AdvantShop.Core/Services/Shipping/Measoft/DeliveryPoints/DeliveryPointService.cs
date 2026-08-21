using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using AdvantShop.Core.Common.Extensions;
using AdvantShop.Core.SQL;
using AdvantShop.Helpers;
using AdvantShop.Shipping.Measoft.Api;

namespace AdvantShop.Shipping.Measoft.DeliveryPoints
{
    public class DeliveryPointService
    {
        public static DeliveryPointDto Get(int code)
        {
            return SQLDataAccess.ExecuteReadOne(
                "SELECT * FROM [Shipping].[MeasoftDeliveryPoint] WHERE [Code] = @Code",
                CommandType.Text,
                FromReader,
                new SqlParameter("@Code", code));
        }
          
        public static IList<DeliveryPointDto> GetList()
        {
            return SQLDataAccess.ExecuteReadList(
                "SELECT * FROM [Shipping].[MeasoftDeliveryPoint]",
                CommandType.Text,
                FromReader);
        }
    
        public static IList<DeliveryPointDto> GetList(string account)
        {
            if (account.IsNullOrEmpty())
                return GetList();

            return SQLDataAccess.ExecuteReadList(
                "SELECT * FROM [Shipping].[MeasoftDeliveryPoint] INNER JOIN [Shipping].[MeasoftDeliveryPointAccount] ON [MeasoftDeliveryPoint].[Code] = [MeasoftDeliveryPointAccount].[DeliveryPointCode] WHERE [MeasoftDeliveryPointAccount].[Account] = @Account",
                CommandType.Text,
                FromReader,
                new SqlParameter("@Account", account));
        }
       
        public static IList<DeliveryPointDto> GetByCity(int? cityCode, string account)
        {
            // account = account ?? throw new ArgumentNullException(nameof(account));
            
            if (cityCode is null
                && account.IsNullOrEmpty())
                return GetList();
      
            
            var listParams = new List<SqlParameter>();
            var where = new List<string>();


            if (cityCode != null)
            {
                listParams.Add(new SqlParameter("@CityCode", cityCode.Value));
                where.Add("[CityCode] = @CityCode");
            }

            if (account.IsNotEmpty())
            {
                listParams.Add(new SqlParameter("@Account", account));
                where.Add("[MeasoftDeliveryPointAccount].[Account] = @Account");
            }
            
            return SQLDataAccess.ExecuteReadList(
                "SELECT * FROM [Shipping].[MeasoftDeliveryPoint] " +
                    (account.IsNotEmpty() ? "INNER JOIN [Shipping].[MeasoftDeliveryPointAccount] ON [MeasoftDeliveryPointAccount].[DeliveryPointCode] = [MeasoftDeliveryPoint].[Code] " : string.Empty) +
                    "WHERE " + string.Join(" and ", where),
                CommandType.Text,
                FromReader,
                listParams.ToArray());
        }

        public static IList<DeliveryPointDto> FindByBounds(string account, float topLeftLatitude, float topLeftLongitude,
            float bottomRightLatitude, float bottomRightLongitude)
        {
            account = account ?? throw new ArgumentNullException(nameof(account));
            
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
            listParams.Add(new SqlParameter("@Account", account));
            where.Add("[MeasoftDeliveryPointAccount].[Account] = @Account");

            return SQLDataAccess.ExecuteReadList(
                $"SELECT * FROM [Shipping].[MeasoftDeliveryPoint] " +
                (account.IsNotEmpty()
                    ? "INNER JOIN [Shipping].[MeasoftDeliveryPointAccount] ON [MeasoftDeliveryPointAccount].[DeliveryPointCode] = [MeasoftDeliveryPoint].[Code] "
                    : string.Empty) +
                $" WHERE {string.Join(" AND ", where)}",
                CommandType.Text,
                FromReader,
                listParams.ToArray());
        }
        
        public static DeliveryPointDto FromReader(SqlDataReader reader)
        {
            return new DeliveryPointDto
            {
                Code = SQLDataHelper.GetInt(reader, "Code"),
                Name = SQLDataHelper.GetString(reader, "Name"),
                CityCode = SQLDataHelper.GetInt(reader, "CityCode"),
                RegionCode = SQLDataHelper.GetInt(reader, "RegionCode"),
                Address = SQLDataHelper.GetString(reader, "Address"),
                TravelDescription = SQLDataHelper.GetString(reader, "TravelDescription"),
                Comment = SQLDataHelper.GetString(reader, "Comment"),
                Phone = SQLDataHelper.GetString(reader, "Phone"),
                Latitude = SQLDataHelper.GetNullableFloat(reader, "Latitude"),
                Longitude = SQLDataHelper.GetNullableFloat(reader, "Longitude"),
                WorkTimeStr = SQLDataHelper.GetString(reader, "WorkTimeStr"),
                MaxWeight = SQLDataHelper.GetNullableFloat(reader, "MaxWeight"),
                AcceptCard = SQLDataHelper.GetBoolean(reader, "AcceptCard"),
                AcceptCash = SQLDataHelper.GetBoolean(reader, "AcceptCash"),
                ParentCode = SQLDataHelper.GetInt(reader, "ParentCode"),
            };
        }

        public static bool ExistsDeliveryPoints()
        {
            return SQLDataAccess.ExecuteScalar<bool>("SELECT CASE WHEN EXISTS(SELECT * FROM [Shipping].[MeasoftDeliveryPoint]) THEN 1 ELSE 0 END", CommandType.Text);
        }

        public static bool ExistsDeliveryPoints(string account)
        {
            return SQLDataAccess.ExecuteScalar<bool>(
                "SELECT CASE WHEN EXISTS(SELECT * FROM [Shipping].[MeasoftDeliveryPointAccount] WHERE [Account]=@Account) THEN 1 ELSE 0 END",
                CommandType.Text,
                new[] { new SqlParameter("@Account", account) });
        }

        public static void Add(DeliveryPointDto pointDto)
        {
            SQLDataAccess.ExecuteNonQuery(
                @"INSERT INTO [Shipping].[MeasoftDeliveryPoint]
                    ([Code],[Name],[CityCode],[RegionCode],[Address],[TravelDescription],[Comment],[Phone],
                     [Latitude],[Longitude],[WorkTimeStr],[MaxWeight],[AcceptCard],[AcceptCash],[ParentCode],[LastUpdate])
                VALUES
	                (@Code,@Name,@CityCode,@RegionCode,@Address,@TravelDescription,@Comment,@Phone,
	                @Latitude,@Longitude,@WorkTimeStr,@MaxWeight,@AcceptCard,@AcceptCash,@ParentCode,@LastUpdate)",
                CommandType.Text,
                new SqlParameter("@Code", pointDto.Code),
                new SqlParameter("@Name", pointDto.Name ?? (object) DBNull.Value),
                new SqlParameter("@CityCode", pointDto.CityCode),
                new SqlParameter("@RegionCode", pointDto.RegionCode),
                new SqlParameter("@Address", pointDto.Address ?? (object) DBNull.Value),
                new SqlParameter("@TravelDescription", pointDto.TravelDescription ?? (object) DBNull.Value),
                new SqlParameter("@Comment", pointDto.Comment ?? (object) DBNull.Value),
                new SqlParameter("@Phone", pointDto.Phone ?? (object) DBNull.Value),
                new SqlParameter("@Latitude", pointDto.Latitude ?? (object) DBNull.Value),
                new SqlParameter("@Longitude", pointDto.Longitude ?? (object) DBNull.Value),
                new SqlParameter("@WorkTimeStr", pointDto.WorkTimeStr ?? (object) DBNull.Value),
                new SqlParameter("@MaxWeight", pointDto.MaxWeight ?? (object) DBNull.Value),
                new SqlParameter("@AcceptCard", pointDto.AcceptCard),
                new SqlParameter("@AcceptCash", pointDto.AcceptCash),
                new SqlParameter("@ParentCode", pointDto.ParentCode),
                new SqlParameter("@LastUpdate", DateTime.Now)
            );
        }

        public static void Update(DeliveryPointDto pointDto)
        {
            SQLDataAccess.ExecuteNonQuery(
                @"UPDATE [Shipping].[MeasoftDeliveryPoint]
                   SET [Name] = @Name
                      ,[CityCode] = @CityCode
                      ,[RegionCode] = @RegionCode
                      ,[Address] = @Address
                      ,[TravelDescription] = @TravelDescription
                      ,[Comment] = @Comment
                      ,[Phone] = @Phone
                      ,[Latitude] = @Latitude
                      ,[Longitude] = @Longitude
                      ,[WorkTimeStr] = @WorkTimeStr
                      ,[MaxWeight] = @MaxWeight
                      ,[AcceptCard] = @AcceptCard
                      ,[AcceptCash] = @AcceptCash
                      ,[ParentCode] = @ParentCode
                      ,[LastUpdate] = @LastUpdate
                 WHERE [Code] = @Code",
                CommandType.Text,
                new SqlParameter("@Code", pointDto.Code),
                new SqlParameter("@Name", pointDto.Name ?? (object) DBNull.Value),
                new SqlParameter("@CityCode", pointDto.CityCode),
                new SqlParameter("@RegionCode", pointDto.RegionCode),
                new SqlParameter("@Address", pointDto.Address ?? (object) DBNull.Value),
                new SqlParameter("@TravelDescription", pointDto.TravelDescription ?? (object) DBNull.Value),
                new SqlParameter("@Comment", pointDto.Comment ?? (object) DBNull.Value),
                new SqlParameter("@Phone", pointDto.Phone ?? (object) DBNull.Value),
                new SqlParameter("@Latitude", pointDto.Latitude ?? (object) DBNull.Value),
                new SqlParameter("@Longitude", pointDto.Longitude ?? (object) DBNull.Value),
                new SqlParameter("@WorkTimeStr", pointDto.WorkTimeStr ?? (object) DBNull.Value),
                new SqlParameter("@MaxWeight", pointDto.MaxWeight ?? (object) DBNull.Value),
                new SqlParameter("@AcceptCard", pointDto.AcceptCard),
                new SqlParameter("@AcceptCash", pointDto.AcceptCash),
                new SqlParameter("@ParentCode", pointDto.ParentCode),
                new SqlParameter("@LastUpdate", DateTime.Now)
                );
        }

        public static void AddRef(int deliveryPointCode, string account)
        {
            SQLDataAccess.ExecuteNonQuery(
                @"IF (NOT EXISTS(SELECT * FROM [Shipping].[MeasoftDeliveryPointAccount] WHERE [DeliveryPointCode] = @DeliveryPointCode AND [Account] = @Account))
                BEGIN
	                INSERT INTO [Shipping].[MeasoftDeliveryPointAccount] ([DeliveryPointCode],[Account],[LastUpdate]) VALUES (@DeliveryPointCode, @Account, @LastUpdate)
                END
                ELSE
                BEGIN
	                UPDATE [Shipping].[MeasoftDeliveryPointAccount] SET [LastUpdate] = @LastUpdate WHERE [DeliveryPointCode] = @DeliveryPointCode AND [Account] = @Account
                END",
                CommandType.Text,
                new SqlParameter("@DeliveryPointCode", deliveryPointCode),
                new SqlParameter("@Account", account ?? (object)DBNull.Value),
                new SqlParameter("@LastUpdate", DateTime.Now)
            );
        }

        public static void RemoveRef(string account)
        {
            SQLDataAccess.ExecuteNonQuery(
                @"DELETE FROM [Shipping].[MeasoftDeliveryPointAccount] WHERE [Account] = @Account",
                CommandType.Text,
                new SqlParameter("@Account", account ?? (object)DBNull.Value));
        }

        public static void RemoveOldRef(string account, DateTime startAt)
        {
            SQLDataAccess.ExecuteNonQuery(
                @"DELETE FROM [Shipping].[MeasoftDeliveryPointAccount] WHERE [LastUpdate] < @startAt AND [Account] = @Account",
                CommandType.Text,
                new SqlParameter("startAt", startAt),
                new SqlParameter("@Account", account ?? (object)DBNull.Value));
        }

        public static bool Sync(MeasoftApiService apiClient, string account)
        {
            var isEmptyDeliveryPoints = !ExistsDeliveryPoints();
            var startDate = DateTime.Now;

            var tablePostamatsBulk = 
                isEmptyDeliveryPoints
                    ? SQLDataAccess.ExecuteTable(@"SELECT * FROM [Shipping].[MeasoftDeliveryPoint]", CommandType.Text)
                    : null;

            var tablePostamatsIknBulk = 
                isEmptyDeliveryPoints
                    ? SQLDataAccess.ExecuteTable(@"SELECT * FROM [Shipping].[MeasoftDeliveryPointAccount]", CommandType.Text)
                    : null;

            PvzListResponse pointsModel;
            var listParams = new PvzListParams
            {
                AcceptIndividuals = EnYesNo.Yes,
                LimitParams = new LimitParams
                {
                    From = 0,
                    Count = 1000,
                }
            };

            do
            {
                pointsModel = apiClient.GetPoints(listParams);
                if (listParams.LimitParams.From == 0 && pointsModel is null)
                    return false;
                
                if (!(pointsModel?.Points?.Count > 0))
                    break;

                listParams.LimitParams.From += pointsModel.Points.Count;//listParams.LimitParams.Count;
                
                foreach (var source in pointsModel.Points)
                {
                    var pointDto = isEmptyDeliveryPoints
                        ? null
                        : Get(source.Code);

                    var isNew = pointDto == null;

                    if (pointDto == null)
                        pointDto = new DeliveryPointDto();

                    pointDto.Code = source.Code;
                    pointDto.Name = source.Name.Reduce(255);
                    pointDto.CityCode = source.CityOfPoint.Code;
                    pointDto.RegionCode = source.CityOfPoint.RegionCode;
                    pointDto.Address = source.Address.Reduce(255);
                    pointDto.TravelDescription = source.TravelDescription;
                    pointDto.Comment = source.Comment;  
                    pointDto.Phone = source.Phone?.Reduce(50);
                    pointDto.Latitude = source.Latitude;
                    pointDto.Longitude = source.Longitude;
                    pointDto.WorkTimeStr = source.Worktime?.Reduce(100) ?? string.Empty;
                    pointDto.MaxWeight = source.MaxWeight;
                    pointDto.AcceptCard = source.AcceptCard == EnYesNo.Yes;
                    pointDto.AcceptCash = source.AcceptCash == EnYesNo.Yes;
                    pointDto.ParentCode = source.ParentCode;

                    if (!isEmptyDeliveryPoints)
                    {
                        if (isNew)
                            Add(pointDto);
                        else
                            Update(pointDto);

                        AddRef(pointDto.Code, account);
                    }
                    else
                    {
                        var row = tablePostamatsBulk.NewRow();

                        row.SetField("Code", pointDto.Code);
                        row.SetField("Name", pointDto.Name ?? (object) DBNull.Value);
                        row.SetField("CityCode", pointDto.CityCode);
                        row.SetField("RegionCode", pointDto.RegionCode);
                        row.SetField("Address", pointDto.Address ?? (object) DBNull.Value);
                        row.SetField("TravelDescription", pointDto.TravelDescription ?? (object) DBNull.Value);
                        row.SetField("Comment", pointDto.Comment ?? (object) DBNull.Value);
                        row.SetField("Phone", pointDto.Phone ?? (object) DBNull.Value);
                        row.SetField("Latitude", pointDto.Latitude ?? (object) DBNull.Value);
                        row.SetField("Longitude", pointDto.Longitude ?? (object) DBNull.Value);
                        row.SetField("WorkTimeStr", pointDto.WorkTimeStr ?? (object) DBNull.Value);
                        row.SetField("MaxWeight", pointDto.MaxWeight ?? (object) DBNull.Value);
                        row.SetField("AcceptCard", pointDto.AcceptCard);
                        row.SetField("AcceptCash", pointDto.AcceptCash);
                        row.SetField("ParentCode", pointDto.ParentCode);
                        row.SetField("LastUpdate", startDate);

                        tablePostamatsBulk.Rows.Add(row);

                        if (tablePostamatsBulk.Rows.Count % 100 == 0)
                            InsertBulk(tablePostamatsBulk, "[Shipping].[MeasoftDeliveryPoint]");

                        row = tablePostamatsIknBulk.NewRow();
                        row.SetField("DeliveryPointCode", pointDto.Code);
                        row.SetField("Account", account);
                        row.SetField("LastUpdate", DateTime.Now);

                        tablePostamatsIknBulk.Rows.Add(row);

                        if (tablePostamatsIknBulk.Rows.Count % 100 == 0)
                            InsertBulk(tablePostamatsIknBulk, "[Shipping].[MeasoftDeliveryPointAccount]");

                    }
                }
            }
            while (pointsModel?.Points?.Count > 0);

            if (isEmptyDeliveryPoints)
            {
                InsertBulk(tablePostamatsBulk, "[Shipping].[MeasoftDeliveryPoint]");
                InsertBulk(tablePostamatsIknBulk, "[Shipping].[MeasoftDeliveryPointAccount]");
            }
            else
                RemoveOldRef(account, startDate);

            return true;
        }

        private static void InsertBulk(DataTable data, string destinationTableName)
        {
            if (data.Rows.Count > 0)
            {
                using (SqlConnection dbConnection = new SqlConnection(Connection.GetConnectionString()))
                {
                    dbConnection.Open();
                    using (SqlBulkCopy sqlBulkCopy = new SqlBulkCopy(dbConnection))
                    {
                        sqlBulkCopy.DestinationTableName = destinationTableName;
                        sqlBulkCopy.WriteToServer(data);
                        data.Rows.Clear();
                    }
                    dbConnection.Close();
                }
            }
        }
    }
}