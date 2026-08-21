using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using AdvantShop.Catalog;
using AdvantShop.Core.Caching;
using AdvantShop.Core.Primitives;
using AdvantShop.Core.Services.Catalog.Warehouses;
using AdvantShop.Core.Services.Localization;
using AdvantShop.Core.SQL;
using AdvantShop.Customers;
using AdvantShop.Repository.Currencies;
using AdvantShop.Saas;

namespace AdvantShop.Core.Services.Catalog
{
    public class PriceRuleService
    {
        private const string PriceRulesCacheKey = "PriceRules";
        private const string PriceRulesCustomerGroupIdsCacheKey = PriceRulesCacheKey + "{0}_CustomerGroupIds";
        private const string PriceRulesWarehouseIdsCacheKey = PriceRulesCacheKey + "{0}_WarehouseIds";

        public static bool IsActive() => 
            !SaasDataService.IsSaasEnabled || SaasDataService.CurrentSaasData.PriceTypes;

        #region Price rule

        public static List<PriceRule> GetList(
            bool onlyEnabled = true, 
            bool onlyCalculatePriceAutomatically = false)
        {
            var where = new List<string>();
            
            if (onlyEnabled)
                where.Add("Enabled = 1 ");
            
            if (onlyCalculatePriceAutomatically)
                where.Add("CalculatePriceAutomatically = 1 ");
            
            return CacheManager.Get(PriceRulesCacheKey + "_List_" + where.GetHashCode(), 60,
                () => SQLDataAccess.Query<PriceRule>(
                        "Select * From [Catalog].[PriceRule] " +
                        (where.Count > 0 ? "Where " + string.Join(" and ", where) : "") +
                        "Order by SortOrder")
                    .ToList());
        }

        public static PriceRule Get(int id)
        {
            return SQLDataAccess
                .Query<PriceRule>("Select * From [Catalog].[PriceRule] Where Id=@id", new {id})
                .FirstOrDefault();
        }

        public static Result<int> Add(PriceRule rule)
        {
            if (SaasDataService.IsSaasEnabled && SaasDataService.CurrentSaasData.PriceTypes &&
                GetList().Count >= SaasDataService.CurrentSaasData.PriceTypesAmount)
            {
                return Result.Failure<int>(new Error(LocalizationService.GetResourceFormat(
                    "Core.PriceRule.PriceRulesLimit", SaasDataService.CurrentSaasData.PriceTypesAmount)));
            }

            rule.Id = SQLDataAccess.ExecuteScalar<int>(
                @"INSERT INTO Catalog.PriceRule (
                       Name,
                       SortOrder,
                       Amount,
                       PaymentMethodId,
                       ShippingMethodId,
                       ApplyDiscounts,
                       Enabled,
                       CalculatePriceAutomatically,
                       CalculationPriceMode,
                       MarkupPercentage,
                       MarkupAmount,
                       Mode,
                       CartSum
                       )
                VALUES (
                        @Name,
                        @SortOrder,
                        @Amount,
                        @PaymentMethodId,
                        @ShippingMethodId,
                        @ApplyDiscounts,
                        @Enabled,
                        @CalculatePriceAutomatically,
                        @CalculationPriceMode,
                        @MarkupPercentage,
                        @MarkupAmount,
                        @Mode,
                        @CartSum
                        );
                SELECT scope_identity();",
                CommandType.Text,
                new SqlParameter("@Name", rule.Name),
                new SqlParameter("@SortOrder", rule.SortOrder),
                new SqlParameter("@Amount", rule.Amount),
                new SqlParameter("@PaymentMethodId", rule.PaymentMethodId ?? (object)DBNull.Value),
                new SqlParameter("@ShippingMethodId", rule.ShippingMethodId ?? (object)DBNull.Value),
                new SqlParameter("@ApplyDiscounts", rule.ApplyDiscounts),
                new SqlParameter("@CalculatePriceAutomatically", rule.CalculatePriceAutomatically),
                new SqlParameter("@CalculationPriceMode",
                    rule.CalculatePriceAutomatically && rule.CalculationPriceMode != null
                        ? rule.CalculationPriceMode
                        : (object)DBNull.Value),
                new SqlParameter("@MarkupPercentage", rule.MarkupPercentage),
                new SqlParameter("@MarkupAmount", rule.MarkupAmount),
                new SqlParameter("@Enabled", rule.Enabled),
                new SqlParameter("@Mode", (byte)rule.Mode),
                new SqlParameter("@CartSum", rule.CartSum));
            
            AddUpdateCustomerGroupIds(rule.Id, rule.CustomerGroupIds);
            AddUpdateWarehouseIds(rule.Id, rule.WarehouseIds);
            
            CacheManager.RemoveByPattern(PriceRulesCacheKey);
            CacheManager.RemoveByPattern(CacheNames.SQLPagingItems);

            return rule.Id;
        }

        public static Result Update(PriceRule rule)
        {
            if (rule.Enabled && 
                SaasDataService.IsSaasEnabled && SaasDataService.CurrentSaasData.PriceTypes &&
                GetList().Count > SaasDataService.CurrentSaasData.PriceTypesAmount)
            {
                return Result.Failure(new Error(LocalizationService.GetResourceFormat(
                    "Core.PriceRule.PriceRulesLimit", SaasDataService.CurrentSaasData.PriceTypesAmount)));
            }
            
            SQLDataAccess.ExecuteNonQuery(
                @"UPDATE Catalog.PriceRule
                SET Name                        = @Name,
                    SortOrder                   = @SortOrder,
                    Amount                      = @Amount,
                    PaymentMethodId             = @PaymentMethodId,
                    ShippingMethodId            = @ShippingMethodId,
                    ApplyDiscounts              = @ApplyDiscounts,
                    Enabled                     = @Enabled,
                    CalculatePriceAutomatically = @CalculatePriceAutomatically,
                    CalculationPriceMode        = @CalculationPriceMode,
                    MarkupPercentage            = @MarkupPercentage,
                    MarkupAmount                = @MarkupAmount,
                    Mode                        = @Mode,
                    CartSum                     = @CartSum
                WHERE Id = @Id",
                CommandType.Text,
                new SqlParameter("@Id", rule.Id),
                new SqlParameter("@Name", rule.Name),
                new SqlParameter("@SortOrder", rule.SortOrder),
                new SqlParameter("@Amount", rule.Amount),
                new SqlParameter("@PaymentMethodId", rule.PaymentMethodId ?? (object)DBNull.Value),
                new SqlParameter("@ShippingMethodId", rule.ShippingMethodId ?? (object)DBNull.Value),
                new SqlParameter("@ApplyDiscounts", rule.ApplyDiscounts),
                new SqlParameter("@CalculatePriceAutomatically", rule.CalculatePriceAutomatically),
                new SqlParameter("@CalculationPriceMode",
                    rule.CalculatePriceAutomatically && rule.CalculationPriceMode != null
                        ? rule.CalculationPriceMode
                        : (object)DBNull.Value),
                new SqlParameter("@MarkupPercentage", rule.MarkupPercentage),
                new SqlParameter("@MarkupAmount", rule.MarkupAmount),
                new SqlParameter("@Enabled", rule.Enabled),
                new SqlParameter("@Mode", (byte)rule.Mode),
                new SqlParameter("@CartSum", rule.CartSum));
            
            AddUpdateCustomerGroupIds(rule.Id, rule.CustomerGroupIds);
            AddUpdateWarehouseIds(rule.Id, rule.WarehouseIds);

            CacheManager.RemoveByPattern(PriceRulesCacheKey);
            CacheManager.RemoveByPattern(CacheNames.SQLPagingItems);

            return Result.Success();
        }

        public static void Delete(int id)
        {
            SQLDataAccess.ExecuteNonQuery("Delete From [Catalog].[PriceRule] Where Id=@Id", CommandType.Text, new SqlParameter("@Id", id));

            CacheManager.RemoveByPattern(PriceRulesCacheKey);
            CacheManager.RemoveByPattern(CacheNames.SQLPagingItems);
        }

        public static bool IsUsed(int id)
        {
            return SQLDataAccess.ExecuteScalar<int>(
                       "if exists (Select 1 From [Catalog].[OfferPriceRule] Where PriceRuleId=@id and PriceByRule is not null) Select 1 Else Select 0",
                       CommandType.Text, new SqlParameter("@id", id)
                       ) == 1;
        }

        public static void Deactivate()
        {
            SQLDataAccess.ExecuteNonQuery("Update [Catalog].[PriceRule] Set Enabled = 0", CommandType.Text);
            
            CacheManager.RemoveByPattern(PriceRulesCacheKey);
            CacheManager.RemoveByPattern(CacheNames.SQLPagingItems);
        }

        #region PriceRule CustomerGroupIds

        public static void AddUpdateCustomerGroupIds(int priceRuleId, List<int> customerGroupIds)
        {
            if (customerGroupIds == null)
                customerGroupIds = new List<int>();
            
            var oldCustomerGroupIds = GetCustomerGroupIds(priceRuleId);

            if (oldCustomerGroupIds.Count == customerGroupIds.Count &&
                oldCustomerGroupIds.OrderBy(x => x).SequenceEqual(customerGroupIds.OrderBy(x => x)))
            {
                return;
            }

            if (oldCustomerGroupIds.Count > 0)
                DeleteCustomerGroupIds(priceRuleId);
            
            foreach (var customerGroupId in customerGroupIds)
                AddCustomerGroupId(priceRuleId, customerGroupId);
            
            CacheManager.RemoveByPattern(string.Format(PriceRulesCustomerGroupIdsCacheKey, priceRuleId));
        }
        
        private static void AddCustomerGroupId(int priceRuleId, int customerGroupId)
        {
            SQLDataAccess.ExecuteNonQuery(
                "Insert Into [Catalog].[PriceRule_CustomerGroup] (PriceRuleId, CustomerGroupId) Values (@PriceRuleId, @CustomerGroupId)",
                CommandType.Text,
                new SqlParameter("@PriceRuleId", priceRuleId),
                new SqlParameter("@CustomerGroupId", customerGroupId));
        }
        
        private static void DeleteCustomerGroupIds(int priceRuleId)
        {
            SQLDataAccess.ExecuteNonQuery(
                "Delete From [Catalog].[PriceRule_CustomerGroup] Where PriceRuleId=@PriceRuleId",
                CommandType.Text,
                new SqlParameter("@PriceRuleId", priceRuleId));
        }

        public static List<int> GetCustomerGroupIdsCached(int priceRuleId)
        {
            return CacheManager.Get(
                string.Format(PriceRulesCustomerGroupIdsCacheKey, priceRuleId),
                () => GetCustomerGroupIds(priceRuleId));
        }
        
        public static List<int> GetCustomerGroupIds(int priceRuleId)
        {
            return SQLDataAccess
                .Query<int>(
                    "Select CustomerGroupId From [Catalog].[PriceRule_CustomerGroup] Where PriceRuleId=@priceRuleId",
                    new {priceRuleId})
                .ToList();
        }

        #endregion
        
        #region PriceRule WarehouseIds
        
        public static void AddUpdateWarehouseIds(int priceRuleId, List<int> warehouseIds)
        {
            if (warehouseIds == null)
                warehouseIds = new List<int>();
            
            var oldWarehouseIds = GetWarehouseIds(priceRuleId);

            if (oldWarehouseIds.Count == warehouseIds.Count &&
                oldWarehouseIds.OrderBy(x => x).SequenceEqual(warehouseIds.OrderBy(x => x)))
            {
                return;
            }

            if (oldWarehouseIds.Count > 0)
                DeleteWarehouseIds(priceRuleId);
            
            foreach (var warehouseId in warehouseIds)
                AddWarehouseId(priceRuleId, warehouseId);
            
            CacheManager.RemoveByPattern(string.Format(PriceRulesWarehouseIdsCacheKey, priceRuleId));
        }
        
        private static void AddWarehouseId(int priceRuleId, int warehouseId)
        {
            SQLDataAccess.ExecuteNonQuery(
                "Insert Into [Catalog].[PriceRule_Warehouse] (PriceRuleId, WarehouseId) Values (@PriceRuleId, @WarehouseId)",
                CommandType.Text,
                new SqlParameter("@PriceRuleId", priceRuleId),
                new SqlParameter("@WarehouseId", warehouseId));
        }
        
        private static void DeleteWarehouseIds(int priceRuleId)
        {
            SQLDataAccess.ExecuteNonQuery(
                "Delete From [Catalog].[PriceRule_Warehouse] Where PriceRuleId=@PriceRuleId",
                CommandType.Text,
                new SqlParameter("@PriceRuleId", priceRuleId));
        }
        
        public static List<int> GetWarehouseIdsCached(int priceRuleId)
        {
            return CacheManager.Get(
                string.Format(PriceRulesWarehouseIdsCacheKey, priceRuleId),
                () => GetWarehouseIds(priceRuleId));
        }
        
        public static List<int> GetWarehouseIds(int priceRuleId)
        {
            return SQLDataAccess
                .Query<int>(
                    "Select WarehouseId From [Catalog].[PriceRule_Warehouse] Where PriceRuleId=@priceRuleId",
                    new {priceRuleId})
                .ToList();
        }
        
        #endregion

        #endregion

        public static List<OfferPriceRule> GetOfferPriceRuleModels(int offerId, bool onlyEnabled = true)
        {
            var offerPriceRules = SQLDataAccess.Query<OfferPriceRule>(
                    "Select OfferId, Id as PriceRuleId, PriceByRule , Name " +
                    "From [Catalog].[PriceRule] " +
                    "Left Join [Catalog].[OfferPriceRule] On [PriceRule].[Id] = [OfferPriceRule].[PriceRuleId] and [OfferPriceRule].[OfferId] = @offerId " +
                    (onlyEnabled ? "Where [PriceRule].[Enabled] = 1" : "") +
                    "Order by [PriceRule].SortOrder",
                    new { offerId })
                .ToList();

            foreach (var item in offerPriceRules)
                item.OfferId = offerId;

            return offerPriceRules;
        }

        public static List<OfferPriceRule> GetOfferPriceRules(int offerId, bool onlyEnabled = true, bool? onlyWithPrice = null, PriceRuleMode? mode = null)
        {
            if (!IsActive())
                return new List<OfferPriceRule>();
            
            var cacheKey = $"{PriceRulesCacheKey}{offerId}_{onlyEnabled}{(onlyWithPrice != null ? "_" + onlyWithPrice : "")}{(mode != null ? "_" + mode : "")}";

            var rules =
                CacheManager.Get(cacheKey, () =>
                    SQLDataAccess
                        .Query<OfferPriceRule>(
                            @"SELECT * 
                                FROM [Catalog].[OfferPriceRule] opr
                                INNER JOIN [Catalog].[PriceRule] ON [PriceRule].[Id] = opr.PriceRuleId
                                WHERE opr.OfferId = @offerId " +
                            (onlyWithPrice != null && onlyWithPrice.Value ? "and opr.PriceByRule is not null " : "") +
                            (onlyEnabled ? "and [PriceRule].[Enabled] = 1 " : "") +
                            (mode != null ? "and [PriceRule].[Mode] = @mode " : "") +
                            "Order by [PriceRule].[SortOrder]",
                            new
                            {
                                offerId, 
                                mode = mode != null ? (int)mode : default(int?)
                            })
                        .ToList().AsReadOnly());

            var offerPriceRules = new List<OfferPriceRule>(rules);
            
            if (mode == PriceRuleMode.ByQuantity)
            {
                var rulesAuto = GetOfferPriceRulesByCalculatePriceAutomatically(offerId);
                if (rulesAuto.Count > 0)
                {
                    foreach (var rule in rulesAuto)
                    {
                        var offerPriceRule = offerPriceRules.Find(x => x.PriceRuleId == rule.PriceRuleId);

                        if (offerPriceRule == null)
                            offerPriceRules.Add(rule);
                        else
                        {
                            // если не задана цена для типа цены, то удаляем его и добавляем автоматический расчет
                            if (offerPriceRule.PriceByRule == null)
                            {
                                offerPriceRules.Remove(offerPriceRule);
                                offerPriceRules.Add(rule);
                            }
                        }
                    }
                }
            }

            return offerPriceRules.Count > 1 
                ? offerPriceRules.OrderBy(x => x.SortOrder).ToList() 
                : offerPriceRules;
        }
        
        /// <summary>
        /// Получить типы цен для модификации, которые рассчитываются автоматически
        /// </summary>
        public static IReadOnlyList<OfferPriceRule> GetOfferPriceRulesByCalculatePriceAutomatically(int offerId)
        {
            return CacheManager.Get(PriceRulesCacheKey + offerId + "_CalculatePriceAutomatically", () =>
            {
                var rulesCalculatePriceAutomatically = GetList(true, true);
                if (rulesCalculatePriceAutomatically.Count == 0)
                    return new List<OfferPriceRule>();
                
                var offer = OfferService.GetOffer(offerId);
                if (offer == null)
                    return new List<OfferPriceRule>();
                
                var offerPriceRules = new List<OfferPriceRule>();

                foreach (var rule in rulesCalculatePriceAutomatically)
                {
                    var offerPriceRule = new OfferPriceRule
                    {
                        PriceRuleId = rule.Id,
                        Name = rule.Name,
                        Amount = rule.Amount,
                        OfferId = offerId,
                        PaymentMethodId = rule.PaymentMethodId,
                        ShippingMethodId = rule.ShippingMethodId,
                        ApplyDiscounts = rule.ApplyDiscounts,
                        SortOrder = rule.SortOrder,
                        PriceByRule = CalculatePriceAutoPriceRule(rule, offer.BasePrice, offer.SupplyPrice)
                    };

                    offerPriceRules.Add(offerPriceRule);
                }

                return offerPriceRules;
            });
        }

        /// <summary>
        /// Рассчитать цену для типа цен, который автоматически рассчитывает
        /// </summary>
        public static float CalculatePriceAutoPriceRule(PriceRule rule, float basePrice, float supplyPrice)
        {
            var price =
                rule.CalculationPriceMode == PriceRuleTypeCalculationPriceMode.OfferPrice
                    ? basePrice
                    : supplyPrice;

            var priceByRule =
                price + (price / 100 * rule.MarkupPercentage) + rule.MarkupAmount;
            
            return priceByRule;
        }
        
        public static void AddUpdateOfferPriceRule(int offerId, int priceRuleId, float? price)
        {
            SQLDataAccess.ExecuteNonQuery(
                @"UPDATE [Catalog].[OfferPriceRule] WITH (UPDLOCK, SERIALIZABLE)
                SET PriceByRule = @PriceByRule
                WHERE OfferId = @OfferId
                  AND PriceRuleId = @PriceRuleId;

                IF @@ROWCOUNT = 0
                    BEGIN
                        INSERT INTO [Catalog].[OfferPriceRule] (OfferId, PriceRuleId, PriceByRule)
                        VALUES (@OfferId, @PriceRuleId, @PriceByRule);
                    END",
                CommandType.Text,
                new SqlParameter("@OfferId", offerId),
                new SqlParameter("@PriceRuleId", priceRuleId),
                new SqlParameter("@PriceByRule", price ?? (object) DBNull.Value)
            );

            CacheManager.RemoveByPattern(PriceRulesCacheKey + offerId);
        }
        
        public static OfferPriceRule GetPriceRule(
            int offerId, 
            float amount, 
            int customerGroupId,
            int? paymentMethodId = null, 
            int? shippingMethodId = null,
            int? warehouseId = null)
        {
            if (!IsPriceRulesExists(PriceRuleMode.ByQuantity))
                return null;
            
            var rules = GetOfferPriceRules(offerId, onlyWithPrice: true, mode: PriceRuleMode.ByQuantity);
            if (rules.Count == 0)
                return null;

            var id = PriceRulesContext.CurrentPriceRuleId;
            if (id != null)
            {
                var rule = rules.FirstOrDefault(r => r.PriceRuleId == id);
                if (rule != null)
                    return rule;
            }

            if (warehouseId == null)
                warehouseId = WarehouseContext.CurrentWarehouseIds?.FirstOrDefault();

            var offerPriceRule =
                rules
                    // в начале проверяем более полные совпадения
                    .OrderByDescending(rule => rule.PaymentMethodId.HasValue && rule.ShippingMethodId.HasValue)
                    .ThenByDescending(rule => rule.PaymentMethodId.HasValue || rule.ShippingMethodId.HasValue)
                    // в начале проверяем с большим количеством (для max. выгоды)
                    .ThenByDescending(rule => rule.Amount)
                    .FirstOrDefault(rule =>
                        rule.CustomerGroupIds.Contains(customerGroupId)
                        && rule.Amount <= amount
                        && (!rule.PaymentMethodId.HasValue || rule.PaymentMethodId == paymentMethodId)
                        && (!rule.ShippingMethodId.HasValue || rule.ShippingMethodId == shippingMethodId)
                        && RuleByWarehouseApplied(rule, warehouseId, offerId, amount)
                        && rule.PriceByRule != null);

            return offerPriceRule?.PriceByRule != null ? offerPriceRule : null;
        }
        
        public static OfferPriceRule GetNextPriceRule(
            int offerId, 
            float amount, 
            int customerGroupId,
            int? paymentMethodId = null, 
            int? shippingMethodId = null,
            int? warehouseId = null)
        {
            if (!IsPriceRulesExists(PriceRuleMode.ByQuantity))
                return null;
            
            var rules = GetOfferPriceRules(offerId, onlyWithPrice: true, mode: PriceRuleMode.ByQuantity);
            
            if (rules.Count == 0)
                return null;
            
            if (warehouseId == null)
                warehouseId = WarehouseContext.CurrentWarehouseIds?.FirstOrDefault();

            var offerPriceRule =
                rules
                    // в начале проверяем более полные совпадения
                    .OrderByDescending(rule => rule.PaymentMethodId.HasValue && rule.ShippingMethodId.HasValue)
                    .ThenByDescending(rule => rule.PaymentMethodId.HasValue || rule.ShippingMethodId.HasValue)
                    //
                    .ThenBy(rule => rule.Amount)
                    .FirstOrDefault(rule =>
                        rule.CustomerGroupIds.Contains(customerGroupId)
                        && rule.Amount > amount
                        && (!rule.PaymentMethodId.HasValue || rule.PaymentMethodId == paymentMethodId)
                        && (!rule.ShippingMethodId.HasValue || rule.ShippingMethodId == shippingMethodId)
                        && RuleByWarehouseApplied(rule, warehouseId, offerId, amount)
                        && rule.PriceByRule != null);

            return offerPriceRule;
        }
        
        public static OfferPriceRule GetNextPriceRuleByCartSum(
            int offerId, 
            float cartSum)
        {
            if (!IsPriceRulesExists(PriceRuleMode.ByCartSum))
                return null;
            
            var rules = GetOfferPriceRules(offerId, onlyWithPrice: true, mode: PriceRuleMode.ByCartSum);
            if (rules.Count == 0)
                return null;

            var offerPriceRule =
                rules
                    .OrderBy(rule => rule.CartSum)
                    .FirstOrDefault(rule => rule.CartSum > cartSum 
                                            && rule.PriceByRule != null);

            return offerPriceRule;
        }

        public static List<OfferPriceRule> GetAmountList(int offerId, int customerGroupId)
        {
            var rules = GetOfferPriceRules(offerId, onlyWithPrice: true, mode: PriceRuleMode.ByQuantity);
            if (rules.Count == 0)
                return null;

            return rules.OrderBy(rule => rule.Amount)
                        .Where(rule =>
                             rule.CustomerGroupIds.Contains(customerGroupId)
                             && rule.PaymentMethodId is null
                             && rule.ShippingMethodId is null
                             && rule.WarehouseIds.Count == 0
                             && rule.PriceByRule != null)
                        .ToList();
        }

        public static bool IsPriceRulesExists(PriceRuleMode mode)
        {
            return CacheManager.Get(PriceRulesCacheKey + "_IsPriceRulesByCartSumExists_" + (byte)mode, 60, () =>
                SQLDataAccess.ExecuteScalar<bool>(
                    "IF EXISTS (SELECT 1 FROM [Catalog].[PriceRule] WHERE Mode = @mode and Enabled = 1) SELECT 1 ELSE SELECT 0",
                    new { mode = (byte)mode })
            );
        }

        public static List<OfferPriceRule> GetCartSumAmountList(int offerId)
        {
            var rules = GetOfferPriceRules(offerId, onlyWithPrice: true, mode: PriceRuleMode.ByCartSum);
            if (rules.Count == 0)
                return null;

            return rules.OrderBy(rule => rule.CartSum)
                        .Where(rule => rule.PriceByRule != null)
                        .ToList();
        }

        /// <summary>
        /// Получить тип цены "От суммы корзины" для оффера
        /// </summary>
        public static OfferPriceRule GetPriceRuleByCartSum(
            int offerId,
            float cartSum)
        {
            var rules = GetOfferPriceRules(offerId, onlyWithPrice: true, mode: PriceRuleMode.ByCartSum);
            if (rules.Count == 0)
                return null;

            var offerPriceRule =
                rules
                    .OrderByDescending(rule => rule.CartSum)
                    .FirstOrDefault(rule => rule.CartSum <= cartSum 
                                            && rule.PriceByRule != null);

            return offerPriceRule;
        }

        private static bool RuleByWarehouseApplied(OfferPriceRule rule, int? warehouseId, int offerId, float amount)
        {
            // если в правиле нет складов, то оно подходит
            if (rule.WarehouseIds.Count == 0)
                return true;
            
            // если склад не был выбран, а в правиле есть склады, то не подходит
            if (warehouseId == null || !rule.WarehouseIds.Contains(warehouseId.Value))
                return false;

            var stock = WarehouseStocksService.Get(offerId, warehouseId.Value);

            return stock != null && rule.Amount <= stock.Quantity && amount <= stock.Quantity;
        }

        public static List<PriceRuleAmountListItem> GetPriceRuleAmountListItems(int offerId, Product product, CustomerGroup customerGroup)
        {
            return GetPriceRuleAmountListItems(
                offerId, 
                product.ProductId,
                customerGroup, 
                product.Multiplicity, 
                product.Currency.Rate,
                product.Discount,
                product.DoNotApplyOtherDiscounts,
                product.CategoryId);
        }
        
        public static List<PriceRuleAmountListItem> GetPriceRuleAmountListItems(ProductItem product, CustomerGroup customerGroup)
        {
            return GetPriceRuleAmountListItems(
                product.OfferId, 
                product.ProductId,
                customerGroup,
                product.Multiplicity != 0 ? product.Multiplicity : 1, 
                product.CurrencyValue,
                new Discount(product.Discount, product.DiscountAmount),
                product.DoNotApplyOtherDiscounts,
                product.MainCategoryId);
        }
        
        public static List<PriceRuleAmountListItem> GetPriceRuleAmountListItems(int offerId, 
                                                                                int productId,
                                                                                CustomerGroup customerGroup, 
                                                                                float multiplicity, 
                                                                                float productCurrencyRate,
                                                                                Discount discount,
                                                                                bool doNotApplyOtherDiscounts,
                                                                                int? mainCategoryId)
        {
            var priceRules = GetAmountList(offerId, customerGroup.CustomerGroupId);
                
            if (priceRules == null || priceRules.Count == 0)
                return null; 
            
            if (priceRules.Count == 1 && priceRules[0].Amount == 0) // 1 тип цен, и у этого типа цен кол-во "0 и более"
                return null; 
         
            if (priceRules.Count == 1 && priceRules[0].Amount > 0 && priceRules[0].Amount <= multiplicity) // 1 тип цен и клиенту всегда будет показываться он
                return null;
            
            var items = new List<PriceRuleAmountListItem>();
            
            for (var i = 0; i < priceRules.Count; i++)
            {
                if (priceRules[i].PriceByRule == null)
                    continue;
                
                string to;

                if (i + 1 == priceRules.Count)
                {
                    to = LocalizationService.GetResource("Catalog.AmountTable.More");
                }
                else
                {
                    var div = priceRules[i + 1].Amount % multiplicity;
                    if (div == 0)
                    {
                        to = priceRules[i].Amount != priceRules[i + 1].Amount - multiplicity
                            ? " - " + (priceRules[i + 1].Amount - multiplicity)
                            : "";
                    }
                    else
                    {
                        var toValue = Math.Round(((int) (priceRules[i + 1].Amount / multiplicity)) * multiplicity, 3);
                        to = " - " + toValue;
                    }
                }

                var price = priceRules[i].PriceByRule.Value;

                if (priceRules[i].ApplyDiscounts)
                {
                    var finalDiscount =
                        PriceService.GetFinalDiscount(price, discount,
                            productCurrencyRate, customerGroup, productId,
                            doNotApplyOtherDiscounts: doNotApplyOtherDiscounts,
                            productMainCategoryId: mainCategoryId);

                    price = PriceService.GetFinalPrice(price, finalDiscount);
                }
                
                items.Add(new PriceRuleAmountListItem()
                {
                    Amount = priceRules[i].Amount + to,
                    Price = price.RoundAndFormatPrice(CurrencyService.CurrentCurrency, productCurrencyRate)
                });
            }

            return items;
        }
        

        [Obsolete("will be removed in future version")]
        public static List<PriceRuleAmountListItem> GetPriceRuleAmountListItems(int offerId, 
                                                                                int customerGroupId, 
                                                                                float multiplicity, 
                                                                                float productCurrencyRate)
        {
            var priceRules = GetAmountList(offerId, customerGroupId);
                
            if (priceRules == null || priceRules.Count == 0)
                return null; 
            
            if (priceRules.Count == 1 && priceRules[0].Amount == 0) // 1 тип цен, и у этого типа цен кол-во "0 и более"
                return null; 
         
            if (priceRules.Count == 1 && priceRules[0].Amount > 0 && priceRules[0].Amount <= multiplicity) // 1 тип цен и клиенту всегда будет показываться он
                return null;
            
            var items = new List<PriceRuleAmountListItem>();
            
            for (var i = 0; i < priceRules.Count; i++)
            {
                if (priceRules[i].PriceByRule == null)
                    continue;
                
                string to;

                if (i + 1 == priceRules.Count)
                {
                    to = LocalizationService.GetResource("Catalog.AmountTable.More");
                }
                else
                {
                    var div = priceRules[i + 1].Amount % multiplicity;
                    if (div == 0)
                    {
                        to = priceRules[i].Amount != priceRules[i + 1].Amount - multiplicity
                            ? " - " + (priceRules[i + 1].Amount - multiplicity)
                            : "";
                    }
                    else
                    {
                        var toValue = Math.Round(((int) (priceRules[i + 1].Amount / multiplicity)) * multiplicity, 3);
                        to = " - " + toValue;
                    }
                }

                var price = priceRules[i].PriceByRule.Value;
                
                items.Add(new PriceRuleAmountListItem()
                {
                    Amount = priceRules[i].Amount + to,
                    Price = price.RoundAndFormatPrice(CurrencyService.CurrentCurrency, productCurrencyRate)
                });
            }

            return items;
        }

        #region CartSum Amount List Items

        public static List<PriceRuleAmountListItem> GetPriceRuleCartSumAmountListItems(int offerId, Product product)
        {
            return GetPriceRuleCartSumAmountListItems(
                offerId,
                product.ProductId,
                product.Currency.Rate,
                product.Discount,
                product.DoNotApplyOtherDiscounts,
                product.CategoryId);
        }

        public static List<PriceRuleAmountListItem> GetPriceRuleCartSumAmountListItems(
            int offerId,
            int productId,
            float productCurrencyRate,
            Discount discount,
            bool doNotApplyOtherDiscounts,
            int? mainCategoryId)
        {
            if (!IsPriceRulesExists(PriceRuleMode.ByCartSum))
                return null;
            
            var priceRules = GetCartSumAmountList(offerId);

            if (priceRules == null || priceRules.Count == 0)
                return null;

            var customerGroup = CustomerContext.CurrentCustomer.CustomerGroup;

            var items = new List<PriceRuleAmountListItem>();

            for (var i = 0; i < priceRules.Count; i++)
            {
                if (priceRules[i].PriceByRule == null)
                    continue;

                var cartSumFormatted = LocalizationService.GetResourceFormat(
                    "Catalog.CartSumAmountTable.From",
                    priceRules[i].CartSum.FormatPrice());

                var price = priceRules[i].PriceByRule.Value;

                if (priceRules[i].ApplyDiscounts)
                {
                    var finalDiscount =
                        PriceService.GetFinalDiscount(price, discount,
                            productCurrencyRate, customerGroup, productId,
                            doNotApplyOtherDiscounts: doNotApplyOtherDiscounts,
                            productMainCategoryId: mainCategoryId);

                    price = PriceService.GetFinalPrice(price, finalDiscount);
                }

                items.Add(new PriceRuleAmountListItem()
                {
                    Amount = cartSumFormatted,
                    Price = price.RoundAndFormatPrice(CurrencyService.CurrentCurrency, productCurrencyRate)
                });
            }

            return items;
        }

        #endregion
    }
}
