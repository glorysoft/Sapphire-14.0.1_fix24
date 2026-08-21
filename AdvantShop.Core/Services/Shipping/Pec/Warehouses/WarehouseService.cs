using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Globalization;
using System.Linq;
using System.Text;
using AdvantShop.Core.Common.Extensions;
using AdvantShop.Core.SQL;
using AdvantShop.Helpers;
using AdvantShop.Localization;
using AdvantShop.Shipping.Pec.Api;

namespace AdvantShop.Shipping.Pec.Warehouses
{
    public class WarehouseService
    {
        public static WarehouseDto Get(string id)
        {
            if (id.IsNotEmpty())
            {
                return SQLDataAccess.ExecuteReadOne(
                    "SELECT * FROM [Shipping].[PecWarehouses] WHERE [Id] = @Id",
                    CommandType.Text,
                    FromReader,
                    new SqlParameter("@Id", id ?? (object)DBNull.Value));
            }
            return null;
        }
       
        public static IList<WarehouseDto> GetList()
        {
            return SQLDataAccess.ExecuteReadList(
                "SELECT * FROM [Shipping].[PecWarehouses]",
                CommandType.Text,
                FromReader);
        }

        public static IList<WarehouseDto> Find(long? branchId, long? cityId, IList<string> divisionIds, float? weight, double? maxDimension, double? maxVolume)
        {
            if (branchId is null 
                && cityId is null 
                && divisionIds is null
                && weight is null
                && maxDimension is null
                && maxVolume is null)
                return GetList();
      
            
            var listParams = new List<SqlParameter>();
            var where = new List<string>();

            if (branchId != null)
            {
                listParams.Add(new SqlParameter("@BranchBitrixId", branchId.Value));
                where.Add("[BranchBitrixId] = @BranchBitrixId");
            }

            if (cityId != null)
            {
                listParams.Add(new SqlParameter("@CityBitrixId", cityId.Value));
                where.Add("[CityBitrixId] = @CityBitrixId");
            }

            if (divisionIds != null)
            {
                var whereDivistion = new StringBuilder("[DivisionId] IN (");
                for (var i = 0; i < divisionIds.Count; i++)
                {
                    listParams.Add(new SqlParameter($"@DivisionId{i}", divisionIds[i]));
                    if (i != 0)
                        whereDivistion.Append(",");
                    whereDivistion.Append($"@DivisionId{i}");
                }

                whereDivistion.Append(")");
                where.Add(whereDivistion.ToString());
            }

            if (weight != null)
            {
                listParams.Add(new SqlParameter("@MaxWeightPerPlace", weight.Value));
                where.Add("([IsRestrictions] = 0 OR [MaxWeightPerPlace] IS NULL OR [MaxWeightPerPlace] >= @MaxWeightPerPlace)");
            }

            if (maxDimension != null)
            {
                listParams.Add(new SqlParameter("@MaxDimension", maxDimension.Value));
                where.Add("([IsRestrictions] = 0 OR [MaxDimension] IS NULL OR [MaxDimension] >= @MaxDimension)");
            }

            if (maxVolume != null)
            {
                listParams.Add(new SqlParameter("@MaxVolume", maxVolume.Value));
                where.Add("([IsRestrictions] = 0 OR [MaxVolume] IS NULL OR [MaxVolume] >= @MaxVolume)");
            }
      
            return SQLDataAccess.ExecuteReadList(
                $"SELECT * FROM [Shipping].[PecWarehouses] WHERE {string.Join(" AND ", where)}",
                CommandType.Text,
                FromReader,
                listParams.ToArray());
        }
         
        public static IList<WarehouseDto> FindByBounds(float topLeftLatitude, float topLeftLongitude,
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
                $"SELECT * FROM [Shipping].[PecWarehouses] WHERE {string.Join(" AND ", where)}",
                CommandType.Text,
                FromReader,
                listParams.ToArray());
        }
        
        public static WarehouseDto FromReader(SqlDataReader reader)
        {
            return new WarehouseDto
            {
                Id = SQLDataHelper.GetString(reader, "Id"),
                Code = SQLDataHelper.GetString(reader, "Code"),
                Name = SQLDataHelper.GetString(reader, "Name"),
                BranchId = SQLDataHelper.GetString(reader, "BranchId"),
                BranchBitrixId = SQLDataHelper.GetLong(reader, "BranchBitrixId"),
                DivisionId = SQLDataHelper.GetString(reader, "DivisionId"),
                CityId = SQLDataHelper.GetString(reader, "CityId"),
                CityBitrixId = SQLDataHelper.GetNullableLong(reader, "CityBitrixId"),
                Address = SQLDataHelper.GetString(reader, "Address"),
                AddressComment = SQLDataHelper.GetString(reader, "AddressComment"),
                Phone = SQLDataHelper.GetString(reader, "Phone"),
                Latitude = SQLDataHelper.GetFloat(reader, "Latitude"),
                Longitude = SQLDataHelper.GetFloat(reader, "Longitude"),
                WorkTimeStr = SQLDataHelper.GetString(reader, "WorkTimeStr"),
                TimeWork = TimeWorksFromString(SQLDataHelper.GetString(reader, "TimeWork")),
                IsRestrictions = SQLDataHelper.GetBoolean(reader, "IsRestrictions"),
                MaxDimension = SQLDataHelper.GetNullableDouble(reader, "MaxDimension"),
                MaxWeightPerPlace = SQLDataHelper.GetNullableFloat(reader, "MaxWeightPerPlace"),
                MaxVolume = SQLDataHelper.GetNullableDouble(reader, "MaxVolume"),
            };
        }

        public static bool ExistsWarehouses()
        {
            return SQLDataAccess.ExecuteScalar<bool>("SELECT CASE WHEN EXISTS(SELECT * FROM [Shipping].[PecWarehouses]) THEN 1 ELSE 0 END", CommandType.Text);
        }

        public static void Add(WarehouseDto warehouseDto)
        {
            SQLDataAccess.ExecuteNonQuery(
                @"INSERT INTO [Shipping].[PecWarehouses]
                    ([Id],[Code],[Name],[BranchId],[BranchBitrixId],[DivisionId],[CityId],[CityBitrixId],[Address],
                     [AddressComment],[Phone],[Latitude],[Longitude],[WorkTimeStr],[TimeWork],[IsRestrictions],
                     [MaxDimension],[MaxWeightPerPlace],[MaxVolume],[LastUpdate])
                VALUES
	                (@Id,@Code,@Name,@BranchId,@BranchBitrixId,@DivisionId,@CityId,@CityBitrixId,@Address,
	                @AddressComment,@Phone,@Latitude,@Longitude,@WorkTimeStr,@TimeWork,@IsRestrictions,
	                @MaxDimension,@MaxWeightPerPlace,@MaxVolume,@LastUpdate)",
                CommandType.Text,
                new SqlParameter("@Id", warehouseDto.Id ?? (object) DBNull.Value),
                new SqlParameter("@Code", warehouseDto.Code ?? (object) DBNull.Value),
                new SqlParameter("@Name", warehouseDto.Name ?? (object) DBNull.Value),
                new SqlParameter("@BranchId", warehouseDto.BranchId ?? (object) DBNull.Value),
                new SqlParameter("@BranchBitrixId", warehouseDto.BranchBitrixId),
                new SqlParameter("@DivisionId", warehouseDto.DivisionId ?? (object) DBNull.Value),
                new SqlParameter("@CityId", warehouseDto.CityId ?? (object) DBNull.Value),
                new SqlParameter("@CityBitrixId", warehouseDto.CityBitrixId ?? (object) DBNull.Value),
                new SqlParameter("@Address", warehouseDto.Address ?? (object) DBNull.Value),
                new SqlParameter("@AddressComment", warehouseDto.AddressComment ?? (object) DBNull.Value),
                new SqlParameter("@Phone", warehouseDto.Phone ?? (object) DBNull.Value),
                new SqlParameter("@Latitude", warehouseDto.Latitude),
                new SqlParameter("@Longitude", warehouseDto.Longitude),
                new SqlParameter("@WorkTimeStr", warehouseDto.WorkTimeStr ?? (object) DBNull.Value),
                new SqlParameter("@TimeWork", TimeWorksToString(warehouseDto.TimeWork)?.Reduce(455) ?? (object) DBNull.Value),
                new SqlParameter("@IsRestrictions", warehouseDto.IsRestrictions),
                new SqlParameter("@MaxDimension", warehouseDto.MaxDimension),
                new SqlParameter("@MaxWeightPerPlace", warehouseDto.MaxWeightPerPlace),
                new SqlParameter("@MaxVolume", warehouseDto.MaxVolume),
                new SqlParameter("@LastUpdate", DateTime.Now)
            );
        }

        public static void Update(WarehouseDto warehouseDto)
        {
            SQLDataAccess.ExecuteNonQuery(
                @"UPDATE [Shipping].[PecWarehouses]
                   SET [Code] = @Code
                      ,[Name] = @Name
                      ,[BranchId] = @BranchId
                      ,[BranchBitrixId] = @BranchBitrixId
                      ,[DivisionId] = @DivisionId
                      ,[CityId] = @CityId
                      ,[CityBitrixId] = @CityBitrixId
                      ,[Address] = @Address
                      ,[AddressComment] = @AddressComment
                      ,[Phone] = @Phone
                      ,[Latitude] = @Latitude
                      ,[Longitude] = @Longitude
                      ,[WorkTimeStr] = @WorkTimeStr
                      ,[TimeWork] = @TimeWork
                      ,[IsRestrictions] = @IsRestrictions
                      ,[MaxDimension] = @MaxDimension
                      ,[MaxWeightPerPlace] = @MaxWeightPerPlace
                      ,[MaxVolume] = @MaxVolume
                      ,[LastUpdate] = @LastUpdate
                 WHERE [Id] = @Id",
                CommandType.Text,
                new SqlParameter("@Id", warehouseDto.Id ?? (object) DBNull.Value),
                new SqlParameter("@Code", warehouseDto.Code ?? (object) DBNull.Value),
                new SqlParameter("@Name", warehouseDto.Name ?? (object) DBNull.Value),
                new SqlParameter("@BranchId", warehouseDto.BranchId ?? (object) DBNull.Value),
                new SqlParameter("@BranchBitrixId", warehouseDto.BranchBitrixId),
                new SqlParameter("@DivisionId", warehouseDto.DivisionId ?? (object) DBNull.Value),
                new SqlParameter("@CityId", warehouseDto.CityId ?? (object) DBNull.Value),
                new SqlParameter("@CityBitrixId", warehouseDto.CityBitrixId ?? (object) DBNull.Value),
                new SqlParameter("@Address", warehouseDto.Address ?? (object) DBNull.Value),
                new SqlParameter("@AddressComment", warehouseDto.AddressComment ?? (object) DBNull.Value),
                new SqlParameter("@Phone", warehouseDto.Phone ?? (object) DBNull.Value),
                new SqlParameter("@Latitude", warehouseDto.Latitude),
                new SqlParameter("@Longitude", warehouseDto.Longitude),
                new SqlParameter("@WorkTimeStr", warehouseDto.WorkTimeStr ?? (object) DBNull.Value),
                new SqlParameter("@TimeWork", TimeWorksToString(warehouseDto.TimeWork)?.Reduce(455) ?? (object) DBNull.Value),
                new SqlParameter("@IsRestrictions", warehouseDto.IsRestrictions),
                new SqlParameter("@MaxDimension", warehouseDto.MaxDimension),
                new SqlParameter("@MaxWeightPerPlace", warehouseDto.MaxWeightPerPlace),
                new SqlParameter("@MaxVolume", warehouseDto.MaxVolume),
                new SqlParameter("@LastUpdate", DateTime.Now)
                );
        }
        
        public static void RemoveOld(DateTime startAt)
        {
            SQLDataAccess.ExecuteNonQuery(
                @"DELETE FROM [Shipping].[PecWarehouses] WHERE [LastUpdate] < @startAt",
                CommandType.Text,
                new SqlParameter("startAt", startAt));
        }

        public static List<TimeWork> ConvertToTimeWorks(List<TimeOfWork> timeOfWorks, CultureInfo currentCulture)
        {
            if (timeOfWorks?.Count > 0 is false)
                return null;

            var schedule = new Dictionary<string, (string TimeFrom, string TimeTo, List<byte> Days)>();
                
            foreach (var timeOfWork in timeOfWorks)
            {
                var workTime = GetWorkTime(timeOfWork);
                if (schedule.ContainsKey(workTime))
                    schedule[workTime].Days.Add(timeOfWork.DayOfWeek);
                else
                    schedule.Add(workTime, (timeOfWork.WorkFrom, timeOfWork.WorkTo, new List<byte> {timeOfWork.DayOfWeek}));
            }

            var list = schedule
                  .Select(kv =>
                   {
                       if (TimeSpan.TryParse(kv.Value.TimeFrom, out var timeFrom)
                           && TimeSpan.TryParse(kv.Value.TimeTo, out var timeTo))
                           return new TimeWork
                           {
                               From = timeFrom,
                               To = timeTo,
                               Label = string.Join(", ",
                                   kv.Value.Days.OrderBy(x => x)
                                     .Select(x =>
                                          currentCulture.DateTimeFormat.GetAbbreviatedDayName(
                                              x == 7 ? DayOfWeek.Sunday : (DayOfWeek) x)))
                           };
                       return null;
                   })
                  .Where(x => x != null)
                  .ToList();
       
            if (list.Count == 0)
                return null;

            return list;
        }

        private static string GetWorkTime(TimeOfWork timeOfWork)
        {
            return string.Format("{0}{1}", 
                timeOfWork.WorkFrom + "-" + timeOfWork.WorkTo,
                timeOfWork.DinnerFrom.IsNotEmpty()
                    ? ", обед с " + timeOfWork.DinnerFrom + " до " + timeOfWork.DinnerTo
                    : null);
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
        
        public static bool Sync(PecApiService pecApi)
        {
            var isEmptyDeliveryPoints = !ExistsWarehouses();
            var startDate = DateTime.Now;

            var tablePickPointsBulk =
                isEmptyDeliveryPoints
                    ? SQLDataAccess.ExecuteTable(@"SELECT * FROM [Shipping].[PecWarehouses]", CommandType.Text)
                    : null;

            var currentCulture = Culture.GetCulture();
            var result = pecApi.GetAllBranches();

            if (result is null 
                || !result.Success 
                || result.Result is null
                || result.Result.Branches is null
                || result.Result.Branches.Count == 0)
                return false;

            var branches = result.Result.Branches;

            foreach (var branch in branches)
            {
                foreach (var division in branch.Divisions)
                {
                    foreach (var warehouse in division.Warehouses)
                    {
                        var warehouseDto = isEmptyDeliveryPoints
                            ? null
                            : Get(warehouse.Id);

                        var isNew = warehouseDto == null;

                        if (warehouseDto == null)
                            warehouseDto = new WarehouseDto();

                        warehouseDto.Id = warehouse.Id;
                        warehouseDto.Code = warehouse.WarehouseCode;
                        warehouseDto.Name = warehouse.Name;
                        warehouseDto.BranchId = branch.Id;
                        warehouseDto.BranchBitrixId = branch.BitrixId;
                        warehouseDto.DivisionId = division.Id;
                        warehouseDto.CityId = division.CityId;
                        warehouseDto.CityBitrixId = branch.Cities.Find(x => x.CityId == division.CityId)?.BitrixId;
                        warehouseDto.Address = warehouse.Address?.Reduce(255);
                        warehouseDto.AddressComment = warehouse.PointerDescription;
                        warehouseDto.Phone = warehouse.Telephone?.Reduce(50);
                        warehouseDto.Latitude = warehouse.Coordinatesobj.Latitude;
                        warehouseDto.Longitude = warehouse.Coordinatesobj.Longitude;
                        warehouseDto.TimeWork = ConvertToTimeWorks(warehouse.DivisionTimeOfWork, currentCulture);
                        warehouseDto.WorkTimeStr = warehouseDto.TimeWork != null
                          ? string.Join(", ",
                              warehouseDto.TimeWork
                                       .Select(timeWork => $"{timeWork.Label}: {timeWork.From:hh\\:mm}-{timeWork.To:hh\\:mm}")).Reduce(100)
                          : null;
                        warehouseDto.IsRestrictions = warehouse.IsRestrictions;
                        warehouseDto.MaxDimension = warehouse.MaxDimension;
                        warehouseDto.MaxWeightPerPlace = warehouse.MaxWeightPerPlace;
                        warehouseDto.MaxVolume = warehouse.MaxVolume;

                        if (!isEmptyDeliveryPoints)
                        {
                            if (isNew)
                                Add(warehouseDto);
                            else
                                Update(warehouseDto);
                        }
                        else
                        {
                            var row = tablePickPointsBulk.NewRow();

                            row.SetField("Id", warehouseDto.Id ?? (object) DBNull.Value);
                            row.SetField("Code", warehouseDto.Code ?? (object) DBNull.Value);
                            row.SetField("Name", warehouseDto.Name ?? (object) DBNull.Value);
                            row.SetField("BranchId", warehouseDto.BranchId ?? (object) DBNull.Value);
                            row.SetField("BranchBitrixId", warehouseDto.BranchBitrixId);
                            row.SetField("DivisionId", warehouseDto.DivisionId ?? (object) DBNull.Value);
                            row.SetField("CityId", warehouseDto.CityId ?? (object) DBNull.Value);
                            row.SetField("CityBitrixId", warehouseDto.CityBitrixId ?? (object) DBNull.Value);
                            row.SetField("Address", warehouseDto.Address ?? (object) DBNull.Value);
                            row.SetField("AddressComment", warehouseDto.AddressComment ?? (object) DBNull.Value);
                            row.SetField("Phone", warehouseDto.Phone ?? (object) DBNull.Value);
                            row.SetField("Latitude", warehouseDto.Latitude);
                            row.SetField("Longitude", warehouseDto.Longitude);
                            row.SetField("WorkTimeStr", warehouseDto.WorkTimeStr ?? (object) DBNull.Value);
                            row.SetField("TimeWork", TimeWorksToString(warehouseDto.TimeWork)?.Reduce(455) ?? (object) DBNull.Value);
                            row.SetField("IsRestrictions", warehouseDto.IsRestrictions);
                            row.SetField("MaxDimension", warehouseDto.MaxDimension);
                            row.SetField("MaxWeightPerPlace", warehouseDto.MaxWeightPerPlace);
                            row.SetField("MaxVolume", warehouseDto.MaxVolume);
                            row.SetField("LastUpdate", startDate);

                            tablePickPointsBulk.Rows.Add(row);

                            if (tablePickPointsBulk.Rows.Count % 100 == 0)
                                InsertBulk(tablePickPointsBulk);
                        }
                    }
                }
            }

            if (isEmptyDeliveryPoints)
                InsertBulk(tablePickPointsBulk);
            else
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
                        sqlBulkCopy.DestinationTableName = "[Shipping].[PecWarehouses]";
                        sqlBulkCopy.WriteToServer(data);
                        data.Rows.Clear();
                    }
                    dbConnection.Close();
                }
            }
        }    }
}