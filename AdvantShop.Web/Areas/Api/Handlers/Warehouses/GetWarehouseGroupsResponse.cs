using System.Collections.Generic;
using System.Linq;
using AdvantShop.Areas.Api.Models.Shared;
using AdvantShop.Core.Common.Extensions;
using AdvantShop.Core.Services.Api;
using AdvantShop.Core.Services.Catalog.Warehouses;
using AdvantShop.Repository;

namespace AdvantShop.Areas.Api.Handlers.Warehouses
{
    public sealed class GetWarehouseGroupsResponse : List<WarehouseGroupItemApi>, IApiResponse
    {
        public GetWarehouseGroupsResponse(List<WarehouseGroup> warehouseGroups)
        {
            foreach (var group in warehouseGroups)
            {
                this.Add(new WarehouseGroupItemApi(group));
            }
        }
    }

    public sealed class WarehouseGroupItemApi
    {
        public string Name { get; set; } 
        public string Description { get; set; } 
        
        public string PhotoUrl { get; set; }
        public string LogoUrl { get; set; }
        
        public string Phone { get; set; }
        public int? CountryId { get; set; } 
        public string CountryName { get; set; } 
        public int? RegionId { get; set; } 
        public string RegionName { get; set; } 
        public int? CityId { get; set; }
        public string CityName { get; set; } 
        
        public string Vk { get; set; }
        public string Facebook { get; set; }
        public string Instagram { get; set; }
        public string Twitter { get; set; }
        public string Telegram { get; set; }
        public string OkRu { get; set; }
        public string Youtube { get; set; }
        public string Zen { get; set; }
        public string Rutube { get; set; }
        
        public List<WarehouseApi> Warehouses { get; set; }
        
        public WarehouseGroupItemApi(WarehouseGroup warehouseGroup)
        {
            Name = warehouseGroup.Name;
            Description = warehouseGroup.Description.Default(null);
            PhotoUrl = warehouseGroup.Photo.ImageSrcPhoto().Default(null);
            LogoUrl = warehouseGroup.Logo.ImageSrcLogo().Default(null);
            Phone = warehouseGroup.Phone.Default(null);
            
            CountryId = warehouseGroup.CountryId;
            if (CountryId != null)
            {
                var country = CountryService.GetCountry(CountryId.Value);
                if (country != null)
                    CountryName = country.Name;
            }

            RegionId = warehouseGroup.RegionId;
            if (RegionId != null)
            {
                var region = RegionService.GetRegion(RegionId.Value);
                if (region != null)
                    RegionName = region.Name;
            }
            
            CityId = warehouseGroup.CityId;
            if (CityId != null)
            {
                var city = CityService.GetCity(CityId.Value);
                if (city != null)
                    CityName = city.Name;
            }
            
            Vk = warehouseGroup.Vk.Default(null);
            Facebook = warehouseGroup.Facebook.Default(null);
            Instagram = warehouseGroup.Instagram.Default(null);
            Twitter = warehouseGroup.Twitter.Default(null);
            Telegram = warehouseGroup.Telegram.Default(null);
            OkRu = warehouseGroup.OkRu.Default(null);
            Youtube = warehouseGroup.Youtube.Default(null);
            Zen = warehouseGroup.Zen.Default(null);
            Rutube = warehouseGroup.Rutube.Default(null);

            Warehouses = 
                WarehouseGroupService.GetWarehouses(warehouseGroup.Id)
                    .Select(x => new WarehouseApi(x))
                    .ToList();
        }
    }
}