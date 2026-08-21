using System.Collections.Generic;
using AdvantShop.Core.Common.Attributes;

namespace AdvantShop.Core.Services.Catalog
{
    public class PriceRule
    {
        public int Id { get; set; }
        
        public string Name { get; set; }
                
        /// <summary>
        /// Режим применения: от количества или от суммы корзины
        /// </summary>
        public PriceRuleMode Mode { get; set; }

        public int SortOrder { get; set; }

        public float Amount { get; set; }
        
        private List<int> _customerGroupIds;
        public List<int> CustomerGroupIds
        {
            get => _customerGroupIds ?? (_customerGroupIds = PriceRuleService.GetCustomerGroupIds(Id));
            set => _customerGroupIds = value ?? new List<int>();
        }

        public int? PaymentMethodId { get; set; }
        public int? ShippingMethodId { get; set; }

        private List<int> _warehouseIds;
        public List<int> WarehouseIds
        {
            get => _warehouseIds ?? (_warehouseIds = PriceRuleService.GetWarehouseIds(Id));
            set => _warehouseIds = value ?? new List<int>();
        }

        public bool ApplyDiscounts { get; set; }
        
        /// <summary>
        /// Рассчитывать цену автоматически
        /// </summary>
        public bool CalculatePriceAutomatically { get; set; }
        
        public PriceRuleTypeCalculationPriceMode? CalculationPriceMode { get; set; }
        
        /// <summary>
        /// Наценка в процентах
        /// </summary>
        public float MarkupPercentage { get; set; }
        
        /// <summary>
        /// Наценка в валюте
        /// </summary>
        public float MarkupAmount { get; set; }
        
        public bool Enabled { get; set; }

        /// <summary>
        /// Порог суммы корзины (для типа "От суммы корзины")
        /// </summary>
        public float CartSum { get; set; }
    }

    public enum PriceRuleMode : byte
    {
        [Localize("Core.Services.Catalog.PriceRuleMode.ByQuantity")]
        ByQuantity = 0,

        [Localize("Core.Services.Catalog.PriceRuleMode.ByCartSum")]
        ByCartSum = 1
    }

    public enum PriceRuleTypeCalculationPriceMode : byte
    {
        [Localize("Core.Services.Catalog.PriceRuleTypeCalculationPriceMode.OfferPrice")]
        OfferPrice = 0,
        
        [Localize("Core.Services.Catalog.PriceRuleTypeCalculationPriceMode.SupplyPrice")]
        SupplyPrice = 1
    }
    

    public class OfferPriceRule
    {
        public int OfferId { get; set; }

        public int PriceRuleId { get; set; }

        public float? PriceByRule { get; set; }

        public string Name { get; set; }

        public float Amount { get; set; }
        
        private List<int> _customerGroupIds;
        public List<int> CustomerGroupIds  => 
            _customerGroupIds ?? (_customerGroupIds = PriceRuleService.GetCustomerGroupIdsCached(PriceRuleId));

        public int? PaymentMethodId { get; set; }
        
        public int? ShippingMethodId { get; set; }
        
        private List<int> _warehouseIds;
        public List<int> WarehouseIds  => 
            _warehouseIds ?? (_warehouseIds = PriceRuleService.GetWarehouseIdsCached(PriceRuleId));

        public bool ApplyDiscounts { get; set; }

        public int SortOrder { get; set; }

        public PriceRuleMode Mode { get; set; }

        public float CartSum { get; set; }
    }
}
