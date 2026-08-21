using AdvantShop.Core;
using AdvantShop.Core.Modules;
using AdvantShop.Core.Services.Localization;
using AdvantShop.Core.Services.SalesChannels;
using AdvantShop.Web.Infrastructure.Handlers;

namespace AdvantShop.Web.Admin.Handlers.Modules
{
    public class UninstallModuleHandler : ICommandHandler
    {
        private readonly string _stringId;

        public UninstallModuleHandler(string stringId)
        {
            _stringId = stringId;
        }
        
        public void Execute()
        {
            if (!ModulesService.IsAliveRemoteServer())
                throw new BlException(LocalizationService.GetResource("Admin.Modules.UninstallModule.RemoteServerError"));
            
            var channel = SalesChannelService.GetByType(ESalesChannelType.Module, _stringId);

            if (channel != null && channel.ShowInstalledAndPreview)
                SalesChannelService.SetNotShowInstalled(_stringId, true);
            
            var result = ModulesService.UninstallModule(_stringId);

            if (!string.IsNullOrWhiteSpace(result))
                throw new BlException(result);
        }
    }
}