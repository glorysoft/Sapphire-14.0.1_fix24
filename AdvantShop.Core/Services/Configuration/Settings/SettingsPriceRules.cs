//--------------------------------------------------
// Project: AdvantShop.NET
// Web site: http:\\www.advantshop.net
//--------------------------------------------------

using System;
using AdvantShop.Core.Services.Catalog;

namespace AdvantShop.Configuration
{
    public class SettingsPriceRules
    {
        public static bool ShowAmountsTableInProduct
        {
            get => Convert.ToBoolean(SettingProvider.Items["ShowAmountsTableInProduct"]);
            set => SettingProvider.Items["ShowAmountsTableInProduct"] = value.ToString();
        }

        public static bool ShowAmountsTableInCatalog
        {
            get => Convert.ToBoolean(SettingProvider.Items["ShowAmountsTableInCatalog"]);
            set => SettingProvider.Items["ShowAmountsTableInCatalog"] = value.ToString();
        }
        
        public static bool ShowPriceAmountNextDiscountsInCart
        {
            get => Convert.ToBoolean(SettingProvider.Items["ShowPriceAmountNextDiscountsInCart"]);
            set => SettingProvider.Items["ShowPriceAmountNextDiscountsInCart"] = value.ToString();
        }
        
        public static bool ShowCartSumAmountsTableInProduct
        {
            get => Convert.ToBoolean(SettingProvider.Items["ShowCartSumAmountsTableInProduct"]);
            set => SettingProvider.Items["ShowCartSumAmountsTableInProduct"] = value.ToString();
        }
        
        public static bool ShowNextDiscountsByCartSumInCart
        {
            get => Convert.ToBoolean(SettingProvider.Items["ShowNextDiscountsByCartSumInCart"]);
            set => SettingProvider.Items["ShowNextDiscountsByCartSumInCart"] = value.ToString();
        }
        
        public static PriceRuleMode PriceRulePriority
        {
            get => (PriceRuleMode)Convert.ToByte(SettingProvider.Items["PriceRulePriority"]);
            set => SettingProvider.Items["PriceRulePriority"] = ((byte)value).ToString();
        }
    }
}