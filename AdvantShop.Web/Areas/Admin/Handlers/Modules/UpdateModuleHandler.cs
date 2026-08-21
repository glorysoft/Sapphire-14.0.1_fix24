using System.Linq;
using System.Web;
using AdvantShop.Core;
using AdvantShop.Core.Modules;
using AdvantShop.Core.Services.Localization;
using AdvantShop.Diagnostics;
using AdvantShop.Web.Infrastructure.Handlers;

namespace AdvantShop.Web.Admin.Handlers.Modules
{
    public sealed class UpdateModuleHandler : ICommandHandler
    {
        private readonly string _stringId;
        private readonly string _id;
        private readonly string _version;
        private readonly ModulesHandler _modulesHandler;

        public UpdateModuleHandler(
            string stringId,
            string id,
            string version
        )
        {
            _stringId = stringId;
            _id = id;
            _version = version;
            _modulesHandler = new ModulesHandler();
        }

        public void Execute()
        {
            if (!ModulesService.IsAliveRemoteServer())
                throw new BlException(LocalizationService.GetResource("Admin.Modules.UpdateModule.RemoteServerError"));
            
            var module = _modulesHandler.GetModule(_stringId);
            Validate(module);

            ModulesRepository.SetModuleNeedUpdate(_stringId, true);

            var message = ModulesService.GetModuleArchiveFromRemoteServer(_id, update: true);

            if (!string.IsNullOrWhiteSpace(message))
                throw new BlException(message);

            ModulesService.InstallModule(_stringId.ToLower(), _version, false);

            HttpRuntime.UnloadAppDomain();
        }

        private void Validate(Module module)
        {
            if (module == null)
                throw new BlException(
                    LocalizationService.GetResource("Admin.Modules.UpdateModule.NotExistModuleError")
                );

            var localizations = LocalizationService.GetResourcesByPrefix("Admin.Core.Modules.ModuleInDebug");

            // Проверка в продакшене, что капа доступна и можно обновлять модуль. За исключением ситуаций, когда модуль
            // уже со статусом "В режиме отладки".
#if !DEBUG
            if (localizations.Any(localization => localization.Value.Equals(module.Version)))
                return;

            if (localizations.Any(localization => localization.Value.Equals(_version))
                && !ModulesService.IsAliveRemoteServer())
            {
                Debug.Log.Error(
                    $"In the process of updating the module \"{_stringId}\", remote server was unavailable"
                );
                throw new BlException(LocalizationService.GetResource("Admin.Modules.UpdateModule.RemoteServerError"));
            }
#endif
        }
    }
}