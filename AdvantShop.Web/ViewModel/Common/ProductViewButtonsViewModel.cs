using System.Web;
using AdvantShop.Core.Services.Catalog;

namespace AdvantShop.ViewCommon
{
    public class ProductViewButtonsViewModel
    {
        public ProductItem Product { get; set; }
        public string ProductUrl { get; set; }
        public IHtmlString LinkOrQuickViewTrigger { get; set; }
        public string BtnContent { get; set; }
        public string ChooseBtnContent { get; set; }
        public string PreOrderButtonText { get; set; }
        public bool ShowBuyButton { get; set; }
        public bool ShowPreOrderButton { get; set; }
        public bool IsAvailableForPurchase { get; set; }
        public bool IsMobile { get; set; } = false;
    }
}