using System.Collections.Generic;
using System.Linq;
using AdvantShop.Core.Services.Catalog.Warehouses;
using AdvantShop.Repository;
using Newtonsoft.Json;

namespace AdvantShop.Web.Admin.Models.Catalog.WarehouseGroups
{
    public sealed class WarehouseGroupModel : WarehouseGroup
    {
        public WarehouseGroupModel()
        {
        }

        public WarehouseGroupModel(WarehouseGroup group)
        {
            Id = group.Id;
            ExternalId = group.ExternalId;
            Name = group.Name;
            Enabled = group.Enabled;
            Description = group.Description;
            SortOrder = group.SortOrder;
            Photo = group.Photo;
            Logo = group.Logo;
            Phone = group.Phone;
            Vk = group.Vk;
            Facebook = group.Facebook;
            Instagram = group.Instagram;
            Twitter = group.Twitter;
            Telegram = group.Telegram;
            OkRu = group.OkRu;
            Youtube = group.Youtube;
            Zen = group.Zen;
            Rutube = group.Rutube;
            
            CountryId = group.CountryId;
            if (CountryId != null)
                CountryName = CountryService.GetCountry(CountryId.Value)?.Name;
            
            RegionId = group.RegionId;
            if (RegionId != null)
                RegionName = RegionService.GetRegion(RegionId.Value)?.Name;
            
            CityId = group.CityId;
            if (CityId != null)
                CityName = CityService.GetCity(CityId.Value)?.Name;

            Warehouses = WarehouseGroupService.GetWarehouses(Id);
            WarehouseIds = JsonConvert.SerializeObject(Warehouses.Select(x => x.Id).ToList());
        }
        
        public string CountryName { get; }
        public string RegionName { get; }
        public string CityName { get; }

        public string CountryAndRegion =>
            CountryName != null || RegionName != null 
                ? $"{CountryName}, {RegionName}" 
                : null;
        
        public List<Warehouse> Warehouses { get; }
        
        public string WarehouseIds { get; set; }
        
        public int? PhotoId { get; set; }
        public int? LogoId { get; set; }
    }
}