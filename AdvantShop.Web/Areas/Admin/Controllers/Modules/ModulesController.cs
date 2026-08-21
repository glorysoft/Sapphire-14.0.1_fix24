using System;
using System.Web.Mvc;
using AdvantShop.Core.Modules;
using AdvantShop.Customers;
using AdvantShop.Web.Admin.Handlers.Modules;
using AdvantShop.Web.Admin.Models.Modules;
using AdvantShop.Web.Infrastructure.Controllers;
using AdvantShop.Web.Infrastructure.Filters;
using System.Collections.Generic;
using AdvantShop.Web.Admin.Attributes;
using AdvantShop.Configuration;
using AdvantShop.Core;
using AdvantShop.Diagnostics;
using AdvantShop.Web.Admin.Controllers.Shared;

namespace AdvantShop.Web.Admin.Controllers.Modules
{
    [Auth(RoleAction.Modules)]
    public class ModulesController : BaseAdminController
    {
        public ActionResult Index(ModulesFilterModel filter, bool force = false)
        {
            if (!ModulesService.IsAliveRemoteServer())
                return RedirectToAction(nameof(Unavailable));
            
            if (!force && !ModulesHandler.IsExistInstallModules())
                return RedirectToAction(nameof(Market));

            if (!string.IsNullOrEmpty(filter.Name))
            {
                var model = new ModulesHandler().GetLocalModules(filter);
                if (model.Count == 0)
                    return RedirectToAction(nameof(Market), new { name = filter.Name });

                if (model.Count == 1)
                    return RedirectToAction(nameof(Details), new { id = model[0].StringId});
            }

            SetMetaInformation(T("Admin.Modules.Index.Title"));
            SetNgController(NgControllers.NgControllersTypes.ModulesCtrl);

            return View(new ModulesModel());
        }

        public ActionResult Unavailable()
        {
            if (ModulesService.IsAliveRemoteServer())
                return RedirectToAction(nameof(Index));
            
            SetMetaInformation(T("Admin.Modules.Unavailable.Title"));
            SetNgController(NgControllers.NgControllersTypes.ModulesCtrl);
            
            return View();
        }

        [HttpGet]
        public JsonResult GetLocalModules(ModulesFilterModel filter) =>
            ProcessJsonResult(new GetLocalModulesHandler(filter));

        [HttpGet]
        public JsonResult GetMarketModules(ModulesFilterModel filter) =>
            JsonOk(new ModulesHandler().GetMarketModules(filter));

        [Auth(RoleAction.InstallModules)]
        public ActionResult Market(ModulesFilterModel filter = null)
        {
            if (!ModulesService.IsAliveRemoteServer())
                return RedirectToAction(nameof(Unavailable));
            
            SetMetaInformation(T("Admin.Modules.Market.Title"));
            SetNgController(NgControllers.NgControllersTypes.ModulesCtrl);

            return View();
        }

        [HttpGet]
        public ActionResult Details(string id)
        {
            try
            {
                var model = new ModuleDetailsHandler(id).Execute();
                
                SetMetaInformation(T("Admin.Modules.Details.Title", model.Module.Name));
                SetNgController(NgControllers.NgControllersTypes.ModuleCtrl);
                
                if (model.Module.IsMobileAdminReady)
                    return View(model);
                
                SettingsDesign.IsMobileTemplate = false;
                return View("~/areas/admin/views/modules/details.cshtml", model);
            }
            catch (UnauthorizedAccessException)
            {
                return (ViewResult)new ServiceController().RoleAccessIsDenied(id);
            }
            catch (BlException exception) when (exception.Message.Equals("Need redirect to preview"))
            {
                return RedirectToAction(nameof(Preview), new { id });
            }
            catch (BlException)
            {
                return RedirectToAction(nameof(Index));
            }
            catch (Exception exception)
            {
                Debug.Log.Error(exception.Message, exception);
                return RedirectToAction(nameof(Index));
            }
        }

        [SkipRoleFiltering]
        public ActionResult Preview(string id)
        {
            if (string.IsNullOrWhiteSpace(id))
                return RedirectToAction(nameof(Index));

            var module = new ModulesHandler().GetModule(id);
            if (module == null)
                return RedirectToAction(nameof(Index));

            if (module.ShowInstalledAndPreviewInSalesChannel &&
                AttachedModules.GetModuleById(id) != null && ModulesRepository.IsInstallModule(id))
            {
                return RedirectToAction(nameof(Details), new { id });
            }

            var model = new PreviewModuleModel
            {
                ModuleName = module.Name,
                ModuleStringId = module.StringId,
                ModuleId = module.Id,
                ModuleVersion = module.Version,
                PreviewLeftText = module.PreviewLeftTextInSalesChannel,
                PreviewRightText = module.PreviewRightTextInSalesChannel,
                PreviewButtonText = module.PreviewButtonTextInSalesChannel,
                ShowInstalledAndPreview = module.ShowInstalledAndPreviewInSalesChannel,
                PriceString = module.PriceString
            };

            SetMetaInformation(T("Admin.Modules.Details.Title", module.Name));
            SetNgController(NgControllers.NgControllersTypes.ModulesCtrl);

            return View(model);
        }

        #region Install, update, uninstall, enable module
        
        [HttpPost, ValidateJsonAntiForgeryToken, Auth(RoleAction.InstallModules)]
        public JsonResult InstallModule(string stringId, string id, string version, bool? active = null) =>
            ProcessJsonResult(new InstallModuleHandler(stringId, id, version, active));

        [Auth(RoleAction.InstallModules)]
        public ActionResult InstallModuleInDb(
            string stringId, 
            string id, 
            string version, 
            bool? active = null, 
            bool? notRedirect = null
        )
        {
            var moduleInst = AttachedModules.GetModuleById(stringId);
            if (moduleInst != null)
            {
                ModulesService.InstallModule(stringId, version);

                if (active != null && active.Value)
                    ModulesRepository.SetActiveModule(stringId, true);

                if (notRedirect is true)
                    return JsonOk();
            }
            
            return notRedirect is true
                ? (ActionResult)JsonError()
                : RedirectToAction(nameof(Details), new { id = stringId });
        }
        
        [HttpPost, ValidateJsonAntiForgeryToken, Auth(RoleAction.UpdateModules)]
        public JsonResult UpdateModule(string stringId, string id, string version) =>
            ProcessJsonResult(new UpdateModuleHandler(stringId, id, version));

        [Auth(RoleAction.UpdateModules)]
        [HttpPost, ValidateJsonAntiForgeryToken]
        public JsonResult UpdateAllModules(List<Module> modules) =>
            ProcessJsonResult(new UpdateAllModulesHandler(Server));

        [HttpPost, ValidateJsonAntiForgeryToken]
        public JsonResult ChangeEnabled(string stringId, bool enabled) =>
            ProcessJsonResult(new ChangeEnabledHandler(stringId, enabled));
        
        [HttpPost, ValidateJsonAntiForgeryToken, Auth(RoleAction.DeleteModules)]
        public JsonResult UninstallModule(string stringId) =>
            ProcessJsonResult(new UninstallModuleHandler(stringId));

        #endregion

        [HttpPost, ValidateJsonAntiForgeryToken]
        public JsonResult IsInstallModule(string stringId) =>
            Json(ModulesRepository.IsInstallModule(stringId));

        [HttpPost, ValidateJsonAntiForgeryToken]
        public JsonResult SetPreviewShowed(string stringId) =>
            ProcessJsonResult(new SetPreviewShowedHandler(stringId));
    }
}