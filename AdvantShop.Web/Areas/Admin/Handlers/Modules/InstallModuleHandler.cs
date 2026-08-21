using System.Web;
using System.Web.Mvc;
using AdvantShop.Core;
using AdvantShop.Core.Modules;
using AdvantShop.Core.Services.Localization;
using AdvantShop.Web.Infrastructure.Extensions;
using AdvantShop.Web.Infrastructure.Handlers;

namespace AdvantShop.Web.Admin.Handlers.Modules
{
    public sealed class InstallModuleHandler : ICommandHandler<string>
    {
        private readonly string _stringId;
        private readonly string _id;
        private readonly string _version;
        private readonly bool? _active;
        private readonly UrlHelper _urlHelper;

        public InstallModuleHandler(
            string stringId,
            string id,
            string version,
            bool? active
        )
        {
            _stringId = stringId;
            _id = id;
            _version = version;
            _active = active;
            _urlHelper = new UrlHelper(HttpContext.Current.Request.RequestContext);
        }

        public string Execute()
        {
            if (!ModulesService.IsAliveRemoteServer())
                throw new BlException(LocalizationService.GetResource("Admin.Modules.InstallModule.RemoteServerError"));
            
            if (string.IsNullOrWhiteSpace(_stringId)
                || string.IsNullOrWhiteSpace(_id)
                || string.IsNullOrWhiteSpace(_version))
                throw new BlException(LocalizationService.GetResource("Admin.Modules.InstallModule.InvalidParams"));

            Track.TrackService.TrackEvent(Track.ETrackEvent.Shop_Modules_ModuleInstalled, _stringId);

            var moduleInst = AttachedModules.GetModuleById(_stringId);
            if (moduleInst != null)
            {
                ModulesService.InstallModule(_stringId, _version);

                if (_active != null && _active.Value)
                    ModulesRepository.SetActiveModule(_stringId, true);

                return _urlHelper.AbsoluteActionUrl(
                    "Details", 
                    "Modules", 
                    new { id = _stringId }
                );
            }

            ModulesRepository.SetModuleNeedUpdate(_stringId, true);

            var message = ModulesService.GetModuleArchiveFromRemoteServer(_id);
            if (!string.IsNullOrWhiteSpace(message)) throw new BlException(message);
            
            HttpRuntime.UnloadAppDomain();

            HttpContext.Current.ApplicationInstance.CompleteRequest();

            return _urlHelper.AbsoluteActionUrl(
                "InstallModuleInDb", 
                "Modules",
                new
                {
                    stringId = _stringId, 
                    id = _id, 
                    version = _version, 
                    active = _active,
                }
            );
        }
    }
}