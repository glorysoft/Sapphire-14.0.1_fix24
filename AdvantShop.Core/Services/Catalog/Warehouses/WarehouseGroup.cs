using AdvantShop.Catalog;

namespace AdvantShop.Core.Services.Catalog.Warehouses
{
    public class WarehouseGroup
    {
        public int Id { get; set; }
        public string ExternalId { get; set; }
        public string Name { get; set; } 
        public string Description { get; set; } 
        public int SortOrder { get; set; }
        public bool Enabled { get; set; }
        
        private WarehouseGroupPhoto _photo;
        public WarehouseGroupPhoto Photo
        {
            get => _photo ?? (_photo = PhotoService.GetPhotoByObjId<WarehouseGroupPhoto>(Id, PhotoType.WarehouseGroupPhoto));
            set => _photo = value;
        }
        
        private WarehouseGroupPhoto _logo;
        public WarehouseGroupPhoto Logo
        {
            get => _logo ?? (_logo = PhotoService.GetPhotoByObjId<WarehouseGroupPhoto>(Id, PhotoType.WarehouseGroupLogo));
            set => _logo = value;
        }
        
        public string Phone { get; set; }
        public int? CountryId { get; set; } 
        public int? RegionId { get; set; } 
        public int? CityId { get; set; }
        
        public string Vk { get; set; }
        public string Facebook { get; set; }
        public string Instagram { get; set; }
        public string Twitter { get; set; }
        public string Telegram { get; set; }
        public string OkRu { get; set; }
        public string Youtube { get; set; }
        public string Zen { get; set; }
        public string Rutube { get; set; }
        
    }
}