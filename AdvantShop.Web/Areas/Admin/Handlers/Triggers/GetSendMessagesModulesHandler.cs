using System;
using System.Collections.Generic;
using System.Linq;
using AdvantShop.Core.Modules;
using AdvantShop.Core.Modules.Interfaces;
using AdvantShop.Web.Infrastructure.Handlers;

namespace AdvantShop.Web.Admin.Handlers.Triggers
{
    public class GetSendMessagesModulesHandler : ICommandHandler<Dictionary<string, string>>
    {
        private List<Type> _moduleTypes = AttachedModules.GetModules<IMessengerService>();
        private Dictionary<string, string> _modules = new Dictionary<string, string>();
        
        public Dictionary<string, string> Execute()
        {
            if (_moduleTypes == null || _moduleTypes.Count == 0)
                return _modules;
            
            foreach (var module in 
                     _moduleTypes.Select(type => (IMessengerService)Activator.CreateInstance(type)))
                _modules.Add(module.ModuleStringId, module.ModuleName);

            return _modules;
        }
    }
}