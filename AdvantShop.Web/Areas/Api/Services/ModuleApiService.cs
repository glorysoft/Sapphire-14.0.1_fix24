using System;
using System.Collections.Generic;
using AdvantShop.Areas.Api.Models.ModuleWidgets;
using AdvantShop.Core.Modules;
using AdvantShop.Core.Modules.Interfaces;

namespace AdvantShop.Areas.Api.Services
{
    public sealed class ModuleApiService
    {
        public List<ModuleWidget> GetWidgets(ModuleMobileAppWidgetEndpoint endpoint, IEntity entity)
        {
            var moduleWidgets = new List<ModuleWidget>();
            
            foreach (var type in AttachedModules.GetModules<IModuleMobileAppWidgets>())
            {
                var module = (IModuleMobileAppWidgets)Activator.CreateInstance(type);
                var widgets = module.GetMobileAppWidgets(endpoint, entity);
                
                if (widgets == null ||  widgets.Count == 0)
                    continue;
                
                moduleWidgets.Add(new ModuleWidget(((IModule)module).ModuleStringId, widgets));
            }
            
            return moduleWidgets.Count > 0 ? moduleWidgets : null;
        }
    }
}