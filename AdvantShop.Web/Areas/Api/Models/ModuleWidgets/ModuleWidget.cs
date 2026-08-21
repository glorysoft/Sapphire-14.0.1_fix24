using System.Collections.Generic;
using AdvantShop.Core.Modules.Interfaces;

namespace AdvantShop.Areas.Api.Models.ModuleWidgets
{
    public sealed class ModuleWidget
    {
        public string Name { get; }
        public IList<IModuleMobileAppWidget> Items { get; }

        public ModuleWidget(string moduleName, IList<IModuleMobileAppWidget> widgets)
        {
            Name = moduleName;
            Items = widgets;
        }
    }
}