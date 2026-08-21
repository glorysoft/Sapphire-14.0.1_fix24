using AdvantShop.Orders;

namespace AdvantShop.ViewModel.Checkout
{
    public class CheckoutSuccess
    {
        public string OrderSuccessTopText { get; set; } 

        public string SuccessScript { get; set; }

        public string GoogleAnalyticsString { get; set; }

        public Order Order { get; set; }
        
        public float? NewBonusAmount { get; set; }
        public bool IsInternalBonusSystem { get; set; }
        public string BonusCardNumber { get; set; }

        public bool IsEmptyLayout { get; set; }

        public bool IsLanding { get; set; }
    }
}