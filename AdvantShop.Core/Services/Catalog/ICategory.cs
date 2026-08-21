using System.Collections.Generic;
using AdvantShop.Catalog;
using AdvantShop.SEO;

namespace AdvantShop.Core.Services.Catalog
{
    interface ICategory
    {
        int CategoryId { get; set; }

        string ExternalId { get; set; }

        string Name { get; set; }

        string Description { get; set; }

        string BriefDescription { get; set; }

        bool Enabled { get; set; }

        bool Hidden { get; set; }

        bool HasChild { get; set; }

        int SortOrder { get; set; }

        int ProductsCount { get; set; }
        
        int TotalProductsCount { get; set; }

        int ParentCategoryId { get; set; }

        ECategoryDisplayStyle DisplayStyle { get; set; }

        bool DisplayChildProducts { get; set; }

        bool DisplayBrandsInMenu { get; set; }

        bool DisplaySubCategoriesInMenu { get; set; }

        bool ParentsEnabled { get; set; }

        ESortOrder Sorting { get; set; }

        ECategoryAutomapAction AutomapAction { get; set; }

        int Available_Products_Count { get; set; }
        
        int Current_Products_Count { get; set; }

        CategoryPhoto Picture { get; set; }

        CategoryPhoto MiniPicture { get; set; }

        CategoryPhoto Icon { get; set; }

        Category ParentCategory { get; }
        
        string UrlPath { get; set; }

        MetaType MetaType { get; }

        MetaInfo Meta { get; set; }

        List<Tag> Tags { get; set; }

        string ModifiedBy { get; set; }

        bool ShowOnMainPage { get; set; }

        SizeChart SizeChart { get; set; }
    }
}