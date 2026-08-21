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
using AdvantShop.Shipping.Sdek.Api;

namespace AdvantShop.Shipping.Sdek.DeliveryPoints
{
    public class DeliveryPointService
    {
        public static DeliveryPointDto Get(string code)
        {
            if (code.IsNotEmpty())
            {
                return SQLDataAccess.ExecuteReadOne(
                    "SELECT * FROM [Shipping].[SdekDeliveryPoint] WHERE [Code] = @Code",
                    CommandType.Text,
                    FromReader,
                    new SqlParameter("@Code", code ?? (object)DBNull.Value));
            }
            return null;
        }
 
        public static bool HasDeliveryPoint(string code)
        {
            return SQLDataAccess.ExecuteScalar<bool>(
                @"IF EXISTS (SELECT * FROM [Shipping].[SdekDeliveryPoint] WHERE [Code] = @Code) 
                SELECT 1 
                ELSE
                SELECT 0",
                CommandType.Text,
                new SqlParameter("@Code", code ?? (object)DBNull.Value));
        }

        public static IList<DeliveryPointDto> GetList()
        {
            return SQLDataAccess.ExecuteReadList(
                "SELECT * FROM [Shipping].[SdekDeliveryPoint]",
                CommandType.Text,
                FromReader);
        }

        public static IList<DeliveryPointDto> Find(int? cityCode, float? weight, float[] dimensions)
        {
            if (cityCode is null && weight is null && dimensions is null)
                return GetList();
      
            
            var listParams = new List<SqlParameter>();
            var where = new List<string>();

            if (cityCode != null)
            {
                listParams.Add(new SqlParameter("@CityCode", cityCode));
                where.Add("[CityCode] = @CityCode");
            }

            if (weight.HasValue)
            {
                listParams.Add(new SqlParameter("@Weight", weight.Value));
                where.Add("([WeightMax] IS NULL OR [WeightMax] >= @Weight)");
                where.Add("([WeightMin] IS NULL OR [WeightMin] <= @Weight)");
            }

            if (dimensions != null)
            {
                listParams.Add(new SqlParameter("@Length", dimensions[0]));
                listParams.Add(new SqlParameter("@Width", dimensions[1]));
                listParams.Add(new SqlParameter("@Height", dimensions[2]));
                
                where.Add("([MaxHeight] IS NULL OR [MaxHeight] >= @Height)");
                where.Add("([MaxWidth] IS NULL OR [MaxWidth] >= @Width)");
                where.Add("([MaxLength] IS NULL OR [MaxLength] >= @Length)");
            }
      
            return SQLDataAccess.ExecuteReadList(
                $"SELECT * FROM [Shipping].[SdekDeliveryPoint] WHERE {string.Join(" AND ", where)}",
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
                $"SELECT * FROM [Shipping].[SdekDeliveryPoint] WHERE {string.Join(" AND ", where)}",
                CommandType.Text,
                FromReader,
                listParams.ToArray());
        }
        
        public static DeliveryPointDto FromReader(SqlDataReader reader)
        {
            return new DeliveryPointDto
            {
                Code = SQLDataHelper.GetString(reader, "Code"),
                Type = SQLDataHelper.GetString(reader, "Type"),
                CityCode = SQLDataHelper.GetInt(reader, "CityCode"),
                CityFias = SQLDataHelper.GetString(reader, "CityFias"),
                Address = SQLDataHelper.GetString(reader, "Address"),
                AddressComment = SQLDataHelper.GetString(reader, "AddressComment"),
                Latitude = SQLDataHelper.GetFloat(reader, "Latitude"),
                Longitude = SQLDataHelper.GetFloat(reader, "Longitude"),
                WorkTimeStr = SQLDataHelper.GetString(reader, "WorkTimeStr"),
                TimeWork = TimeWorksFromString(SQLDataHelper.GetString(reader, "TimeWork")),
                Phones = SQLDataHelper.GetString(reader, "Phones")?.Split(new []{'$'}, StringSplitOptions.RemoveEmptyEntries),
                HaveCashless = SQLDataHelper.GetBoolean(reader, "HaveCashless"),
                HaveCash = SQLDataHelper.GetBoolean(reader, "HaveCash"),
                AllowedCod = SQLDataHelper.GetBoolean(reader, "AllowedCod"),
                WeightMin = SQLDataHelper.GetNullableFloat(reader, "WeightMin"),
                WeightMax = SQLDataHelper.GetNullableFloat(reader, "WeightMax"),
                MaxHeight = SQLDataHelper.GetNullableFloat(reader, "MaxHeight"),
                MaxWidth = SQLDataHelper.GetNullableFloat(reader, "MaxWidth"),
                MaxLength = SQLDataHelper.GetNullableFloat(reader, "MaxLength"),
            };
        }

        public static bool ExistsDeliveryPoints()
        {
            return SQLDataAccess.ExecuteScalar<bool>("SELECT CASE WHEN EXISTS(SELECT * FROM [Shipping].[SdekDeliveryPoint]) THEN 1 ELSE 0 END", CommandType.Text);
        }

        public static void Add(DeliveryPointDto pointDto)
        {
            SQLDataAccess.ExecuteNonQuery(
                @"INSERT INTO [Shipping].[SdekDeliveryPoint]
                    ([Code],[Type],[CityCode],[CityFias],[Address],[AddressComment],[Latitude],[Longitude],[WorkTimeStr],
                     [TimeWork],[Phones],[HaveCashless],[HaveCash],[AllowedCod],[WeightMin],[WeightMax],[MaxHeight],
                     [MaxWidth],[MaxLength],[LastUpdate])
                VALUES
	                (@Code,@Type,@CityCode,@CityFias,@Address,@AddressComment,@Latitude,@Longitude,@WorkTimeStr,
	                @TimeWork,@Phones,@HaveCashless,@HaveCash,@AllowedCod,@WeightMin,@WeightMax,@MaxHeight,
	                @MaxWidth,@MaxLength,@LastUpdate)",
                CommandType.Text,
                new SqlParameter("@Code", pointDto.Code ?? (object) DBNull.Value),
                new SqlParameter("@Type", pointDto.Type ?? (object) DBNull.Value),
                new SqlParameter("@CityCode", pointDto.CityCode),
                new SqlParameter("@CityFias", pointDto.CityFias ?? (object) DBNull.Value),
                new SqlParameter("@Address", pointDto.Address ?? (object) DBNull.Value),
                new SqlParameter("@AddressComment", pointDto.AddressComment ?? (object) DBNull.Value),
                new SqlParameter("@Latitude", pointDto.Latitude),
                new SqlParameter("@Longitude", pointDto.Longitude),
                new SqlParameter("@WorkTimeStr", pointDto.WorkTimeStr ?? (object) DBNull.Value),
                new SqlParameter("@TimeWork", TimeWorksToString(pointDto.TimeWork)?.Reduce(455) ?? (object) DBNull.Value),
                new SqlParameter("@Phones",
                    pointDto.Phones is null ? (object) DBNull.Value : string.Join("$", pointDto.Phones).Reduce(455)),
                new SqlParameter("@HaveCashless", pointDto.HaveCashless),
                new SqlParameter("@HaveCash", pointDto.HaveCash),
                new SqlParameter("@AllowedCod", pointDto.AllowedCod),
                new SqlParameter("@WeightMin", pointDto.WeightMin ?? (object) DBNull.Value),
                new SqlParameter("@WeightMax", pointDto.WeightMax ?? (object) DBNull.Value),
                new SqlParameter("@MaxHeight", pointDto.MaxHeight ?? (object) DBNull.Value),
                new SqlParameter("@MaxWidth", pointDto.MaxWidth ?? (object) DBNull.Value),
                new SqlParameter("@MaxLength", pointDto.MaxLength ?? (object) DBNull.Value),
                new SqlParameter("@LastUpdate", DateTime.Now)
            );
        }

        public static void Update(DeliveryPointDto pointDto)
        {
            SQLDataAccess.ExecuteNonQuery(
                @"UPDATE [Shipping].[SdekDeliveryPoint]
                   SET [Type] = @Type
                      ,[CityCode] = @CityCode
                      ,[CityFias] = @CityFias
                      ,[Address] = @Address
                      ,[AddressComment] = @AddressComment
                      ,[Latitude] = @Latitude
                      ,[Longitude] = @Longitude
                      ,[WorkTimeStr] = @WorkTimeStr
                      ,[TimeWork] = @TimeWork
                      ,[Phones] = @Phones
                      ,[HaveCashless] = @HaveCashless
                      ,[HaveCash] = @HaveCash
                      ,[AllowedCod] = @AllowedCod
                      ,[WeightMin] = @WeightMin
                      ,[WeightMax] = @WeightMax
                      ,[MaxHeight] = @MaxHeight
                      ,[MaxWidth] = @MaxWidth
                      ,[MaxLength] = @MaxLength
                      ,[LastUpdate] = @LastUpdate
                 WHERE [Code] = @Code",
                CommandType.Text,
                new SqlParameter("@Code", pointDto.Code ?? (object) DBNull.Value),
                new SqlParameter("@Type", pointDto.Type ?? (object) DBNull.Value),
                new SqlParameter("@CityCode", pointDto.CityCode),
                new SqlParameter("@CityFias", pointDto.CityFias ?? (object) DBNull.Value),
                new SqlParameter("@Address", pointDto.Address ?? (object) DBNull.Value),
                new SqlParameter("@AddressComment", pointDto.AddressComment ?? (object) DBNull.Value),
                new SqlParameter("@Latitude", pointDto.Latitude),
                new SqlParameter("@Longitude", pointDto.Longitude),
                new SqlParameter("@WorkTimeStr", pointDto.WorkTimeStr ?? (object) DBNull.Value),
                new SqlParameter("@TimeWork", TimeWorksToString(pointDto.TimeWork)?.Reduce(455) ?? (object) DBNull.Value),
                new SqlParameter("@Phones",
                    pointDto.Phones is null ? (object) DBNull.Value : string.Join("$", pointDto.Phones).Reduce(455)),
                new SqlParameter("@HaveCashless", pointDto.HaveCashless),
                new SqlParameter("@HaveCash", pointDto.HaveCash),
                new SqlParameter("@AllowedCod", pointDto.AllowedCod),
                new SqlParameter("@WeightMin", pointDto.WeightMin ?? (object) DBNull.Value),
                new SqlParameter("@WeightMax", pointDto.WeightMax ?? (object) DBNull.Value),
                new SqlParameter("@MaxHeight", pointDto.MaxHeight ?? (object) DBNull.Value),
                new SqlParameter("@MaxWidth", pointDto.MaxWidth ?? (object) DBNull.Value),
                new SqlParameter("@MaxLength", pointDto.MaxLength ?? (object) DBNull.Value),
                new SqlParameter("@LastUpdate", DateTime.Now)
                );
        }
        
        public static void RemoveOld(DateTime startAt)
        {
            SQLDataAccess.ExecuteNonQuery(
                @"DELETE FROM [Shipping].[SdekDeliveryPoint] WHERE [LastUpdate] < @startAt",
                CommandType.Text,
                new SqlParameter("startAt", startAt));
        }

        public static List<TimeWork> ConvertToTimeWorks(List<WorkTimeList> pointWorkTimeList, CultureInfo currentCulture)
        {
            if (pointWorkTimeList?.Count > 0 is false)
                return null;

            var list =
                pointWorkTimeList
                   .GroupBy(workTime => workTime.Time)
                   .Select(workTimeGroup =>
                    {
                        var timeParts = workTimeGroup.Key.Split('/');

                        if (timeParts.Length == 2
                            && TimeSpan.TryParse(timeParts[0], out var timeFrom)
                            && TimeSpan.TryParse(timeParts[1], out var timeTo))
                        {
                            var minDayOfWeek = workTimeGroup.Min(x => x.Day);
                            var maxDayOfWeek = workTimeGroup.Max(x => x.Day);
                            return new TimeWork
                            {
                                From = timeFrom,
                                To = timeTo,
                                Label = 
                                    minDayOfWeek == maxDayOfWeek
                                        ? currentCulture.DateTimeFormat.GetAbbreviatedDayName(maxDayOfWeek == 7 ? DayOfWeek.Sunday : (DayOfWeek)maxDayOfWeek)
                                        : string.Format("{0}-{1}", 
                                            currentCulture.DateTimeFormat.GetAbbreviatedDayName(minDayOfWeek == 7 ? DayOfWeek.Sunday : (DayOfWeek)minDayOfWeek),
                                            currentCulture.DateTimeFormat.GetAbbreviatedDayName(maxDayOfWeek == 7 ? DayOfWeek.Sunday : (DayOfWeek)maxDayOfWeek))
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
        
        public static bool Sync(SdekApiService20 sdekApiService20)
        {
            var isEmptyDeliveryPoints = !ExistsDeliveryPoints();
            var startDate = DateTime.Now;

            var tablePickPointsBulk =
                isEmptyDeliveryPoints
                    ? SQLDataAccess.ExecuteTable(@"SELECT * FROM [Shipping].[SdekDeliveryPoint]", CommandType.Text)
                    : null;

            var currentLanguage = Culture.Language;
            var currentCulture = Culture.GetCulture();
            var pickPoints = sdekApiService20.GetDeliveryPoints(new DeliveryPointsFilter
            {
                Lang = currentLanguage == Culture.SupportLanguage.English
                    ? "eng"
                    : "rus",
                Type = "ALL",
                IsHandout = true
            });

            if (pickPoints is null)
                return false;

            foreach (var pickPointSource in pickPoints)
            {
                var pickPoint = isEmptyDeliveryPoints
                    ? null
                    : Get(pickPointSource.Code);

                var isNew = pickPoint == null;

                if (pickPoint == null)
                    pickPoint = new DeliveryPointDto();

                pickPoint.Code = pickPointSource.Code;
                pickPoint.Type = pickPointSource.Type;
                pickPoint.CityCode = pickPointSource.Location.CityCode;
                pickPoint.CityFias = pickPointSource.Location.FiasGuid;
                pickPoint.Address = pickPointSource.Location.Address?.Reduce(255);
                pickPoint.AddressComment = pickPointSource.AddressComment?.Reduce(255);
                pickPoint.Latitude = pickPointSource.Location.Latitude;
                pickPoint.Longitude = pickPointSource.Location.Longitude;
                pickPoint.WorkTimeStr = pickPointSource.WorkTime?.Reduce(100);
                pickPoint.TimeWork = ConvertToTimeWorks(pickPointSource.WorkTimeList, currentCulture);
                pickPoint.Phones = pickPointSource.Phones
                                                 ?.Select(x =>
                                                   {
                                                       var additional = x.Additional.IsNotEmpty() ? $"({x.Additional})" : null;
                                                       return $"{x.Number}{additional}";
                                                   })
                                                  .ToArray();
                pickPoint.HaveCashless = pickPointSource.HaveCashless;
                pickPoint.HaveCash = pickPointSource.HaveCash;
                pickPoint.AllowedCod = pickPointSource.AllowedCod;
                pickPoint.WeightMin = pickPointSource.WeightMin;
                pickPoint.WeightMax = pickPointSource.WeightMax;
                var firstDimensions = pickPointSource.Dimensions?.FirstOrDefault();
                pickPoint.MaxHeight = firstDimensions?.Height;
                pickPoint.MaxWidth = firstDimensions?.Width;
                pickPoint.MaxLength = firstDimensions?.Depth;

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
                    row.SetField("Type", pickPoint.Type ?? (object) DBNull.Value);
                    row.SetField("CityCode", pickPoint.CityCode);
                    row.SetField("CityFias", pickPoint.CityFias ?? (object) DBNull.Value);
                    row.SetField("Address", pickPoint.Address ?? (object) DBNull.Value);
                    row.SetField("AddressComment", pickPoint.AddressComment ?? (object) DBNull.Value);
                    row.SetField("Latitude", pickPoint.Latitude);
                    row.SetField("Longitude", pickPoint.Longitude);
                    row.SetField("WorkTimeStr", pickPoint.WorkTimeStr ?? (object) DBNull.Value);
                    row.SetField("TimeWork", TimeWorksToString(pickPoint.TimeWork)?.Reduce(455) ?? (object) DBNull.Value);
                    row.SetField("Phones", pickPoint.Phones is null ? (object) DBNull.Value : string.Join("$", pickPoint.Phones).Reduce(455));
                    row.SetField("HaveCashless", pickPoint.HaveCashless);
                    row.SetField("HaveCash", pickPoint.HaveCash);
                    row.SetField("AllowedCod", pickPoint.AllowedCod);
                    row.SetField("WeightMin", pickPoint.WeightMin ?? (object) DBNull.Value);
                    row.SetField("WeightMax", pickPoint.WeightMax ?? (object) DBNull.Value);
                    row.SetField("MaxHeight", pickPoint.MaxHeight ?? (object) DBNull.Value);
                    row.SetField("MaxWidth", pickPoint.MaxWidth ?? (object) DBNull.Value);
                    row.SetField("MaxLength", pickPoint.MaxLength ?? (object) DBNull.Value);
                    row.SetField("LastUpdate", startDate);

                    tablePickPointsBulk.Rows.Add(row);

                    if (tablePickPointsBulk.Rows.Count % 100 == 0)
                        InsertBulk(tablePickPointsBulk);
                }
            }

            if (isEmptyDeliveryPoints)
                InsertBulk(tablePickPointsBulk);
            else if (pickPoints.Count != 0)
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
                        sqlBulkCopy.DestinationTableName = "[Shipping].[SdekDeliveryPoint]";
                        sqlBulkCopy.WriteToServer(data);
                        data.Rows.Clear();
                    }
                    dbConnection.Close();
                }
            }
        }
    }
}