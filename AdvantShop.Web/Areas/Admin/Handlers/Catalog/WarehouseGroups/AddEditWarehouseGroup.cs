using System.Collections.Generic;
using AdvantShop.Catalog;
using AdvantShop.Core;
using AdvantShop.Core.Common.Extensions;
using AdvantShop.Core.Services.Catalog.Warehouses;
using AdvantShop.Helpers;
using AdvantShop.Repository;
using AdvantShop.Web.Admin.Models.Catalog.WarehouseGroups;
using AdvantShop.Web.Infrastructure.Handlers;
using Newtonsoft.Json;

namespace AdvantShop.Web.Admin.Handlers.Catalog.WarehouseGroups
{
    internal sealed class AddEditWarehouseGroup :  AbstractCommandHandler<int>
    {
        private readonly WarehouseGroupModel _groupModel;

        public AddEditWarehouseGroup(WarehouseGroupModel groupModel)
        {
            _groupModel = groupModel;
        }

        protected override void Validate()
        {
            if (_groupModel.Name.IsNullOrEmpty())
                throw new BlException("Укажите название");
        }

        protected override int Handle()
        {
            WarehouseGroup group = null;

            if (_groupModel.Id != 0)
            {
                group = WarehouseGroupService.Get(_groupModel.Id);
                if (group == null)
                    throw new BlException("Группа не найдена");
            }
            else
            {
                group = new WarehouseGroup();
            }
            
            group.Name = _groupModel.Name;
            group.Enabled = _groupModel.Enabled;
            group.Description = _groupModel.Description;
            group.SortOrder = _groupModel.SortOrder;
            group.Phone = StringHelper.ConvertToStandardPhone(_groupModel.Phone) == null ? null : _groupModel.Phone;
            group.Vk = _groupModel.Vk.Default(null);
            group.Facebook = _groupModel.Facebook.Default(null);
            group.Instagram = _groupModel.Instagram.Default(null);
            group.Twitter = _groupModel.Twitter.Default(null);
            group.Telegram = _groupModel.Telegram.Default(null);
            group.OkRu = _groupModel.OkRu.Default(null);
            group.Youtube = _groupModel.Youtube.Default(null);
            group.Zen = _groupModel.Zen.Default(null);
            group.Rutube = _groupModel.Rutube.Default(null);
            
            var city = _groupModel.CityId != null ? CityService.GetCity(_groupModel.CityId.Value) : null;
            if (city == null)
            {
                group.CityId = null;
                group.RegionId = null;
                group.CountryId = null;
            }
            else
            {
                var region = RegionService.GetRegion(city.RegionId);
                if (region != null)
                {
                    group.CityId = city.CityId;
                    group.RegionId = city.RegionId;
                    group.CountryId = region.CountryId;
                }
                else
                {
                    group.CityId = null;
                    group.RegionId = null;
                    group.CountryId = null;
                }
            }

            var adding = group.Id == 0;

            if (adding)
            {
                WarehouseGroupService.Add(group);
                
                AddPictureLink(_groupModel.PhotoId, group.Id);
                AddPictureLink(_groupModel.LogoId, group.Id);
            }
            else
                WarehouseGroupService.Update(group);
            
            var warehouseIds = _groupModel.WarehouseIds.IsNotEmpty()
                ? JsonConvert.DeserializeObject<List<int>>(_groupModel.WarehouseIds)
                : new List<int>();
            
            
            if (!adding)
                WarehouseGroupService.DeleteAllWarehousesFromGroup(group.Id);
            
            if (warehouseIds != null && warehouseIds.Count > 0)
            {
                var i = 10;
                foreach (var warehouseId in warehouseIds)
                {
                    WarehouseGroupService.AddWarehouseToGroup(group.Id, warehouseId, i);
                    i += 10;
                }
            }
            
            return group.Id;
        }
        
        private void AddPictureLink(int? pictureId, int id)
        {
            if (pictureId == null || pictureId == 0) 
                return;
            
            var photo = PhotoService.GetPhoto(pictureId.Value);
            if (photo != null)
                PhotoService.UpdateObjId(photo.PhotoId, id);
        }
    }
}