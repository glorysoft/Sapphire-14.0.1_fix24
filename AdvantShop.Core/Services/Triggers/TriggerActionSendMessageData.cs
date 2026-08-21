using System;
using System.Collections.Generic;
using System.Linq;
using AdvantShop.Core.Modules;
using AdvantShop.Core.Modules.Interfaces;
using Newtonsoft.Json;

namespace AdvantShop.Core.Services.Triggers
{
    public class TriggerActionSendMessageData
    {
        public List<string> ModuleNames { get; set; }

        public TriggerActionSendMessageData()
        {
            ModuleNames = new List<string>();
        }
        
        public TriggerActionSendMessageData(string jsonData)
        {
            var data = JsonConvert.DeserializeObject<TriggerActionSendMessageData>(jsonData);

            if (data.ModuleNames == null || data.ModuleNames.Count == 0)
            {
                ModuleNames = new List<string>();
                return;
            }
            
            ModuleNames = data.ModuleNames;
            
            var moduleTypes = AttachedModules.GetModules<IMessengerService>();

            if (moduleTypes == null || moduleTypes.Count == 0)
            {
                ModuleNames = new List<string>();
                return;
            }

            var modules = moduleTypes
                .Select(type =>((IMessengerService)Activator.CreateInstance(type)).ModuleName)
                .ToList();

            foreach (var moduleName in ModuleNames.Where(moduleName => !modules.Contains(moduleName)))
                ModuleNames.Remove(moduleName);
        }
    }
}