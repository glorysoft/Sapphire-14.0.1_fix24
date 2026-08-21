using System;
using System.Web;
using System.Web.Mvc;
using AdvantShop.Catalog;
using AdvantShop.Core;
using AdvantShop.Core.Services.Catalog.Warehouses;
using AdvantShop.Customers;
using AdvantShop.Web.Admin.Attributes;
using AdvantShop.Web.Admin.Handlers.Catalog.WarehouseGroups;
using AdvantShop.Web.Admin.Models.Catalog.WarehouseGroups;
using AdvantShop.Web.Infrastructure.Admin;
using AdvantShop.Web.Infrastructure.Filters;

namespace AdvantShop.Web.Admin.Controllers.Catalog
{
    [Auth(RoleAction.Settings)]
    [SaasFeature(Saas.ESaasProperty.HasWarehouses)]
    public sealed class WarehouseGroupsController : BaseAdminController
    {
        #region List

        public ActionResult GetWarehouseGroups(WarehouseGroupFilter model)
        {
            return Json(new GetWarehouseGroups(model).Execute());
        }

        #region Commands

        private void CommandWarehouseGroup(WarehouseGroupFilter command, Action<int, WarehouseGroupFilter> func)
        {
            if (command.SelectMode == SelectModeCommand.None)
            {
                foreach (var id in command.Ids)
                    func(id, command);
            }
            else
            {
                var ids = new GetWarehouseGroups(command).GetItemsIds();
                foreach (int id in ids)
                {
                    if (command.Ids == null || !command.Ids.Contains(id))
                        func(id, command);
                }
            }
        }

        [HttpPost, ValidateJsonAntiForgeryToken]
        public JsonResult DeleteWarehouseGroups(WarehouseGroupFilter command)
        {
            CommandWarehouseGroup(command, (id, c) => WarehouseGroupService.Delete(id));
            return JsonOk();
        }
        
        [HttpPost, ValidateJsonAntiForgeryToken]
        public JsonResult InplaceWarehouseGroup(WarehouseGroupItem model)
        {
            var group = WarehouseGroupService.Get(model.Id);

            group.Enabled = model.Enabled;
            group.SortOrder = model.SortOrder;

            WarehouseGroupService.Update(group);

            return JsonOk();
        }

        #endregion

        #endregion

        #region Add | Edit
        
        public ActionResult Add()
        {
            SetMetaInformation(T("Admin.WarehouseGroup.AddEdit.NewWarehouse"));
            
            return View("AddEdit", new GetWarehouseGroup(null).Execute());
        }

        public ActionResult Edit(int id)
        {
            var warehouseGroup = WarehouseGroupService.Get(id);
            if (warehouseGroup is null)
                return Error404();
            
            SetMetaInformation(T("Admin.WarehouseGroup.AddEdit.Title") + " " + warehouseGroup.Name);
            
            return View("AddEdit", new GetWarehouseGroup(warehouseGroup).Execute());
        }

        [HttpPost, ValidateAntiForgeryToken]
        public ActionResult AddEdit(WarehouseGroupModel model)
        {
            try
            {
                var id = new AddEditWarehouseGroup(model).Execute();

                return RedirectToAction("Edit", new { id });
            }
            catch (BlException ex)
            {
                ModelState.AddModelError(ex.Property, ex.Message);
            }

            ShowErrorMessages();
            SetMetaInformation(T("Admin.WarehouseGroup.AddEdit.Title") + " " + model.Name);
            
            return View("AddEdit", model);
        }
        
        [HttpPost, ValidateJsonAntiForgeryToken]
        public JsonResult DeleteWarehouseGroup(int id)
        {
            WarehouseGroupService.Delete(id);
            return JsonOk();
        }
        
        #region Photo & Logo pictures
        
        [HttpPost, ValidateJsonAntiForgeryToken]
        public JsonResult UploadPicture(HttpPostedFileBase file, PhotoType type, int? objId)
        {
            var result = new UploadWarehouseGroupPictures(file, type, objId).Execute();
            return result.Result
                ? JsonOk(new {picture = result.Picture, pictureId = result.PictureId})
                : JsonError(result.Error);
        }

        [HttpPost, ValidateJsonAntiForgeryToken]
        public JsonResult DeletePicture(int pictureId)
        {
            var result = new DeleteWarehouseGroupPicture(pictureId).Execute();
            return result.Result
                ? JsonOk(new {picture = result.Picture})
                : JsonError(result.Error ?? T("Admin.Catalog.ErrorDeletingImage"));
        }

        [HttpPost, ValidateJsonAntiForgeryToken]
        public JsonResult UploadPictureByLink(PhotoType type, int? objId, string fileLink)
        {
            var result = new UploadWarehouseGroupPicturesByLink(type, objId, fileLink).Execute();
            return result.Result
                ? JsonOk(new { picture = result.Picture, pictureId = result.PictureId })
                : JsonError(result.Error);
        }

        #endregion
        
        #endregion
    }
}