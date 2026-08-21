using System;
using System.Linq;
using AdvantShop.Configuration;
using AdvantShop.Core;
using AdvantShop.Core.Modules;
using AdvantShop.Core.Modules.Interfaces;
using AdvantShop.Core.Services.Localization;
using AdvantShop.Customers;
using AdvantShop.Web.Admin.Models.Modules;
using AdvantShop.Web.Infrastructure.Handlers;

namespace AdvantShop.Web.Admin.Handlers.Modules
{
    public sealed class ModuleDetailsHandler : ICommandHandler<DetailsModel>
    {
        private const string InstructionUrlTemplate = "{0}?v={1}&moduleversion={2}";
        
        private readonly string _moduleId;
        private DetailsModel _model;

        public ModuleDetailsHandler(string moduleId)
        {
            _moduleId = moduleId;
        }
        
        public DetailsModel Execute()
        {
            
            Validate();
            GetModel();
            SetSettings();
            SetInstruction();
            
            return _model;
        }

        private void Validate()
        {
            if (string.IsNullOrWhiteSpace(_moduleId))
                throw new BlException("Module Id is empty");
            
            if (!CustomerContext.CurrentCustomer.IsAdmin
                && !RoleActionService.GetRoleActionsKeysByCustomerId(CustomerContext.CurrentCustomer.Id)
                    .Any(key => key.Equals(_moduleId, StringComparison.OrdinalIgnoreCase)))
                throw new UnauthorizedAccessException("Access denied");
        }

        private void GetModel()
        {
            var module = new ModulesHandler().GetModule(_moduleId);
            if (module == null)
                throw new BlException("Module is empty");
            
            if (!module.ShowInstalledAndPreviewInSalesChannel 
                && module.ShowPreview 
                && !ModulesRepository.IsPreviewShowed(_moduleId))
                throw new BlException("Need redirect to preview");
            
            _model = new DetailsModel { Module = module };
        }

        private void SetSettings()
        {
            var moduleType = AttachedModules.GetModuleById(_model.Module.StringId);
            var moduleInstance = moduleType != null ? Activator.CreateInstance(moduleType) : null;

            if (moduleInstance == null)
                throw new BlException("Module instance is empty");

            if (moduleInstance is IAdminModuleSettings settings 
                && settings.AdminSettings != null 
                && settings.AdminSettings.Count > 0)
                _model.Settings = settings.AdminSettings;
        }

        private void SetInstruction()
        {
            var moduleFromServer = ModulesService.GetModuleObjectFromRemoteServer(_model.Module.StringId);
            
            if (moduleFromServer != null && !string.IsNullOrWhiteSpace(moduleFromServer.InstructionLink))
            {
                _model.InstructionTitle = string.IsNullOrWhiteSpace(moduleFromServer.InstructionTitle)
                    ? LocalizationService.GetResource("Admin.Modules.Details.DefaultInstructionTitle")
                    : moduleFromServer.InstructionTitle;
                
                _model.InstructionUrl = string.Format(
                    InstructionUrlTemplate,
                    moduleFromServer.InstructionLink, 
                    SettingsGeneral.SiteVersionDev, 
                    moduleFromServer.Version
                );
            }
        }
    }
}