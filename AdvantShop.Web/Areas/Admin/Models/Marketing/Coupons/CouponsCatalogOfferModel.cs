using AdvantShop.Web.Admin.Models.Catalog;
using Newtonsoft.Json;

namespace AdvantShop.Web.Admin.Models.Marketing.Coupons
{
    public class CouponsCatalogOfferModel : CatalogOfferModel
    {
        [JsonProperty(Order = 100)]
        public int CouponId { get; set; }
        
        [JsonProperty(Order = 101)]
        public bool ApplyCoupon { get; set; }
    }
}