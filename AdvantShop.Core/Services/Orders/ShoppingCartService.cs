//--------------------------------------------------
// Project: AdvantShop.NET
// Web site: http:\\www.advantshop.net
//--------------------------------------------------

using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Web;
using AdvantShop.Catalog;
using AdvantShop.Configuration;
using AdvantShop.Core.Common.Extensions;
using AdvantShop.Core.Modules;
using AdvantShop.Core.Modules.Interfaces;
using AdvantShop.Core.Services.Bonuses.Internal;
using AdvantShop.Core.Services.Catalog;
using AdvantShop.Core.Services.Catalog.Warehouses;
using AdvantShop.Core.Services.Customers;
using AdvantShop.Core.Services.Localization;
using AdvantShop.Core.Services.Partners;
using AdvantShop.Core.Services.Shop;
using AdvantShop.Core.SQL;
using AdvantShop.Customers;
using AdvantShop.Helpers;

namespace AdvantShop.Orders
{
    public enum ShoppingCartType
    {
        /// <summary>
        /// Shopping cart
        /// </summary>
        ShoppingCart = 1,

        /// <summary>
        /// Wishlist
        /// </summary>
        Wishlist = 2,

        /// <summary>
        /// Compare product
        /// </summary>
        Compare = 3
    }

    public static class ShoppingCartService
    {
        private const string ShoppingCartContextKey = "ShoppingCartContext";

        public static ShoppingCart CurrentShoppingCart => GetShoppingCart(ShoppingCartType.ShoppingCart);

        public static ShoppingCart CurrentCompare => GetShoppingCart(ShoppingCartType.Compare);

        public static ShoppingCart CurrentWishlist => GetShoppingCart(ShoppingCartType.Wishlist);
        
        public static ShoppingCart GetShoppingCart(
            ShoppingCartType cartType, 
            bool fromContext = true, 
            int? paymentId = null, 
            int? shippingId = null,
            List<DiscountByTime> discountsByDateTime = null)
        {
            if (HttpContext.Current != null && fromContext)
            {
                if (HttpContext.Current.Items[ShoppingCartContextKey + cartType] is ShoppingCart cachedCart) 
                    return cachedCart;
            }

            var cart = GetShoppingCartFromDb(cartType, CustomerContext.CustomerId, true, paymentId, shippingId, discountsByDateTime);

            if (cart != null && cart.Count > 0 && cartType == ShoppingCartType.ShoppingCart)
            {
                CouponService.RefreshCouponProducts(cart);
                
                ProductGiftService.RefreshGiftsInCart(cart);
                
                PartnerService.ApplyPartnerCoupon();

                var modules = AttachedModules.GetModuleInstances<IShoppingCart>();
                if (modules != null && modules.Count != 0)
                {
                    foreach (var module in modules)
                        module.UpdateCart(cart);
                }
            }

            if (cart != null && HttpContext.Current != null)
            {
                HttpContext.Current.Items[ShoppingCartContextKey + cartType] = cart;
            }

            return cart;
        }

        public static ShoppingCart GetShoppingCartFromDb(
            ShoppingCartType shoppingCartType, 
            Guid customerId,
            int? paymentId = null, 
            int? shippingId = null, 
            List<DiscountByTime> discountsByDateTime = null)
        {
            return GetShoppingCartFromDb(shoppingCartType, customerId, true, paymentId, shippingId, discountsByDateTime);
        }

        public static ShoppingCart GetShoppingCartFromDb(
            ShoppingCartType shoppingCartType, 
            Guid customerId,
            bool useCurrentCustomer, 
            int? paymentId = null,
            int? shippingId = null, 
            List<DiscountByTime> discountsByDateTime = null)
        {
            var customer =
                useCurrentCustomer
                    ? CustomerContext.CurrentCustomer
                    : CustomerService.GetCustomer(customerId)
                      ?? new Customer(CustomerGroupService.DefaultCustomerGroup)
                      {
                          Id = customerId,
                          CustomerRole = Role.Guest
                      };
            
            var cartItems = GetShoppingCartItems(shoppingCartType, customerId);

            foreach (var cartItem in cartItems)
                cartItem
                    .WithCustomer(customer)
                    .WithPriceRule(paymentId, shippingId)
                    .WithDiscountByDateTime(discountsByDateTime);

            var cart = new ShoppingCart(customer, cartItems);

            if (shoppingCartType == ShoppingCartType.ShoppingCart)
                ApplyPriceRuleByCartSum(cart);

            return cart;
        }

        public static List<ShoppingCartItem> GetShoppingCartItems(
            ShoppingCartType shoppingCartType,
            Guid customerId
        )
        {
            if (CustomerContext.IsCartUntouched)
                return new List<ShoppingCartItem>();
            
            return SQLDataAccess.ExecuteReadList(
                "SELECT * FROM Catalog.ShoppingCart WHERE ShoppingCartType = @ShoppingCartType and CustomerId = @CustomerId",
                CommandType.Text,
                GetFromReader,
                new SqlParameter("@ShoppingCartType", (int)shoppingCartType),
                new SqlParameter("@CustomerId", customerId));
        }

        public static ShoppingCart GetAllShoppingCarts(Guid customerId)
        {
            var shoppingCart = new ShoppingCart();

            foreach (ShoppingCartType shoppingCartType in Enum.GetValues(typeof(ShoppingCartType)))
            {
                shoppingCart.AddRange(GetShoppingCartFromDb(shoppingCartType, customerId));
            }

            return shoppingCart;
        }

        public static int AddShoppingCartItem(ShoppingCartItem item, bool useModule = true)
        {
            return AddShoppingCartItem(item, CustomerContext.CustomerId, useModule);
        }

        public static int AddShoppingCartItem(ShoppingCartItem item, Guid customerId, bool useModule = true)
        {
            var shoppingcartItemId = 0;
            item.CustomerId = customerId;

            var shoppingCartItem = GetExistsShoppingCartItem(customerId, item.OfferId, item.AttributesXml, item.ShoppingCartType, item.IsGift, item.ModuleKey, item.IsByCoupon);
            if (shoppingCartItem != null)
            {
                if (!shoppingCartItem.IsGift && !shoppingCartItem.IsByCoupon)
                {
                    shoppingCartItem.Amount += item.Amount;
                    UpdateShoppingCartItem(shoppingCartItem, useModule);
                    shoppingcartItemId = shoppingCartItem.ShoppingCartItemId;
                    useModule = false;
                }
            }
            else
            {
                InsertShoppingCartItem(item);
                shoppingcartItemId = item.ShoppingCartItemId;
            }

            if (HttpContext.Current != null)
                HttpContext.Current.Items[ShoppingCartContextKey + item.ShoppingCartType] = null;

            CustomerContext.DeleteCartUntouchedCookie();

            if (useModule)
            {
                foreach (var moduleShoppingCart in AttachedModules.GetModules<IShoppingCart>())
                {
                    var instance = (IShoppingCart) Activator.CreateInstance(moduleShoppingCart, null);
                    instance.AddToCart(item);
                }
            }

            return shoppingcartItemId;
        }

        public static void AddShoppingCartItems(string products)
        {
            if (string.IsNullOrWhiteSpace(products))
                return;

            foreach (var item in products.Split(";"))
            {
                int offerId;
                var newItem = new ShoppingCartItem() { CustomerId = CustomerContext.CustomerId };

                var parts = item.Split("-");
                if (parts.Length > 0 && (offerId = parts[0].TryParseInt(0)) != 0 && OfferService.GetOffer(offerId) != null)
                {
                    newItem.OfferId = offerId;
                }
                else
                {
                    continue;
                }

                newItem.Amount = parts.Length > 1 ? parts[1].TryParseFloat() : 1;

                var currentItem = ShoppingCartService.CurrentShoppingCart.FirstOrDefault(shpCartitem => shpCartitem.OfferId == newItem.OfferId);
                if (currentItem != null)
                {
                    currentItem.Amount = newItem.Amount;
                    UpdateShoppingCartItem(currentItem);
                }
                else
                {
                    AddShoppingCartItem(newItem);
                }
            }
        }

        public static ShoppingCartItem GetExistsShoppingCartItem(Guid customerId, int offerId, string attributesXml, ShoppingCartType shoppingCartType, bool isGift, string moduleKey, bool isByCoupon = false)
        {
            return
                SQLDataAccess.ExecuteReadOne(
                    "SELECT TOP 1 * FROM [Catalog].[ShoppingCart] WHERE [CustomerId] = @CustomerId  AND [OfferId] = @OfferId AND [ShoppingCartType] = @ShoppingCartType AND [AttributesXml] = @AttributesXml AND IsGift = @IsGift AND IsByCoupon = @IsByCoupon " +
                    (moduleKey.IsNotEmpty() ? "AND ModuleKey = @ModuleKey" : "AND (ModuleKey = '' OR ModuleKey IS NULL)"),
                    CommandType.Text, 
                    x => GetFromReader(x),
                    new SqlParameter("@CustomerId", customerId),
                    new SqlParameter("@OfferId", offerId),
                    new SqlParameter("@AttributesXml", attributesXml ?? String.Empty),
                    new SqlParameter("@IsGift", isGift),
                    new SqlParameter("@ModuleKey", moduleKey ?? (object)DBNull.Value),
                    new SqlParameter("@ShoppingCartType", (int) shoppingCartType),
                    new SqlParameter("@IsByCoupon", isByCoupon));
        }

        private static void InsertShoppingCartItem(ShoppingCartItem item)
        {
            item.ShoppingCartItemId = SQLDataAccess.ExecuteScalar<int>(
                "INSERT INTO Catalog.ShoppingCart (ShoppingCartType, CustomerId, OfferId, AttributesXml, Amount, CreatedOn, UpdatedOn, IsGift, ModuleKey, AddedByRequest, CustomPrice, IsForbiddenChangeAmount, IsByCoupon) " +
                "VALUES (@ShoppingCartType, @CustomerId, @OfferId, @AttributesXml, @Amount, GetDate(), GetDate(), @IsGift, @ModuleKey, @AddedByRequest, @CustomPrice, @IsForbiddenChangeAmount, @IsByCoupon); Select SCOPE_IDENTITY();",
                CommandType.Text,
                new SqlParameter("@ShoppingCartType", (int) item.ShoppingCartType),
                new SqlParameter("@CustomerId", item.CustomerId),
                new SqlParameter("@OfferId", item.OfferId),
                new SqlParameter("@AttributesXml", item.AttributesXml ?? String.Empty),
                new SqlParameter("@Amount", item.Amount),
                new SqlParameter("@IsGift", item.IsGift),
                new SqlParameter("@ModuleKey", item.ModuleKey ?? (object)DBNull.Value),
                new SqlParameter("@AddedByRequest", item.AddedByRequest),
                new SqlParameter("@CustomPrice", item.CustomPrice ?? (object)DBNull.Value),
                new SqlParameter("@IsForbiddenChangeAmount", item.IsForbiddenChangeAmount),
                new SqlParameter("@IsByCoupon", item.IsByCoupon));
        }

        public static void UpdateShoppingCartItem(ShoppingCartItem item, bool useModule = true)
        {
            if (item == null)
                throw new ArgumentNullException("item");

            SQLDataAccess.ExecuteNonQuery(
                "UPDATE [Catalog].[ShoppingCart] SET [ShoppingCartType] = @ShoppingCartType, [CustomerId] = @CustomerId, [OfferId] = @OfferId, [AttributesXml] = @AttributesXml, [UpdatedOn] = GetDate(), " +
                "[Amount] = @Amount, IsGift=@IsGift, ModuleKey=@ModuleKey, AddedByRequest=@AddedByRequest, CustomPrice=@CustomPrice, IsForbiddenChangeAmount = @IsForbiddenChangeAmount, IsByCoupon = @IsByCoupon " +
                "WHERE [ShoppingCartItemId] = @ShoppingCartItemId",
                CommandType.Text,
                new SqlParameter("@ShoppingCartType", (int) item.ShoppingCartType),
                new SqlParameter("@ShoppingCartItemId", item.ShoppingCartItemId),
                new SqlParameter("@CustomerId", item.CustomerId),
                new SqlParameter("@OfferId", item.OfferId),
                new SqlParameter("@AttributesXml", item.AttributesXml ?? String.Empty),
                new SqlParameter("@Amount", (decimal)item.Amount),
                new SqlParameter("@IsGift", item.IsGift),
                new SqlParameter("@ModuleKey", item.ModuleKey ?? (object)DBNull.Value),
                new SqlParameter("@AddedByRequest", item.AddedByRequest),
                new SqlParameter("@CustomPrice", item.CustomPrice ?? (object)DBNull.Value),
                new SqlParameter("@IsForbiddenChangeAmount", item.IsForbiddenChangeAmount),
                new SqlParameter("@IsByCoupon", item.IsByCoupon));

            if (useModule)
            {
                if (item.ShoppingCartType == ShoppingCartType.ShoppingCart)
                {
                    var modules = AttachedModules.GetModuleInstances<IShoppingCart>();
                    if (modules != null && modules.Count != 0)
                    {
                        foreach (var module in modules)
                            module.UpdateCart(item);
                    }
                }
            }
        }

        public static void ClearShoppingCart(ShoppingCartType shoppingCartType)
        {
            ClearShoppingCart(shoppingCartType, CustomerContext.CustomerId);
        }

        public static void ClearShoppingCart(ShoppingCartType shoppingCartType, Guid customerId)
        {
            SQLDataAccess.ExecuteNonQuery(
                "DELETE FROM Catalog.ShoppingCart WHERE ShoppingCartType = @ShoppingCartType and CustomerId = @CustomerId",
                CommandType.Text,
                new SqlParameter("@ShoppingCartType", (int) shoppingCartType),
                new SqlParameter("@CustomerId", customerId));

            if (HttpContext.Current != null)
                HttpContext.Current.Items[ShoppingCartContextKey + shoppingCartType] = null;
        }

        public static void DeleteExpiredShoppingCartItems(DateTime olderThan)
        {
            SQLDataAccess.ExecuteNonQuery("DELETE FROM Catalog.ShoppingCart WHERE CreatedOn<@olderThan",
                CommandType.Text, new SqlParameter("@olderThan", olderThan));
        }

        public static void DeleteShoppingCartItem(ShoppingCartItem cartItem, bool useModule = true)
        {
            SQLDataAccess.ExecuteNonQuery(
                "DELETE FROM Catalog.ShoppingCart WHERE ShoppingCartItemId = @ShoppingCartItemId", CommandType.Text,
                new SqlParameter("@ShoppingCartItemId", cartItem.ShoppingCartItemId));

            if (HttpContext.Current != null)
                HttpContext.Current.Items[ShoppingCartContextKey + cartItem.ShoppingCartType] = null;

            if (useModule)
            {
                if (cartItem.ShoppingCartType == ShoppingCartType.ShoppingCart)
                {
                    var modules = AttachedModules.GetModuleInstances<IShoppingCart>();
                    if (modules != null && modules.Count != 0)
                    {
                        foreach (var module in modules)
                            module.RemoveFromCart(cartItem);
                    }
                }
            }
        }

        public static void MergeShoppingCarts(Guid oldCustomerId, Guid currentCustomerId)
        {
            if (oldCustomerId == currentCustomerId) 
                return;

            var shoppingCart = GetAllShoppingCarts(oldCustomerId);
            foreach (var item in shoppingCart)
            {
                AddShoppingCartItem(item, currentCustomerId);
            }

            if (shoppingCart.Coupon?.CouponID > 0)
            {
                CouponService.DeleteCustomerCoupon(shoppingCart.Coupon.CouponID, oldCustomerId);
                if (shoppingCart.Coupon.CouponID == InternalBonusSystem.BringFriendCouponId)
                {
                    var referralCustomerId = ReferralService.GetReferralCustomerId(currentCustomerId);
                    var referralCustomer = referralCustomerId.HasValue
                        ? CustomerService.GetCustomer(referralCustomerId.Value)
                        : null;
                    if (referralCustomer == null)
                    {
                        var referralCodeData = ReferralService.GetReferralCodeCookieData();
                        if (referralCodeData != null && !string.IsNullOrWhiteSpace(referralCodeData.ReferralCustomerCode))
                            referralCustomer = CustomerService.GetCustomerByReferralCode(referralCodeData.ReferralCustomerCode);
                    }
                    if (referralCustomer == null || currentCustomerId == referralCustomer.Id || ReferralService.GetReferralCustomerId(currentCustomerId) != null)
                        return;
                }
                CouponService.AddCustomerCoupon(shoppingCart.Coupon.CouponID, currentCustomerId);
            }
        }

        public static Discount GetShoppingCartItemDiscount(int shoppingCartItemId)
        {
            foreach (var moduleDiscount in AttachedModules.GetModules<IDiscount>().Where(x => x != null))
            {
                var discount = ((IDiscount)Activator.CreateInstance(moduleDiscount)).GetCartItemDiscount(shoppingCartItemId);
                if (discount != null && discount.HasValue)
                    return discount;
            }
            return null;
        }

        private static ShoppingCartItem GetFromReader(SqlDataReader reader)
        {
            return new ShoppingCartItem()
            {
                ShoppingCartItemId = SQLDataHelper.GetInt(reader, "ShoppingCartItemId"),
                ShoppingCartType = (ShoppingCartType)SQLDataHelper.GetInt(reader, "ShoppingCartType"),
                OfferId = SQLDataHelper.GetInt(reader, "OfferID"),
                CustomerId = SQLDataHelper.GetGuid(reader, "CustomerId"),
                AttributesXml = SQLDataHelper.GetString(reader, "AttributesXml"),
                Amount = SQLDataHelper.GetFloat(reader, "Amount"),
                CreatedOn = SQLDataHelper.GetDateTime(reader, "CreatedOn"),
                UpdatedOn = SQLDataHelper.GetDateTime(reader, "UpdatedOn"),
                IsGift = SQLDataHelper.GetBoolean(reader, "IsGift"),
                ModuleKey = SQLDataHelper.GetString(reader, "ModuleKey"),
                AddedByRequest = SQLDataHelper.GetBoolean(reader, "AddedByRequest"),
                CustomPrice = SQLDataHelper.GetNullableFloat(reader, "CustomPrice"),
                IsForbiddenChangeAmount = SQLDataHelper.GetBoolean(reader, "IsForbiddenChangeAmount"),
                IsByCoupon = SQLDataHelper.GetBoolean(reader, "IsByCoupon")
            };
        }
        
        private static ShoppingCartItem WithCustomer(this ShoppingCartItem item, Customer customer)
        {
            item.SetCustomer(customer);
            
            return item;
        }

        private static ShoppingCartItem WithPriceRule(this ShoppingCartItem item, int? paymentId = null, int? shippingId = null)
        {
            item.Offer.SetPriceRule(item.Amount, item.CustomerGroup.CustomerGroupId, paymentId, shippingId);
            
            item.SetPiceByPriceRule();
            
            return item;
        }

        /// <summary>
        /// Применить типы цен "От суммы корзины" после полного расчёта корзины.
        /// </summary>
        private static void ApplyPriceRuleByCartSum(ShoppingCart cart)
        {
            if (cart == null || cart.Count == 0 || !PriceRuleService.IsPriceRulesExists(PriceRuleMode.ByCartSum))
                return;

            var cartSum = cart.TotalPrice - cart.TotalDiscount;
            if (cartSum <= 0)
                return;

            cart.ResetTotalPrice();
            
            var priorityByQuantity = SettingsPriceRules.PriceRulePriority == PriceRuleMode.ByQuantity;

            foreach (var cartItem in cart)
            {
                if (priorityByQuantity && cartItem.Offer.PriceRule != null)
                    continue;
                
                var rule = PriceRuleService.GetPriceRuleByCartSum(cartItem.OfferId, cartSum);
                if (rule == null)
                    continue;

                cartItem.Reset();
                cartItem.Offer.SetOfferPriceRule(rule);
                cartItem.SetPiceByPriceRule();
            }
        }

        private static ShoppingCartItem WithDiscountByDateTime(this ShoppingCartItem item, List<DiscountByTime> discountsByDateTime)
        {
            if (discountsByDateTime == null)
                return item;

            item.DiscountByDatetime = DiscountByTimeService.GetDiscount(discountsByDateTime, item.Offer.ProductId);
            return item;
        }

        public static void ResetHttpContentCard(ShoppingCartType shoppingCartType)
        {
            HttpContext.Current.Items.Remove(ShoppingCartContextKey + shoppingCartType);
        }

        public static bool ShoppingCartHasProductsWithGifts()
        {
            return SQLDataAccess.ExecuteScalar<int>(
                "SELECT TOP(1) 1 from Catalog.ShoppingCart " +
                "INNER JOIN Catalog.Offer ON Offer.OfferId = ShoppingCart.OfferId " +
                "INNER JOIN Catalog.ProductGifts ON ProductGifts.ProductId = Offer.ProductId " +
                "WHERE ShoppingCart.CustomerId = @CustomerId AND ShoppingCartType = @ShoppingCartType AND IsGift = 0",
                CommandType.Text,
                new SqlParameter("CustomerId", CustomerContext.CustomerId),
                new SqlParameter("ShoppingCartType", ShoppingCartType.ShoppingCart)) > 0;
        }

        public static string GetAvailableState(ShoppingCartItem cartItem, ShoppingCart cart)
        {
            var offer = cartItem.Offer;
            var product = offer.Product;
            var unit = !string.IsNullOrEmpty(product.Unit?.DisplayName)
                ? " " + product.Unit?.DisplayName
                : "";
            
            if (!product.Enabled || !product.CategoryEnabled)
                return LocalizationService.GetResource("Cart.Error.NotAvailable") + " 0" + unit;

            if ((cartItem.AddedByRequest && !SettingsCheckout.DenyToByPreorderedProductsWithZerroAmount)
                || cartItem.IsGift
                || cartItem.IsByCoupon)
            {
                return "";
            }

            if (SettingsCheckout.AmountLimitation)
            {
                if (SettingsCheckout.AmountLimitationByWarehouse && SettingsCatalog.ShowOnlyAvalible)
                {
                    var warehouseIds = WarehouseContext.GetAvailableWarehouseIds();
                    if (warehouseIds != null)
                        offer.SetAmountByStocksAndWarehouses(warehouseIds);
                }

                if (cartItem.Amount > offer.Amount
                    && !(offer.Amount <= 0 && product.AllowBuyOutOfStockProducts()))
                {
                    return LocalizationService.GetResource("Cart.Error.NotAvailable") + " " + 
                           (offer.Amount < 0 ? 0 : offer.Amount) + unit;
                }

                if (!string.IsNullOrEmpty(cartItem.AttributesXml))
                {
                    var itemOffersSumAmount =
                        cart.Where(x => x.OfferId == cartItem.OfferId && x.ModuleKey.IsNullOrEmpty() && !x.FrozenAmount)
                            .Sum(x => x.Amount);

                    if (itemOffersSumAmount > offer.Amount
                        && !(offer.Amount <= 0 && product.AllowBuyOutOfStockProducts()))
                    {
                        return
                            product.Name +
                            (offer.ColorID != null ? " " + offer.Color.ColorName : "") +
                            (offer.SizeID != null ? (offer.ColorID != null ? ", " : " ") + offer.Size.SizeName : "") +
                            " " +
                            LocalizationService.GetResource("Cart.Error.NotAvailable") + " " +
                            (offer.Amount < 0 ? 0 : offer.Amount) + unit;
                    }
                }
            }

            if (product.MaxAmount.HasValue 
                && cartItem.Amount > product.MaxAmount)
            {
                return LocalizationService.GetResource("Cart.Error.MaximumOrder") + " " + product.MaxAmount + unit;
            }

            if (product.MinAmount.HasValue 
                && cartItem.Amount < product.MinAmount)
            {
                return LocalizationService.GetResource("Cart.Error.MinimumOrder") + " " + product.MinAmount + unit;
            }

            if (!CustomOptionsService.IsValidCustomOptions(cartItem))
                return LocalizationService.GetResource("Cart.Error.NotAvailableCustomOptions") + " 0" + unit;

            return "";
        }

        public static string GetAvailableState(Offer offer, float amount, List<EvaluatedCustomOptions> customOptions)
        {
            var product = offer.Product;
            var unit = offer.Product.Unit is null
                ? ""
                : " " + offer.Product.Unit?.DisplayName;

            if (!product.Enabled || !product.CategoryEnabled)
                return LocalizationService.GetResource("Cart.Error.NotAvailable") + " 0" + unit;

            if (SettingsCheckout.AmountLimitation)
            {
                if (SettingsCheckout.AmountLimitationByWarehouse && SettingsCatalog.ShowOnlyAvalible)
                {
                    var warehouseIds = WarehouseContext.GetAvailableWarehouseIds();
                    if (warehouseIds != null)
                        offer.SetAmountByStocksAndWarehouses(warehouseIds);
                }

                if (amount > offer.Amount
                    && !product.AllowBuyOutOfStockProducts())
                {
                    return LocalizationService.GetResource("Cart.Error.NotAvailable") + " " + offer.Amount + unit;
                }
            }

            if (product.MaxAmount.HasValue
                && amount > product.MaxAmount)
            {
                return LocalizationService.GetResource("Cart.Error.MaximumOrder") + " " + product.MaxAmount + unit;
            }

            if (product.MinAmount.HasValue
                && amount < product.MinAmount)
            {
                return LocalizationService.GetResource("Cart.Error.MinimumOrder") + " " + product.MinAmount + unit;
            }

            if (customOptions != null
                && !CustomOptionsService.IsValidCustomOptions(customOptions, product.ProductId))
            {
                return LocalizationService.GetResource("Cart.Error.NotAvailableCustomOptions") + " 0" + unit;
            }

            return "";
        }

        public static string IsValidCart(ShoppingCart cart, float itemsCount, float totalPrice)
        {
            if (itemsCount == 0)
                return LocalizationService.GetResource("Cart.Error.NoProducts");

            var minimumOrderPrice = CustomerGroupService.GetMinimumOrderPrice(cart);

            if (totalPrice < minimumOrderPrice)
            {
                return string.Format(LocalizationService.GetResource("Cart.Error.MinimalOrderPrice"), minimumOrderPrice.FormatPrice(),
                    (minimumOrderPrice - totalPrice).FormatPrice());
            }

            if (cart.Any(item => GetAvailableState(item, cart).IsNotEmpty()))
                return LocalizationService.GetResource("Cart.Error.NotAvailableProducts");

            if (!ShopService.AllowCheckoutNow())
                return LocalizationService.GetResource("Cart.Error.NotAllowCheckoutNow");

            return string.Empty;
        }
    }
}