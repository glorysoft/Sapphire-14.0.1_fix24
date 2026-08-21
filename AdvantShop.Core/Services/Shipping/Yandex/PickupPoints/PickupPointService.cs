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
using AdvantShop.Shipping.Yandex.Api;

namespace AdvantShop.Shipping.Yandex.PickupPoints
{
    public class PickupPointService
    {
        public static PickupPointDto Get(string id)
        {
            if (id.IsNotEmpty())
            {
                return SQLDataAccess.ExecuteReadOne(
                    "SELECT * FROM [Shipping].[YandexPickupPoint] WHERE [Id] = @Id",
                    CommandType.Text,
                    FromReader,
                    new SqlParameter("@Id", id ?? (object)DBNull.Value));
            }
            return null;
        }
   
        public static IList<PickupPointDto> GetList()
        {
            return SQLDataAccess.ExecuteReadList(
                "SELECT * FROM [Shipping].[YandexPickupPoint]",
                CommandType.Text,
                FromReader);
        }
/*  
 *  В списке пвз записан geoId города или района из-за этого запрос по geoId города некорректный,
 *  Можно будет использовать после добавления Яндексом в ответ на запрос списка пвз поля с geoId города
        public static IList<PickupPointDto> Find(params int[] geoId)
        {
            if (geoId is null)
                return GetList();
      
            
            var listParams = new List<SqlParameter>();
            var where = new List<string>();

            if (geoId != null)
            {
                where.Add($"[GeoId] IN ({string.Join(",", geoId)})");
            }
      
            return SQLDataAccess.ExecuteReadList(
                $"SELECT * FROM [Shipping].[YandexPickupPoint] WHERE {string.Join(" AND ", where)}",
                CommandType.Text,
                FromReader,
                listParams.ToArray());
        }*/
          
        public static IList<PickupPointDto> FindByBounds(float topLeftLatitude, float topLeftLongitude,
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
                $"SELECT * FROM [Shipping].[YandexPickupPoint] WHERE {string.Join(" AND ", where)}",
                CommandType.Text,
                FromReader,
                listParams.ToArray());
        }
        
        public static PickupPointDto FromReader(SqlDataReader reader)
        {
            return new PickupPointDto
            {
                Id = SQLDataHelper.GetString(reader, "Id"),
                Type = new PickPointType(SQLDataHelper.GetString(reader, "Type")),
                GeoId = SQLDataHelper.GetInt(reader, "GeoId"),
                Address = SQLDataHelper.GetString(reader, "Address"),
                AddressComment = SQLDataHelper.GetString(reader, "AddressComment"),
                Instruction = SQLDataHelper.GetString(reader, "Instruction"),
                Latitude = SQLDataHelper.GetNullableFloat(reader, "Latitude"),
                Longitude = SQLDataHelper.GetNullableFloat(reader, "Longitude"),
                WorkTimeStr = SQLDataHelper.GetString(reader, "WorkTimeStr"),
                TimeWork = TimeWorksFromString(SQLDataHelper.GetString(reader, "TimeWork")),
                Phone = SQLDataHelper.GetString(reader, "Phone"),
                PaymentMethods = SQLDataHelper.GetString(reader, "PaymentMethods")
                                             ?.Split(new[] {";"}, StringSplitOptions.RemoveEmptyEntries)
                                              .Select(x => new PaymentMethodType(x))
                                              .ToList()
                                 ?? new List<PaymentMethodType>(),
                IsPostOffice = SQLDataHelper.GetBoolean(reader, "IsPostOffice"),
                IsYandexBranded = SQLDataHelper.GetBoolean(reader, "IsYandexBranded"),
                IsMarketPartner = SQLDataHelper.GetBoolean(reader, "IsMarketPartner"),
                IsDarkStore = SQLDataHelper.GetBoolean(reader, "IsDarkStore"),
                IsFittingAllowed = SQLDataHelper.GetBoolean(reader, "IsFittingAllowed"),
                IsPartialRefuseAllowed = SQLDataHelper.GetBoolean(reader, "IsPartialRefuseAllowed"),
                IsPaperlessPickupAllowed = SQLDataHelper.GetBoolean(reader, "IsPaperlessPickupAllowed"),
                IsUnboxingAllowed = SQLDataHelper.GetBoolean(reader, "IsUnboxingAllowed"),
            };
        }

        public static bool ExistsPickupPoints()
        {
            return SQLDataAccess.ExecuteScalar<bool>("SELECT CASE WHEN EXISTS(SELECT * FROM [Shipping].[YandexPickupPoint]) THEN 1 ELSE 0 END", CommandType.Text);
        }

        public static void Add(PickupPointDto pointDto)
        {
            SQLDataAccess.ExecuteNonQuery(
                @"INSERT INTO [Shipping].[YandexPickupPoint]
                    ([Id],[Name],[Type],[GeoId],[Address],[AddressComment],[Instruction],[Latitude],[Longitude],
                     [WorkTimeStr],[TimeWork],[Phone],[PaymentMethods],[IsPostOffice],[IsMarketPartner],[IsYandexBranded],[IsDarkStore],[LastUpdate],
                     [IsFittingAllowed],[IsPartialRefuseAllowed],[IsPaperlessPickupAllowed],[IsUnboxingAllowed])
                VALUES
	                (@Id,@Name,@Type,@GeoId,@Address,@AddressComment,@Instruction,@Latitude,@Longitude,
	                @WorkTimeStr,@TimeWork,@Phone,@PaymentMethods,@IsPostOffice,@IsMarketPartner,@IsYandexBranded,@IsDarkStore,@LastUpdate,
                    @IsFittingAllowed,@IsPartialRefuseAllowed,@IsPaperlessPickupAllowed,@IsUnboxingAllowed)",
                CommandType.Text,
                new SqlParameter("@Id", pointDto.Id ?? (object) DBNull.Value),
                new SqlParameter("@Name", pointDto.Name ?? (object) DBNull.Value),
                new SqlParameter("@Type", pointDto.Type?.Value ?? (object) DBNull.Value),
                new SqlParameter("@GeoId", pointDto.GeoId),
                new SqlParameter("@Address", pointDto.Address ?? (object) DBNull.Value),
                new SqlParameter("@AddressComment", pointDto.AddressComment ?? (object) DBNull.Value),
                new SqlParameter("@Instruction", pointDto.Instruction ?? (object) DBNull.Value),
                new SqlParameter("@Latitude", pointDto.Latitude ?? (object) DBNull.Value),
                new SqlParameter("@Longitude", pointDto.Longitude ?? (object) DBNull.Value),
                new SqlParameter("@WorkTimeStr", pointDto.WorkTimeStr ?? (object) DBNull.Value),
                new SqlParameter("@TimeWork", TimeWorksToString(pointDto.TimeWork)?.Reduce(455) ?? (object) DBNull.Value),
                new SqlParameter("@Phone", pointDto.Phone ?? (object) DBNull.Value),
                new SqlParameter("@PaymentMethods",
                    pointDto.PaymentMethods != null 
                        ? string.Join(";", pointDto.PaymentMethods).Reduce(100) 
                        : (object) DBNull.Value),
                new SqlParameter("@IsPostOffice", pointDto.IsPostOffice),
                new SqlParameter("@IsMarketPartner", pointDto.IsMarketPartner),
                new SqlParameter("@IsYandexBranded", pointDto.IsYandexBranded),
                new SqlParameter("@IsDarkStore", pointDto.IsDarkStore),
                new SqlParameter("@LastUpdate", DateTime.Now),
                new SqlParameter("@IsFittingAllowed", pointDto.IsFittingAllowed),
                new SqlParameter("@IsPartialRefuseAllowed", pointDto.IsPartialRefuseAllowed),
                new SqlParameter("@IsPaperlessPickupAllowed", pointDto.IsPaperlessPickupAllowed),
                new SqlParameter("@IsUnboxingAllowed", pointDto.IsUnboxingAllowed)
            );
        }

        public static void Update(PickupPointDto pointDto)
        {
            SQLDataAccess.ExecuteNonQuery(
                @"UPDATE [Shipping].[YandexPickupPoint]
                   SET [Name] = @Name
                      ,[Type] = @Type
                      ,[GeoId] = @GeoId
                      ,[Address] = @Address
                      ,[AddressComment] = @AddressComment
                      ,[Instruction] = @Instruction
                      ,[Latitude] = @Latitude
                      ,[Longitude] = @Longitude
                      ,[WorkTimeStr] = @WorkTimeStr
                      ,[TimeWork] = @TimeWork
                      ,[Phone] = @Phone
                      ,[PaymentMethods] = @PaymentMethods
                      ,[IsPostOffice] = @IsPostOffice
                      ,[IsMarketPartner] = @IsMarketPartner
                      ,[IsYandexBranded] = @IsYandexBranded
                      ,[IsDarkStore] = @IsDarkStore
                      ,[LastUpdate] = @LastUpdate
                      ,[IsFittingAllowed] = @IsFittingAllowed
                      ,[IsPartialRefuseAllowed] = @IsPartialRefuseAllowed
                      ,[IsPaperlessPickupAllowed] = @IsPaperlessPickupAllowed
                      ,[IsUnboxingAllowed] = @IsUnboxingAllowed
                 WHERE [Id] = @Id",
                CommandType.Text,
                new SqlParameter("@Id", pointDto.Id ?? (object) DBNull.Value),
                new SqlParameter("@Name", pointDto.Name ?? (object) DBNull.Value),
                new SqlParameter("@Type", pointDto.Type?.Value ?? (object) DBNull.Value),
                new SqlParameter("@GeoId", pointDto.GeoId),
                new SqlParameter("@Address", pointDto.Address ?? (object) DBNull.Value),
                new SqlParameter("@AddressComment", pointDto.AddressComment ?? (object) DBNull.Value),
                new SqlParameter("@Instruction", pointDto.Instruction ?? (object) DBNull.Value),
                new SqlParameter("@Latitude", pointDto.Latitude ?? (object) DBNull.Value),
                new SqlParameter("@Longitude", pointDto.Longitude ?? (object) DBNull.Value),
                new SqlParameter("@WorkTimeStr", pointDto.WorkTimeStr ?? (object) DBNull.Value),
                new SqlParameter("@TimeWork", TimeWorksToString(pointDto.TimeWork)?.Reduce(455) ?? (object) DBNull.Value),
                new SqlParameter("@Phone", pointDto.Phone ?? (object) DBNull.Value),
                new SqlParameter("@PaymentMethods",
                    pointDto.PaymentMethods != null 
                        ? string.Join(";", pointDto.PaymentMethods).Reduce(100) 
                        : (object) DBNull.Value),
                new SqlParameter("@IsPostOffice", pointDto.IsPostOffice),
                new SqlParameter("@IsMarketPartner", pointDto.IsMarketPartner),
                new SqlParameter("@IsYandexBranded", pointDto.IsYandexBranded),
                new SqlParameter("@IsDarkStore", pointDto.IsDarkStore),
                new SqlParameter("@LastUpdate", DateTime.Now),
                new SqlParameter("@IsFittingAllowed", pointDto.IsFittingAllowed),
                new SqlParameter("@IsPartialRefuseAllowed", pointDto.IsPartialRefuseAllowed),
                new SqlParameter("@IsPaperlessPickupAllowed", pointDto.IsPaperlessPickupAllowed),
                new SqlParameter("@IsUnboxingAllowed", pointDto.IsUnboxingAllowed)
                );
        }
        
        public static void RemoveOld(DateTime startAt)
        {
            SQLDataAccess.ExecuteNonQuery(
                @"DELETE FROM [Shipping].[YandexPickupPoint] WHERE [LastUpdate] < @startAt",
                CommandType.Text,
                new SqlParameter("startAt", startAt));
        }

        public static List<TimeWork> ConvertToTimeWorks(List<Restriction> pointRestrictions, CultureInfo currentCulture)
        {
            if (pointRestrictions?.Count > 0 is false)
                return null;

            var schedule = new Dictionary<string, (WorkTime TimeFrom, WorkTime TimeTo, List<int> Days)>();
                
            foreach (var restriction in pointRestrictions)
            {
                var workTime = GetWorkTime(restriction.TimeFrom, restriction.TimeTo);
                if (schedule.ContainsKey(workTime))
                    schedule[workTime].Days.AddRange(restriction.Days);
                else
                    schedule.Add(workTime, (restriction.TimeFrom, restriction.TimeTo, restriction.Days.ToList()));
            }

            return schedule
                  .Select(kv =>
                   {
                       return new TimeWork
                       {
                           From = new TimeSpan(kv.Value.TimeFrom.Hours, kv.Value.TimeFrom.Minutes, 0),
                           To = new TimeSpan(kv.Value.TimeTo.Hours, kv.Value.TimeTo.Minutes, 0),
                           Label = string.Join(", ",
                               kv.Value.Days.OrderBy(x => x)
                                 .Select(x =>
                                      currentCulture.DateTimeFormat.GetAbbreviatedDayName(
                                          x == 7 ? DayOfWeek.Sunday : (DayOfWeek) x)))
                       };
                   })
                  .ToList();
        }

        private static string GetWorkTime(WorkTime from, WorkTime to)
        {
            return string.Format("{0}:{1}-{2}:{3}",
                from.Hours,
                from.Minutes < 10 
                    ? "0" + from.Minutes 
                    : from.Minutes.ToString(),
                to.Hours,
                to.Minutes < 10 
                    ? "0" + to.Minutes 
                    : to.Minutes.ToString());
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
        
        public static bool Sync(YandexDeliveryApiService yandexDeliveryApi)
        {
            var isEmptyDeliveryPoints = !ExistsPickupPoints();
            var startDate = DateTime.Now;

            var tablePickPointsBulk =
                isEmptyDeliveryPoints
                    ? SQLDataAccess.ExecuteTable(@"SELECT * FROM [Shipping].[YandexPickupPoint]", CommandType.Text)
                    : null;

            var currentCulture = Culture.GetCulture();
            var pickPoints = yandexDeliveryApi.GetPickPoints();

            if (pickPoints?.Points is null)
                return false;

            foreach (var pickPointSource in pickPoints.Points)
            {
                var pickPoint = isEmptyDeliveryPoints
                    ? null
                    : Get(pickPointSource.Id);

                var isNew = pickPoint == null;

                if (pickPoint == null)
                    pickPoint = new PickupPointDto();

                pickPoint.Id = pickPointSource.Id;
                pickPoint.Name = pickPointSource.Name;
                pickPoint.Type = pickPointSource.Type;
                pickPoint.GeoId = pickPointSource.Address.GeoId;
                pickPoint.Address = pickPointSource.Address.FullAddress?.Reduce(255);
                pickPoint.AddressComment = pickPointSource.Address.Comment;
                pickPoint.Instruction = pickPointSource.Instruction;
                pickPoint.Latitude = pickPointSource.Position.Latitude;
                pickPoint.Longitude = pickPointSource.Position.Longitude;
                pickPoint.TimeWork = ConvertToTimeWorks(pickPointSource.Schedule.Restrictions, currentCulture);
                pickPoint.WorkTimeStr = pickPoint.TimeWork != null
                  ? string.Join(", ",
                      pickPoint.TimeWork
                               .Select(timeWork => $"{timeWork.Label}: {timeWork.From:hh\\:mm}-{timeWork.To:hh\\:mm}")).Reduce(100)
                  : null;
                pickPoint.Phone = pickPointSource.Contact.Phone?.Reduce(50);
                pickPoint.PaymentMethods = pickPointSource.PaymentMethods;
                pickPoint.IsPostOffice = pickPointSource.IsPostOffice;
                pickPoint.IsMarketPartner = pickPointSource.IsMarketPartner;
                pickPoint.IsDarkStore = pickPointSource.IsDarkStore;
                pickPoint.IsYandexBranded = pickPointSource.IsYandexBranded;
                if (pickPointSource.PickupServices != null)
                {
                    pickPoint.IsFittingAllowed = pickPointSource.PickupServices.IsFittingAllowed;
                    pickPoint.IsPartialRefuseAllowed = pickPointSource.PickupServices.IsPartialRefuseAllowed;
                    pickPoint.IsPaperlessPickupAllowed = pickPointSource.PickupServices.IsPaperlessPickupAllowed;
                    pickPoint.IsUnboxingAllowed = pickPointSource.PickupServices.IsUnboxingAllowed;
                }
                
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

                    row.SetField("Id", pickPoint.Id ?? (object) DBNull.Value);
                    row.SetField("Name", pickPoint.Name ?? (object) DBNull.Value);
                    row.SetField("Type", pickPoint.Type?.Value ?? (object) DBNull.Value);
                    row.SetField("GeoId", pickPoint.GeoId);
                    row.SetField("Address", pickPoint.Address ?? (object) DBNull.Value);
                    row.SetField("AddressComment", pickPoint.AddressComment ?? (object) DBNull.Value);
                    row.SetField("Instruction", pickPoint.Instruction ?? (object) DBNull.Value);
                    row.SetField("Latitude", pickPoint.Latitude ?? (object) DBNull.Value);
                    row.SetField("Longitude", pickPoint.Longitude ?? (object) DBNull.Value);
                    row.SetField("WorkTimeStr", pickPoint.WorkTimeStr ?? (object) DBNull.Value);
                    row.SetField("TimeWork", TimeWorksToString(pickPoint.TimeWork)?.Reduce(455) ?? (object) DBNull.Value);
                    row.SetField("Phone", pickPoint.Phone ?? (object) DBNull.Value);
                    row.SetField("PaymentMethods",
                        pickPoint.PaymentMethods != null
                            ? string.Join(";", pickPoint.PaymentMethods).Reduce(100)
                            : (object) DBNull.Value);
                    row.SetField("IsPostOffice", pickPoint.IsPostOffice);
                    row.SetField("IsYandexBranded", pickPoint.IsYandexBranded);
                    row.SetField("IsMarketPartner", pickPoint.IsMarketPartner);
                    row.SetField("IsDarkStore", pickPoint.IsDarkStore);
                    row.SetField("LastUpdate", startDate);
                    row.SetField("IsFittingAllowed", pickPoint.IsFittingAllowed);
                    row.SetField("IsPartialRefuseAllowed", pickPoint.IsPartialRefuseAllowed);
                    row.SetField("IsPaperlessPickupAllowed", pickPoint.IsPaperlessPickupAllowed);
                    row.SetField("IsUnboxingAllowed", pickPoint.IsUnboxingAllowed);

                    tablePickPointsBulk.Rows.Add(row);

                    if (tablePickPointsBulk.Rows.Count % 100 == 0)
                        InsertBulk(tablePickPointsBulk);
                }
            }

            if (isEmptyDeliveryPoints)
                InsertBulk(tablePickPointsBulk);
            else if (pickPoints.Points.Count != 0)
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
                        sqlBulkCopy.DestinationTableName = "[Shipping].[YandexPickupPoint]";
                        sqlBulkCopy.WriteToServer(data);
                        data.Rows.Clear();
                    }
                    dbConnection.Close();
                }
            }
        }
    }
}