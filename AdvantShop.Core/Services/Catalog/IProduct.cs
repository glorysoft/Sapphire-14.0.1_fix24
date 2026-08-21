using System.Collections.Generic;
using AdvantShop.Catalog;
using AdvantShop.Core.Services.Taxes;
using AdvantShop.Repository.Currencies;
using AdvantShop.SEO;

namespace AdvantShop.Core.Services.Catalog
{
    public interface IProduct
    {
        int ProductId { get; set; }
        
        string ArtNo { get; set; }
        
        string Name { get; set; }
        
        double Ratio { get; set; }

        double? ManualRatio { get; set; }

        Discount Discount { get; set; }
        
        bool DoNotApplyOtherDiscounts { get; set; }
        
        string BriefDescription { get; set; }
        
        string Description { get; set; }
        
        bool Enabled { get; set; }

        bool Hidden { get; set; }

        bool Recomended { get; set; }

        bool New { get; set; }

        bool BestSeller { get; set; }

        bool OnSale { get; set; }

        bool AllowPreOrder { get; set; }

        bool CategoryEnabled { get; set; }

        int? UnitId { get; set; }
        
        Unit Unit { get; }

        float? ShippingPrice { get; set; }

        float? MinAmount { get; set; }

        float? MaxAmount { get; set; }

        float Multiplicity { get; set; }

        string ModifiedBy { get; set; }
        
        string CreatedBy { get; set; }        

        bool ActiveView360 { get; set; }
        
        string DownloadLink { get; set; }

        bool AccrueBonuses { get; set; }
        
        int? TaxId { get; set; }

        ePaymentSubjectType PaymentSubjectType { get; set; }

        ePaymentMethodType PaymentMethodType { get; set; }

        int BrandId { get; set; }

        Brand Brand { get; }
        
        string UrlPath { get; set; }

        bool IsMarkingRequired { get; set; }
        
        bool IsDigital { get; set; }

        bool HasMultiOffer { get; set; }

        bool HasGifts();

        int CurrencyID { get; set; }

        Currency Currency { get; }

        string Comment { get; set; }

        SizeChart SizeChart { get; set; }

        List<Offer> Offers { get; set; }

        MetaType MetaType { get; }

        MetaInfo Meta { get; set; }
        
        int CategoryId { get; }
        
        Category MainCategory { get; }

        List<Category> ProductCategories { get; }

        int? RatioCount { get; }

        List<ProductPhoto> ProductPhotos { get; }

        List<ProductPhoto> ProductPhotos360 { get; }

        List<ProductVideo> ProductVideos { get; }

        List<PropertyValue> ProductPropertyValues { get; }
        
        List<Tag> Tags { get; }
        
        ProductExportOptions ExportOptions { get; }
    }
}