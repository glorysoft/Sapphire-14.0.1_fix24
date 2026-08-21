using System;
using System.Collections.Generic;
using System.Linq;
using AdvantShop.Repository;
using AdvantShop.Shipping;

namespace AdvantShop.Core.Services.Shipping
{
    public static class PreOrderItemsExtensions
    {
        public static IEnumerable<PreOrderItem> CeilingAmountToInteger(this IEnumerable<PreOrderItem> items)
        {
            foreach (var item in items.Where(x => x.Amount % 1 > 0))
            {
                var newAmount = (float)Math.Ceiling(item.Amount);

                item.ConvertPreOrderItemToNewAmount(newAmount);

                item.Amount = newAmount;
            }
            return items;
        }

        public static void ConvertPreOrderItemToNewAmount(this PreOrderItem item, float newAmount)
        {
            item.Price =
                (float)Math.Round(
                    MeasureHelper.ConvertUnitToNewAmount(oldUnit: item.Price, oldAmount: item.Amount, newAmount: newAmount),
                    2);

            item.Weight = 
                (float)Math.Round(
                    MeasureHelper.ConvertUnitToNewAmount(oldUnit: item.Weight, oldAmount: item.Amount, newAmount: newAmount),
                    3);

            var min = Math.Min(Math.Min(item.Length, item.Width), item.Height);
            if (item.Length == min)
                item.Length = (float)Math.Ceiling(MeasureHelper.ConvertUnitToNewAmount(oldUnit: item.Length, oldAmount: item.Amount, newAmount: newAmount));
            else if (item.Width == min)
                item.Width = (float)Math.Ceiling(MeasureHelper.ConvertUnitToNewAmount(oldUnit: item.Width, oldAmount: item.Amount, newAmount: newAmount));
            else if (item.Height == min)
                item.Height = (float)Math.Ceiling(MeasureHelper.ConvertUnitToNewAmount(oldUnit: item.Height, oldAmount: item.Amount, newAmount: newAmount));
        }
    }
}