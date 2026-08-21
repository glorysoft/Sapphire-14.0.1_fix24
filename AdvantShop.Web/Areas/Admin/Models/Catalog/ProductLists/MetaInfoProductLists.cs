using AdvantShop.SEO;

namespace AdvantShop.Web.Admin.Models.Catalog.ProductLists
{
    public sealed class MetaInfoProductLists
    {
        public int MetaId { get; set; }
        public int ObjId { get; set; }
        public MetaType Type { get; set; }
        public string Title { get; set; }
        public string MetaKeywords { get; set; }
        public string MetaDescription { get; set; }
        public string H1 { get; set; }
        public bool IsDefaultMeta { get; set; }
    }
}