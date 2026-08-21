using System;
using System.IO;
using System.Linq;
using System.Web;
using AdvantShop.Core;
using AdvantShop.Core.Common.Extensions;
using AdvantShop.Core.Modules;
using AdvantShop.Core.Services.Localization;
using AdvantShop.Diagnostics;
using AdvantShop.Web.Infrastructure.Handlers;

namespace AdvantShop.Web.Admin.Handlers.Modules
{
    public class UpdateAllModulesHandler : ICommandHandler
    {
        private readonly HttpServerUtilityBase _server;

        public UpdateAllModulesHandler(HttpServerUtilityBase server)
        {
            _server = server;
        }
        
        public void Execute()
        {
            if (!ModulesService.IsAliveRemoteServer())
                throw new BlException(LocalizationService.GetResource("Admin.Modules.UpdateAllModules.RemoteServerError"));
            
            var tempPath = _server.MapPath("~/App_Data/TempModules");
            
            Helpers.FileHelpers.CreateDirectory(tempPath);

            var modulesList = ModulesService.GetModules().Items.Where(module => module.IsInstall).ToList();

            foreach (var module in modulesList.Where(module => !module.IsLocalVersion 
                                                               && !module.IsCustomVersion 
                                                               && module.Version != module.CurrentVersion))
            {
                ModulesRepository.SetModuleNeedUpdate(module.StringId, true);

                var message = ModulesService.GetModuleArchiveFromRemoteServer(
                    module.Id.ToString(), 
                    tempPath, 
                    true
                );
                
                if (!message.IsNullOrEmpty())
                    module.IsInstall = false;
            }

            var path = "";
            try
            {
                foreach (var file in 
                         Directory.GetFiles(tempPath, "*", SearchOption.AllDirectories)
                             .OrderByDescending(filePath => filePath))
                {
                    var newFile = file.Replace("App_Data\\TempModules\\", "");
                    Helpers.FileHelpers.DeleteFile(newFile);

                    var fi = new FileInfo(newFile);
                    Helpers.FileHelpers.CreateDirectory(fi.DirectoryName);

                    File.Move(file, newFile);
                }

                Directory.Delete(tempPath, true);

                foreach (var module in modulesList.Where(m=> m.IsInstall))
                    ModulesService.InstallModule(module.StringId.ToLower(), module.Version, false);
            }
            catch (Exception ex)
            {
                Debug.Log.Error(path, ex);
                throw new BlException("Error while updating modules");
            }

            HttpRuntime.UnloadAppDomain();
        }
    }
}