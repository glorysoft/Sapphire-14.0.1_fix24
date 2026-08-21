using System;
using System.Collections.Generic;
using AdvantShop.CMS;
using AdvantShop.SEO;

namespace AdvantShop.Models.Warehouse
{
    public class WarehouseModel
    {
        public int Id { get; set; }

        public string Name { get; set; }


        private string _urlPath;
        public string UrlPath
        {
            get => _urlPath;
            set => _urlPath = value.ToLower();
        }
        
        public string Description { get; set; }

        public bool Enabled { get; set; }

        public int? CityId { get; set; }

        public string Address { get; set; }
        
        public PointGeometry Geometry { get; set; }

        public string AddressComment { get; set; }

        public string Phone { get; set; }

        public string Phone2 { get; set; }

        public string Email { get; set; }
        
        public string[] TimeOfWorkList { get; set; }
        
        public List<BreadCrumbs> BreadCrumbs { get; set; }
        
        public MetaInfo MetaInfo { get; set; }
    }

    public class PointGeometry
    {
        public string Type { get; set; }
        private float?[] _coordinates;
        
        public float?[] Coordinates
        {
            get { return _coordinates; }
            set
            {
                if (value.Length != 2)
                {
                    throw new ArgumentException("Coordinates must have exactly 2 elements.");
                }
                _coordinates = value;
            }
        }
        
        public PointGeometry(string type, float? x, float? y)
        {
            Type = type;
            _coordinates = new float?[2] { y, x };
        }
    }
}