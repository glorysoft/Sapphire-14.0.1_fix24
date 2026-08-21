using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Globalization;
using System.Linq;
using AdvantShop.Core.Common.Extensions;
using AdvantShop.Core.SQL;
using AdvantShop.Helpers;
using AdvantShop.Localization;
using AdvantShop.Shipping;
using AdvantShop.Shipping.ApiShip.Api;

namespace AdvantShop.Core.Services.Shipping.ApiShip.DeliveryPoints
{
    public class DeliveryPointService
    {
        public static DeliveryPointDto Get(int id)
        {
            return SQLDataAccess.ExecuteReadOne(
                "SELECT * FROM [Shipping].[ApiShipDeliveryPoint] WHERE [Id] = @Id",
                CommandType.Text,
                FromReader,
                new SqlParameter("@Id", id));
        }
       
        public static IList<DeliveryPointDto> GetList()
        {
            return SQLDataAccess.ExecuteReadList(
                "SELECT * FROM [Shipping].[ApiShipDeliveryPoint]",
                CommandType.Text,
                FromReader);
        }
    
        public static IList<DeliveryPointDto> GetList(string account)
        {
            if (account.IsNullOrEmpty())
                return GetList();

            return SQLDataAccess.ExecuteReadList(
                "SELECT * FROM [Shipping].[ApiShipDeliveryPoint] INNER JOIN [Shipping].[ApiShipDeliveryPointAccount] ON [ApiShipDeliveryPoint].[Id] = [ApiShipDeliveryPointAccount].[DeliveryPointId] WHERE [ApiShipDeliveryPointAccount].[Account] = @Account",
                CommandType.Text,
                FromReader,
                new SqlParameter("@Account", account));
        }
    
        public static IList<DeliveryPointDto> GetList(List<int> ids)
        {
            ids = ids ?? throw new ArgumentNullException(nameof(ids));
            if (ids.Count == 0)
                return GetList();

            return SQLDataAccess.ExecuteReadList(
                "SELECT [ApiShipDeliveryPoint].* FROM [Shipping].[ApiShipDeliveryPoint] Inner Join (Select value From [Settings].[SPLIT_INT](@Ids, ',')) ids on [ApiShipDeliveryPoint].[Id] = ids.value",
                CommandType.Text,
                FromReader,
                new SqlParameter("@Ids", string.Join(",", ids)));
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
            where.Add("[ApiShipDeliveryPointAccount].[Account] = @Account");

            return SQLDataAccess.ExecuteReadList(
                $"SELECT * FROM [Shipping].[ApiShipDeliveryPoint]" +
                (account.IsNotEmpty()
                    ? "INNER JOIN [Shipping].[ApiShipDeliveryPointAccount] ON [ApiShipDeliveryPoint].[Id] = [ApiShipDeliveryPointAccount].[DeliveryPointId]"
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
                Id = SQLDataHelper.GetInt(reader, "Id"),
                ProviderKey = SQLDataHelper.GetString(reader, "ProviderKey"),
                Code = SQLDataHelper.GetString(reader, "Code"),
                Name = SQLDataHelper.GetString(reader, "Name"),
                CountryCode = SQLDataHelper.GetString(reader, "CountryCode"),
                Region = SQLDataHelper.GetString(reader, "Region"),
                City = SQLDataHelper.GetString(reader, "City"),
                CityFias = SQLDataHelper.GetString(reader, "CityFias"),
                Community = SQLDataHelper.GetString(reader, "Community"),
                CommunityFias = SQLDataHelper.GetString(reader, "CommunityFias"),
                Area = SQLDataHelper.GetString(reader, "Area"),
                Address = SQLDataHelper.GetString(reader, "Address"),
                Description = SQLDataHelper.GetString(reader, "Description"),
                Latitude = SQLDataHelper.GetFloat(reader, "Latitude"),
                Longitude = SQLDataHelper.GetFloat(reader, "Longitude"),
                Timetable = SQLDataHelper.GetString(reader, "Timetable"),
                TimeWork = TimeWorksFromString(SQLDataHelper.GetString(reader, "TimeWork")),
                Phone = SQLDataHelper.GetString(reader, "Phone"),
                Cod = SQLDataHelper.GetBoolean(reader, "Cod"),
                PaymentCash = SQLDataHelper.GetBoolean(reader, "PaymentCash"),
                PaymentCard = SQLDataHelper.GetBoolean(reader, "PaymentCard"),
                AvailableOperation = (byte)SQLDataHelper.GetInt(reader, "AvailableOperation"),
                MaxSizeA = SQLDataHelper.GetNullableInt(reader, "MaxSizeA"),
                MaxSizeB = SQLDataHelper.GetNullableInt(reader, "MaxSizeB"),
                MaxSizeC = SQLDataHelper.GetNullableInt(reader, "MaxSizeC"),
                MaxSizeSum = SQLDataHelper.GetNullableInt(reader, "MaxSizeSum"),
                MaxWeight = SQLDataHelper.GetNullableInt(reader, "MaxWeight"),
                MinWeight = SQLDataHelper.GetNullableInt(reader, "MinWeight"),
                MaxVolume = SQLDataHelper.GetNullableInt(reader, "MaxVolume"),
                MaxCod = SQLDataHelper.GetNullableFloat(reader, "MaxCod"),
                Enabled = SQLDataHelper.GetBoolean(reader, "Enabled"),
            };
        }
      
        public static List<TimeWork> ConvertToTimeWorks(Dictionary<int, string> worktime, CultureInfo currentCulture)
        {
            if (worktime?.Count > 0 is false)
                return null;

            var list = worktime
                      .GroupBy(x => x.Value)
                      .Select(workTimeGroup =>
                       {
                           var timeParts = workTimeGroup.Key.Split('/');

                           if (timeParts.Length == 2
                               && TimeSpan.TryParse(timeParts[0], out var timeFrom)
                               && TimeSpan.TryParse(timeParts[1], out var timeTo))
                           {
                               return new TimeWork
                               {
                                   From = timeFrom,
                                   To = timeTo,
                                   Label = string.Join(", ",
                                       workTimeGroup.Select(x => x.Key)
                                                    .OrderBy(x => x)
                                                    .Select(x =>
                                                         currentCulture.DateTimeFormat.GetAbbreviatedDayName(
                                                             x == 7 ? DayOfWeek.Sunday : (DayOfWeek) x)))
                               };
                           }

                           return null;
                       })
                      .Where(timeWork => timeWork != null)
                      .ToList();
       
            if (list.Count == 0)
                return null;

            return list;
        }  
        private static string TimeWorksToString(List<TimeWork> timeWorks)
        {
            if (timeWorks?.Count > 0 is false)
                return null;

            return string.Join("$",
                timeWorks
                   .Select(timeWork => $"{timeWork.From:hh\\:mm}|{timeWork.To:hh\\:mm}|{timeWork.Label}"));
        }

        private static List<TimeWork> TimeWorksFromString(string timeWorksString)
        {
            if (timeWorksString.IsNullOrEmpty())
                return null;
            
            return timeWorksString
                  .Split(new[] {"$"}, StringSplitOptions.None)
                  .Select(time =>
                   {
                       var vals = time.Split(new[] {"|"}, StringSplitOptions.None);
                       var timeWork = new TimeWork
                       {
                           From = TimeSpan.ParseExact(vals[0], "hh\\:mm", CultureInfo.InvariantCulture),
                           To = TimeSpan.ParseExact(vals[1], "hh\\:mm", CultureInfo.InvariantCulture),
                           Label = vals[2],
                       };
                       
                       return timeWork;
                   })
                  .ToList();
        }

        public static bool ExistsDeliveryPoints()
        {
            return SQLDataAccess.ExecuteScalar<bool>("SELECT CASE WHEN EXISTS(SELECT * FROM [Shipping].[ApiShipDeliveryPoint]) THEN 1 ELSE 0 END", CommandType.Text);
        }

        public static bool ExistsDeliveryPoints(string account)
        {
            return SQLDataAccess.ExecuteScalar<bool>(
                "SELECT CASE WHEN EXISTS(SELECT * FROM [Shipping].[ApiShipDeliveryPointAccount] WHERE [Account]=@Account) THEN 1 ELSE 0 END",
                CommandType.Text,
                new[] { new SqlParameter("@Account", account) });
        }

        public static void Add(DeliveryPointDto pointDto)
        {
            SQLDataAccess.ExecuteNonQuery(
                @"INSERT INTO [Shipping].[ApiShipDeliveryPoint]
                    ([Id],[ProviderKey],[Code],[Name],[CountryCode],[Region],[City],[CityFias],[Community],
                     [CommunityFias],[Area],[Address],[Description],[Latitude],[Longitude],[Timetable],[TimeWork],
                     [Phone],[Cod],[PaymentCash],[PaymentCard],[AvailableOperation],[MaxSizeA],[MaxSizeB],[MaxSizeC],
                     [MaxSizeSum],[MaxWeight],[MinWeight],[MaxVolume],[MaxCod],[Enabled],[LastUpdate])
                VALUES
	                (@Id,@ProviderKey,@Code,@Name,@CountryCode,@Region,@City,@CityFias,@Community,
	                @CommunityFias,@Area,@Address,@Description,@Latitude,@Longitude,@Timetable,@TimeWork,
	                @Phone,@Cod,@PaymentCash,@PaymentCard,@AvailableOperation,@MaxSizeA,@MaxSizeB,@MaxSizeC,
	                @MaxSizeSum,@MaxWeight,@MinWeight,@MaxVolume,@MaxCod,@Enabled,@LastUpdate)",
                CommandType.Text,
                new SqlParameter("@Id", pointDto.Id),
                new SqlParameter("@ProviderKey", pointDto.ProviderKey ?? (object) DBNull.Value),
                new SqlParameter("@Code", pointDto.Code ?? (object) DBNull.Value),
                new SqlParameter("@Name", pointDto.Name ?? (object) DBNull.Value),
                new SqlParameter("@CountryCode", pointDto.CountryCode ?? (object) DBNull.Value),
                new SqlParameter("@Region", pointDto.Region ?? (object) DBNull.Value),
                new SqlParameter("@City", pointDto.City ?? (object) DBNull.Value),
                new SqlParameter("@CityFias", pointDto.CityFias ?? (object) DBNull.Value),
                new SqlParameter("@Community", pointDto.Community ?? (object) DBNull.Value),
                new SqlParameter("@CommunityFias", pointDto.CommunityFias ?? (object) DBNull.Value),
                new SqlParameter("@Area", pointDto.Area ?? (object) DBNull.Value),
                new SqlParameter("@Address", pointDto.Address ?? (object) DBNull.Value),
                new SqlParameter("@Description", pointDto.Description ?? (object) DBNull.Value),
                new SqlParameter("@Latitude", pointDto.Latitude),
                new SqlParameter("@Longitude", pointDto.Longitude),
                new SqlParameter("@Timetable", pointDto.Timetable ?? (object) DBNull.Value),
                new SqlParameter("@TimeWork", TimeWorksToString(pointDto.TimeWork)?.Reduce(455) ?? (object) DBNull.Value),
                new SqlParameter("@Phone", pointDto.Phone ?? (object) DBNull.Value),
                new SqlParameter("@Cod", pointDto.Cod),
                new SqlParameter("@PaymentCash", pointDto.PaymentCash),
                new SqlParameter("@PaymentCard", pointDto.PaymentCard),
                new SqlParameter("@AvailableOperation", pointDto.AvailableOperation),
                new SqlParameter("@MaxSizeA", pointDto.MaxSizeA ?? (object) DBNull.Value),
                new SqlParameter("@MaxSizeB", pointDto.MaxSizeB ?? (object) DBNull.Value),
                new SqlParameter("@MaxSizeC", pointDto.MaxSizeC ?? (object) DBNull.Value),
                new SqlParameter("@MaxSizeSum", pointDto.MaxSizeSum ?? (object) DBNull.Value),
                new SqlParameter("@MaxWeight", pointDto.MaxWeight ?? (object) DBNull.Value),
                new SqlParameter("@MinWeight", pointDto.MinWeight ?? (object) DBNull.Value),
                new SqlParameter("@MaxVolume", pointDto.MaxVolume ?? (object) DBNull.Value),
                new SqlParameter("@MaxCod", pointDto.MaxCod ?? (object) DBNull.Value),
                new SqlParameter("@Enabled", pointDto.Enabled),
                new SqlParameter("@LastUpdate", DateTime.Now)
            );
        }

        public static void Update(DeliveryPointDto pointDto)
        {
            SQLDataAccess.ExecuteNonQuery(
                @"UPDATE [Shipping].[ApiShipDeliveryPoint]
                   SET [ProviderKey] = @ProviderKey
                      ,[Code] = @Code
                      ,[Name] = @Name
                      ,[CountryCode] = @CountryCode
                      ,[Region] = @Region
                      ,[City] = @City
                      ,[CityFias] = @CityFias
                      ,[Community] = @Community
                      ,[CommunityFias] = @CommunityFias
                      ,[Area] = @Area
                      ,[Address] = @Address
                      ,[Description] = @Description
                      ,[Latitude] = @Latitude
                      ,[Longitude] = @Longitude
                      ,[Timetable] = @Timetable
                      ,[TimeWork] = @TimeWork
                      ,[Phone] = @Phone
                      ,[Cod] = @Cod
                      ,[PaymentCash] = @PaymentCash
                      ,[PaymentCard] = @PaymentCard
                      ,[AvailableOperation] = @AvailableOperation
                      ,[MaxSizeA] = @MaxSizeA
                      ,[MaxSizeB] = @MaxSizeB
                      ,[MaxSizeC] = @MaxSizeC
                      ,[MaxSizeSum] = @MaxSizeSum
                      ,[MaxWeight] = @MaxWeight
                      ,[MinWeight] = @MinWeight
                      ,[MaxVolume] = @MaxVolume
                      ,[MaxCod] = @MaxCod
                      ,[Enabled] = @Enabled
                      ,[LastUpdate] = @LastUpdate
                 WHERE [Id] = @Id",
                CommandType.Text,
                new SqlParameter("@Id", pointDto.Id),
                new SqlParameter("@ProviderKey", pointDto.ProviderKey ?? (object) DBNull.Value),
                new SqlParameter("@Code", pointDto.Code ?? (object) DBNull.Value),
                new SqlParameter("@Name", pointDto.Name ?? (object) DBNull.Value),
                new SqlParameter("@CountryCode", pointDto.CountryCode ?? (object) DBNull.Value),
                new SqlParameter("@Region", pointDto.Region ?? (object) DBNull.Value),
                new SqlParameter("@City", pointDto.City ?? (object) DBNull.Value),
                new SqlParameter("@CityFias", pointDto.CityFias ?? (object) DBNull.Value),
                new SqlParameter("@Community", pointDto.Community ?? (object) DBNull.Value),
                new SqlParameter("@CommunityFias", pointDto.CommunityFias ?? (object) DBNull.Value),
                new SqlParameter("@Area", pointDto.Area ?? (object) DBNull.Value),
                new SqlParameter("@Address", pointDto.Address ?? (object) DBNull.Value),
                new SqlParameter("@Description", pointDto.Description ?? (object) DBNull.Value),
                new SqlParameter("@Latitude", pointDto.Latitude),
                new SqlParameter("@Longitude", pointDto.Longitude),
                new SqlParameter("@Timetable", pointDto.Timetable ?? (object) DBNull.Value),
                new SqlParameter("@TimeWork", TimeWorksToString(pointDto.TimeWork)?.Reduce(455) ?? (object) DBNull.Value),
                new SqlParameter("@Phone", pointDto.Phone ?? (object) DBNull.Value),
                new SqlParameter("@Cod", pointDto.Cod),
                new SqlParameter("@PaymentCash", pointDto.PaymentCash),
                new SqlParameter("@PaymentCard", pointDto.PaymentCard),
                new SqlParameter("@AvailableOperation", pointDto.AvailableOperation),
                new SqlParameter("@MaxSizeA", pointDto.MaxSizeA ?? (object) DBNull.Value),
                new SqlParameter("@MaxSizeB", pointDto.MaxSizeB ?? (object) DBNull.Value),
                new SqlParameter("@MaxSizeC", pointDto.MaxSizeC ?? (object) DBNull.Value),
                new SqlParameter("@MaxSizeSum", pointDto.MaxSizeSum ?? (object) DBNull.Value),
                new SqlParameter("@MaxWeight", pointDto.MaxWeight ?? (object) DBNull.Value),
                new SqlParameter("@MinWeight", pointDto.MinWeight ?? (object) DBNull.Value),
                new SqlParameter("@MaxVolume", pointDto.MaxVolume ?? (object) DBNull.Value),
                new SqlParameter("@MaxCod", pointDto.MaxCod ?? (object) DBNull.Value),
                new SqlParameter("@Enabled", pointDto.Enabled),
                new SqlParameter("@LastUpdate", DateTime.Now)
                );
        }

        public static void AddRef(int deliveryPointId, string account)
        {
            SQLDataAccess.ExecuteNonQuery(
                @"IF (NOT EXISTS(SELECT * FROM [Shipping].[ApiShipDeliveryPointAccount] WHERE [DeliveryPointId] = @DeliveryPointId AND [Account] = @Account))
                BEGIN
	                INSERT INTO [Shipping].[ApiShipDeliveryPointAccount] ([DeliveryPointId],[Account],[LastUpdate]) VALUES (@DeliveryPointId, @Account, @LastUpdate)
                END
                ELSE
                BEGIN
	                UPDATE [Shipping].[ApiShipDeliveryPointAccount] SET [LastUpdate] = @LastUpdate WHERE [DeliveryPointId] = @DeliveryPointId AND [Account] = @Account
                END",
                CommandType.Text,
                new SqlParameter("@DeliveryPointId", deliveryPointId),
                new SqlParameter("@Account", account ?? (object)DBNull.Value),
                new SqlParameter("@LastUpdate", DateTime.Now)
            );
        }

        public static void RemoveRef(string account)
        {
            SQLDataAccess.ExecuteNonQuery(
                @"DELETE FROM [Shipping].[ApiShipDeliveryPointAccount] WHERE [Account] = @Account",
                CommandType.Text,
                new SqlParameter("@Account", account ?? (object)DBNull.Value));
        }

        public static void RemoveOldRef(string account, DateTime startAt)
        {
            SQLDataAccess.ExecuteNonQuery(
                @"DELETE FROM [Shipping].[ApiShipDeliveryPointAccount] WHERE [LastUpdate] < @startAt AND [Account] = @Account",
                CommandType.Text,
                new SqlParameter("startAt", startAt),
                new SqlParameter("@Account", account ?? (object)DBNull.Value));
        }

        public static bool Sync(ApiShipShippingService apiClient, string account)
        {
            var isEmptyDeliveryPoints = !ExistsDeliveryPoints();
            var startDate = DateTime.Now;
            var currentCulture = Culture.GetCulture();

            var tablePostamatsBulk = 
                isEmptyDeliveryPoints
                    ? SQLDataAccess.ExecuteTable(@"SELECT * FROM [Shipping].[ApiShipDeliveryPoint]", CommandType.Text)
                    : null;

            var tablePostamatsIknBulk = 
                isEmptyDeliveryPoints
                    ? SQLDataAccess.ExecuteTable(@"SELECT * FROM [Shipping].[ApiShipDeliveryPointAccount]", CommandType.Text)
                    : null;

            var i = 0;
            var countPointOnOneRequest = 1000;
            ApiShipPointsModel pointModel;
            do
            {
                pointModel = apiClient.GetApiShipPoints(countPointOnOneRequest, i * countPointOnOneRequest);
                if (i == 0
                    && pointModel is null)
                    return false;
                
                i++;
                if (!(pointModel?.Rows?.Count > 0))
                    break;
                
                foreach (var source in pointModel.Rows)
                {
                    var pointDto = isEmptyDeliveryPoints
                        ? null
                        : Get(source.Id);

                    var isNew = pointDto == null;

                    if (pointDto == null)
                        pointDto = new DeliveryPointDto();

                    pointDto.Id = source.Id;
                    pointDto.ProviderKey = source.ProviderKey.Reduce(50);
                    pointDto.Code = source.Code.Reduce(50);
                    pointDto.Name = source.Name.Reduce(255);
                    pointDto.CountryCode = source.CountryCode?.Reduce(2);
                    pointDto.Region = source.Region?.Reduce(255);
                    pointDto.City = source.City?.Reduce(255);
                    pointDto.CityFias = source.CityGuid?.Reduce(50);
                    pointDto.Community = source.Community?.Reduce(255);
                    pointDto.CommunityFias = source.CommunityGuid?.Reduce(50);
                    pointDto.Area = source.Area?.Reduce(255);
                    pointDto.Address = source.Address.Reduce(255);
                    pointDto.Description = source.Description;
                    pointDto.Latitude = source.Lat ?? 0f;
                    pointDto.Longitude = source.Lng ?? 0f;
                    pointDto.Timetable = source.Timetable?.Reduce(100) ?? string.Empty;
                    pointDto.TimeWork = ConvertToTimeWorks(source.Worktime, currentCulture);
                    pointDto.Phone = source.Phone?.Reduce(50);
                    pointDto.Cod = source.Cod == 1;
                    pointDto.PaymentCash = source.PaymentCash == 1;
                    pointDto.PaymentCard = source.PaymentCard == 1;
                    pointDto.AvailableOperation = source.AvailableOperation;
                    pointDto.MaxSizeA = source.Limits?.MaxSizeA;
                    pointDto.MaxSizeB = source.Limits?.MaxSizeB;
                    pointDto.MaxSizeC = source.Limits?.MaxSizeC;
                    pointDto.MaxSizeSum = source.Limits?.MaxSizeSum;
                    pointDto.MaxWeight = source.Limits?.MaxWeight;
                    pointDto.MinWeight = source.Limits?.MinWeight;
                    pointDto.MaxVolume = source.Limits?.MaxVolume;
                    pointDto.MaxCod = source.Limits?.MaxCod;
                    pointDto.Enabled = source.Enabled;

                    if (!isEmptyDeliveryPoints)
                    {
                        if (isNew)
                            Add(pointDto);
                        else
                            Update(pointDto);

                        AddRef(pointDto.Id, account);
                    }
                    else
                    {
                        var row = tablePostamatsBulk.NewRow();

                        row.SetField("Id", pointDto.Id);
                        row.SetField("ProviderKey", pointDto.ProviderKey ?? (object) DBNull.Value);
                        row.SetField("Code", pointDto.Code ?? (object) DBNull.Value);
                        row.SetField("Name", pointDto.Name ?? (object) DBNull.Value);
                        row.SetField("CountryCode", pointDto.CountryCode ?? (object) DBNull.Value);
                        row.SetField("Region", pointDto.Region ?? (object) DBNull.Value);
                        row.SetField("City", pointDto.City ?? (object) DBNull.Value);
                        row.SetField("CityFias", pointDto.CityFias ?? (object) DBNull.Value);
                        row.SetField("Community", pointDto.Community ?? (object) DBNull.Value);
                        row.SetField("CommunityFias", pointDto.CommunityFias ?? (object) DBNull.Value);
                        row.SetField("Area", pointDto.Area ?? (object) DBNull.Value);
                        row.SetField("Address", pointDto.Address ?? (object) DBNull.Value);
                        row.SetField("Description", pointDto.Description ?? (object) DBNull.Value);
                        row.SetField("Latitude", pointDto.Latitude);
                        row.SetField("Longitude", pointDto.Longitude);
                        row.SetField("Timetable", pointDto.Timetable ?? (object) DBNull.Value);
                        row.SetField("TimeWork", TimeWorksToString(pointDto.TimeWork)?.Reduce(455) ?? (object) DBNull.Value);
                        row.SetField("Phone", pointDto.Phone ?? (object) DBNull.Value);
                        row.SetField("Cod", pointDto.Cod);
                        row.SetField("PaymentCash", pointDto.PaymentCash);
                        row.SetField("PaymentCard", pointDto.PaymentCard);
                        row.SetField("AvailableOperation", pointDto.AvailableOperation);
                        row.SetField("MaxSizeA", pointDto.MaxSizeA ?? (object) DBNull.Value);
                        row.SetField("MaxSizeB", pointDto.MaxSizeB ?? (object) DBNull.Value);
                        row.SetField("MaxSizeC", pointDto.MaxSizeC ?? (object) DBNull.Value);
                        row.SetField("MaxSizeSum", pointDto.MaxSizeSum ?? (object) DBNull.Value);
                        row.SetField("MaxWeight", pointDto.MaxWeight ?? (object) DBNull.Value);
                        row.SetField("MinWeight", pointDto.MinWeight ?? (object) DBNull.Value);
                        row.SetField("MaxVolume", pointDto.MaxVolume ?? (object) DBNull.Value);
                        row.SetField("MaxCod", pointDto.MaxCod ?? (object) DBNull.Value);
                        row.SetField("Enabled", pointDto.Enabled);
                        row.SetField("LastUpdate", startDate);

                        tablePostamatsBulk.Rows.Add(row);

                        if (tablePostamatsBulk.Rows.Count % 100 == 0)
                            InsertBulk(tablePostamatsBulk, "[Shipping].[ApiShipDeliveryPoint]");

                        row = tablePostamatsIknBulk.NewRow();
                        row.SetField("DeliveryPointId", pointDto.Id);
                        row.SetField("Account", account);
                        row.SetField("LastUpdate", DateTime.Now);

                        tablePostamatsIknBulk.Rows.Add(row);

                        if (tablePostamatsIknBulk.Rows.Count % 100 == 0)
                            InsertBulk(tablePostamatsIknBulk, "[Shipping].[ApiShipDeliveryPointAccount]");

                    }
                }
            }
            while (pointModel?.Rows?.Count > 0);

            if (isEmptyDeliveryPoints)
            {
                InsertBulk(tablePostamatsBulk, "[Shipping].[ApiShipDeliveryPoint]");
                InsertBulk(tablePostamatsIknBulk, "[Shipping].[ApiShipDeliveryPointAccount]");
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