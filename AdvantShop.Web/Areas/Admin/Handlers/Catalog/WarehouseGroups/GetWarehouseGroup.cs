using AdvantShop.Core.Services.Catalog.Warehouses;
using AdvantShop.Web.Admin.Models.Catalog.WarehouseGroups;
using AdvantShop.Web.Infrastructure.Handlers;

namespace AdvantShop.Web.Admin.Handlers.Catalog.WarehouseGroups
{
    internal sealed class GetWarehouseGroup : AbstractCommandHandler<WarehouseGroupModel>
    {
        private readonly WarehouseGroup _group;

        public GetWarehouseGroup(WarehouseGroup group)
        {
            _group = group;
        }

        protected override WarehouseGroupModel Handle()
        {
            return _group is null 
                ? new WarehouseGroupModel() { Enabled = true } 
                : new WarehouseGroupModel(_group);
        }
    }
}