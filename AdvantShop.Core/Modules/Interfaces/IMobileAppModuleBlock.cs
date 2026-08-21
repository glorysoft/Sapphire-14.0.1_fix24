using System.Collections.Generic;

namespace AdvantShop.Core.Modules.Interfaces
{
    public interface IModuleMobileAppWidgets
    {
        IList<IModuleMobileAppWidget> GetMobileAppWidgets(ModuleMobileAppWidgetEndpoint endpoint, IEntity entity);
    }
    
    public interface IModuleMobileAppWidget
    {
        string Key { get; }
        IModuleMobileAppWidgetData Data { get; }
    }

    public interface IModuleMobileAppWidgetData
    {
        
    }

    public enum ModuleMobileAppWidgetEndpoint
    {
        Product = 0,
        Category = 1,
        Init = 2,
    }

    public sealed class ModuleMobileAppWidgetKeys
    {
        public class Product
        {
            private const string Prefix = "product_"; 
            
            public const string BeforePrice = Prefix + "before_price";
            public const string AfterPrice = Prefix + "after_price";
            public const string BeforeDescription = Prefix + "before_description";
            public const string AfterDescription = Prefix + "after_description";
        }

        public class Category
        {
            private const string Prefix = "category_"; 
            
            public const string BeforeProducts = Prefix + "before_products";
            public const string AfterProducts = Prefix + "after_products";
        }
    }
}