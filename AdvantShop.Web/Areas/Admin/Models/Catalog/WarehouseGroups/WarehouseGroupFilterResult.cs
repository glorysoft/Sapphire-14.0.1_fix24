using System.Linq;
using AdvantShop.Core.Services.Catalog.Warehouses;
using AdvantShop.Web.Infrastructure.Admin;

namespace AdvantShop.Web.Admin.Models.Catalog.WarehouseGroups
{
    public sealed class WarehouseGroupFilterResult : FilterResult<WarehouseGroupItem>
    {
        
    }

    public sealed class WarehouseGroupItem
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public bool Enabled { get; set; }
        public int SortOrder { get; set; }

        public string Warehouses => 
            string.Join(", ", WarehouseGroupService.GetWarehouses(Id).Select(x => x.Name));
    }
}