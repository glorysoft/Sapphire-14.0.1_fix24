using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using AdvantShop.CMS;
using AdvantShop.Core.Services.Catalog.Warehouses;
using AdvantShop.Core.Services.Localization;
using AdvantShop.Models.Warehouse;
using AdvantShop.SEO;
using AdvantShop.Web.Infrastructure.Extensions;
using AdvantShop.Web.Infrastructure.Handlers;

namespace AdvantShop.Handlers.Warehouse
{
    public class GetWarehouse : ICommandHandler<string, WarehouseModel>
    {
        private readonly UrlHelper _urlHelper;
        
        public GetWarehouse()
        {
            _urlHelper = new UrlHelper(HttpContext.Current.Request.RequestContext);
        }
        
        public WarehouseModel Execute(string shopUrl)
        {
            var shopInfo = WarehouseService.GetByUrl(shopUrl);
            
            if (shopInfo == null)
                return null;
            
            var model = new WarehouseModel
            {
                Id = shopInfo.Id,
                Name = shopInfo.Name,
                UrlPath = shopInfo.UrlPath,
                Description = shopInfo.Description,
                Enabled = shopInfo.Enabled,
                CityId = shopInfo.CityId,
                Address = shopInfo.Address,
                Geometry = new PointGeometry("Point", shopInfo.Longitude, shopInfo.Latitude),
                AddressComment = shopInfo.AddressComment,
                Phone = shopInfo.Phone,
                Phone2 = shopInfo.Phone2,
                Email = shopInfo.Email,
                TimeOfWorkList = TimeOfWorkService.GetWarehouseTimeOfWork(shopInfo.Id)
                    .Select(TimeOfWorkService.FormatTimeOfWork)
                    .ToArray(),
                BreadCrumbs = new List<BreadCrumbs>()
                {
                    new BreadCrumbs(LocalizationService.GetResource("MainPage"), _urlHelper.AbsoluteRouteUrl("Home")),
                    new BreadCrumbs(LocalizationService.GetResource("Main.Shops"), _urlHelper.AbsoluteRouteUrl("WarehouseHome")),
                    new BreadCrumbs(shopInfo.Name, _urlHelper.AbsoluteRouteUrl("WarehousesPage")),
                }
            };

            model.MetaInfo = 
                MetaInfoService.GetMetaInfo(model.Id, MetaType.Warehouse)
                ?? MetaInfoService.GetDefaultMetaInfo(MetaType.Warehouse, string.Empty);

            return model;
        }
    }
}