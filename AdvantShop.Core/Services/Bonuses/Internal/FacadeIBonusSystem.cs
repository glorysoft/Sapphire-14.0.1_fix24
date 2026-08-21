using AdvantShop.Customers;

namespace AdvantShop.Core.Services.Bonuses.Internal
{
    public partial class FacadeIBonusSystem : IBonusSystem
    {
        public bool IsActive => InternalBonusSystem.IsEnabled;
        
        public float GetApplyBonuses(IPurchase purchase, Customer customer) 
            => InternalBonusSystemService.GetApplyBonuses(purchase, customer);

        public float GetAccrueBonuses(IPurchase purchase, Customer customer) 
            => InternalBonusSystemService.GetAccrueBonuses(purchase, customer);

        public (float?, bool?) GetAccrueBonuses(string purchaseNumber)
            => InternalBonusSystemService.GetAccrueBonuses(purchaseNumber);

        public void OnPurchase(IPurchase purchase, Customer customer) 
            => InternalBonusSystemService.OnPurchase(purchase, customer);

        public void OnChangePurchase(IPurchase purchase) 
            => InternalBonusSystemService.OnChangePurchase(purchase);

        public bool ConfirmPurchase(IPurchase purchase) 
            => InternalBonusSystemService.ConfirmPurchase(purchase);

        public bool UnConfirmPurchase(IPurchase purchase) 
            => InternalBonusSystemService.UnConfirmPurchase(purchase);

        public bool RollbackPurchase(IPurchase purchase) 
            => InternalBonusSystemService.RollbackPurchase(purchase);

        public bool RestorePurchase(IPurchase purchase) 
            => InternalBonusSystemService.RestorePurchase(purchase);

        public bool CanChangeApplyBonuses(string purchaseNumber)
            => InternalBonusSystemService.CanChangeApplyBonuses(purchaseNumber);

        public void OnDeletePurchase(IPurchase purchase) 
            => InternalBonusSystemService.OnDeletePurchase(purchase);

    }
}