using System.Linq;
using AdvantShop.Areas.Api.Models.Warehouses;
using AdvantShop.Configuration;
using AdvantShop.Core.Services.Catalog.Warehouses;
using AdvantShop.Repository;
using AdvantShop.Web.Infrastructure.Handlers;

namespace AdvantShop.Areas.Api.Handlers.Warehouses
{
    internal sealed class GetWarehouseGroupsApi : AbstractCommandHandler<GetWarehouseGroupsResponse>
    {
        private readonly WarehouseGroupsFilter _filter;
        
        public GetWarehouseGroupsApi(WarehouseGroupsFilter filter)
        {
            _filter = filter;
        }

        protected override GetWarehouseGroupsResponse Handle()
        {
            if (!FeaturesService.IsEnabled(EFeature.WarehouseGroups))
                return null;

            var items = WarehouseGroupService.GetList();
            
            if (_filter?.CountryId != null)
                items = items.Where(x => x.CountryId == _filter.CountryId.Value).ToList();
            
            if (_filter?.RegionId != null)
                items = items.Where(x => x.RegionId == _filter.RegionId.Value).ToList();
            
            if (_filter?.CityId != null)
                items = items.Where(x => x.CityId == _filter.CityId.Value).ToList();

            if (_filter?.City != null)
            {
                var city =
                    _filter.RegionId != null
                        ? CityService.GetCityByName(_filter.City, _filter.RegionId.Value)
                        : CityService.GetCityByName(_filter.City);
                
                if (city != null)
                    items = items.Where(x => x.CityId == city.CityId).ToList();
            }
            
            return new GetWarehouseGroupsResponse(items);
        }
    }
}