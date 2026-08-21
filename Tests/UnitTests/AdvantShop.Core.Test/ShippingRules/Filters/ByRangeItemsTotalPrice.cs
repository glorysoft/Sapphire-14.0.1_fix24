using AdvantShop.Core.Services.Shipping;
using AdvantShop.Core.Services.Shipping.Rules;
using AdvantShop.Repository.Currencies;
using NUnit.Framework;
using NUnit.Framework.Legacy;

namespace AdvantShop.Core.Test.ShippingRules
{
    public class ByRangeItemsTotalPrice
    {
        [Test]
        public void NegativeByNullCurrency()
        {
            //Arrange
            var objWithNullCost = new SimpleObjectForRule(default, default, default, default, default,
                new ShippingCalculationParameters(){Currency = null, ItemsTotalPriceWithDiscounts = 0.5f});
            var filterByRangeItemsTotalPrice = new FilterByRangeItemsTotalPrice(0f, 1f, 1f, true);
            var filterByRangeItemsTotalPriceNegative = new FilterByRangeItemsTotalPrice(0f, 1f, 1f, filterIsPositive: false);
            var filterByRangeItemsTotalPriceNullRange = new FilterByRangeItemsTotalPrice(null, null, 1f, true);
            var filterByRangeItemsTotalPriceNegativeNullRange = new FilterByRangeItemsTotalPrice(null, null, 1f, filterIsPositive: false);
            
            //Act
            var negative = filterByRangeItemsTotalPrice.Check(objWithNullCost);
            var negative2 = filterByRangeItemsTotalPriceNegative.Check(objWithNullCost);
            var negative3 = filterByRangeItemsTotalPriceNullRange.Check(objWithNullCost);
            var negative4 = filterByRangeItemsTotalPriceNegativeNullRange.Check(objWithNullCost);

            //Assert
            ClassicAssert.IsNull(objWithNullCost.CalculationParameters?.Currency);
            ClassicAssert.IsFalse(negative);
            ClassicAssert.IsFalse(negative2);
            ClassicAssert.IsFalse(negative3);
            ClassicAssert.IsFalse(negative4);
        }
            
        [Test]
        public void PositiveByNullRange()
        {
            //Arrange
            var currency = new Currency() {Rate = 1f};
            var obj = new SimpleObjectForRule(default, default, default, default, default,
                new ShippingCalculationParameters(){Currency = currency, ItemsTotalPriceWithDiscounts = 0.5f});
            var filterByRangeItemsTotalPrice = new FilterByRangeItemsTotalPrice(from: null, to: null, currency.Rate, true);
            var filterByRangeItemsTotalPriceNegative = new FilterByRangeItemsTotalPrice(from: null, to: null, currency.Rate, filterIsPositive: false);
            
            //Act
            var positive = filterByRangeItemsTotalPrice.Check(obj);
            var positive2 = filterByRangeItemsTotalPriceNegative.Check(obj);

            //Assert
            ClassicAssert.IsNotNull(obj.CalculationParameters?.Currency);
            ClassicAssert.IsNotNull(obj.CalculationParameters?.ItemsTotalPriceWithDiscounts);
            ClassicAssert.IsTrue(positive);
            ClassicAssert.IsTrue(positive2);
        }
  
        [Test]
        public void Positive()
        {
            //Arrange
            var currency = new Currency() {Rate = 1f};
            var obj = new SimpleObjectForRule(default, default, default, default, default,
                new ShippingCalculationParameters(){Currency = currency, ItemsTotalPriceWithDiscounts = 0.5f});
            var filterByRangeItemsTotalPrice = new FilterByRangeItemsTotalPrice(0f, 1f, currency.Rate, true);
            
            //Act
            var positive = filterByRangeItemsTotalPrice.Check(obj);

            //Assert
            ClassicAssert.IsNotNull(obj.CalculationParameters?.ItemsTotalPriceWithDiscounts);
            ClassicAssert.IsTrue(positive);
        }

        [Test]
        public void PositiveByMultiCurrency()
        {
            //Arrange
            var costInCurrencyObject = 10f;
            var currencyOfObject = new Currency() {Rate = 1f};
            var objWithTenCost = new SimpleObjectForRule(default, default, default, default, default,
                new ShippingCalculationParameters() {Currency = currencyOfObject, ItemsTotalPriceWithDiscounts = costInCurrencyObject});
            var currencyOfFilter= new Currency() {Rate = 2f};
            var filterByRangeItemsTotalPrice = new FilterByRangeItemsTotalPrice(2f, 8f, currencyOfFilter.Rate, true);
            
            //Act
            var positiveFilter = filterByRangeItemsTotalPrice.Check(objWithTenCost);
            
            //Assert
            ClassicAssert.AreNotEqual(currencyOfObject.Rate, currencyOfFilter.Rate);
            ClassicAssert.AreEqual(objWithTenCost.CalculationParameters?.ItemsTotalPriceWithDiscounts, costInCurrencyObject);
            ClassicAssert.IsTrue(positiveFilter);
        }

        [Test]
        public void PositiveInvert()
        {
            //Arrange
            var currency = new Currency() {Rate = 1f};
            var obj = new SimpleObjectForRule(default, default, default, default, default,
                new ShippingCalculationParameters(){Currency = currency, ItemsTotalPriceWithDiscounts = 0.5f});
            var filterByRangeItemsTotalPrice = new FilterByRangeItemsTotalPrice(obj.Cost + 1f, obj.Cost + 2f, currency.Rate, filterIsPositive: false);
            
            //Act
            var positive = filterByRangeItemsTotalPrice.Check(obj);

            //Assert
            ClassicAssert.IsNotNull(obj.CalculationParameters?.ItemsTotalPriceWithDiscounts);
            ClassicAssert.IsTrue(positive);
        }

        [Test]
        public void PositiveInvertByMultiCurrency()
        {
            //Arrange
            var costInCurrencyObject = 10f;
            var currencyOfObject = new Currency() {Rate = 1f};
            var objWithTenCost = new SimpleObjectForRule(default, default, default, default, default,
                new ShippingCalculationParameters() {Currency = currencyOfObject, ItemsTotalPriceWithDiscounts = costInCurrencyObject});
            var currencyOfFilter= new Currency() {Rate = 2f};
            var filterByRangeItemsTotalPrice = new FilterByRangeItemsTotalPrice(9f, 12f, currencyOfFilter.Rate, filterIsPositive: false);
            
            //Act
            var positiveFilter = filterByRangeItemsTotalPrice.Check(objWithTenCost);
            
            //Assert
            ClassicAssert.AreNotEqual(currencyOfObject.Rate, currencyOfFilter.Rate);
            ClassicAssert.AreEqual(objWithTenCost.CalculationParameters?.ItemsTotalPriceWithDiscounts, costInCurrencyObject);
            ClassicAssert.IsTrue(positiveFilter);
        }

        [Test]
        public void PositiveByLess()
        {
            //Arrange
            var currency = new Currency() {Rate = 10f};
            var obj = new SimpleObjectForRule(default, default, default, default, default,
                new ShippingCalculationParameters(){Currency = currency, ItemsTotalPriceWithDiscounts = 0.5f});
            var filterByRangeItemsTotalPrice = new FilterByRangeItemsTotalPrice(from: null, to: 1f, currency.Rate, true);
            
            //Act
            var positive = filterByRangeItemsTotalPrice.Check(obj);

            //Assert
            ClassicAssert.IsNotNull(obj.CalculationParameters?.ItemsTotalPriceWithDiscounts);
            ClassicAssert.IsTrue(positive);
        }

        [Test]
        public void PositiveByMore()
        {
            //Arrange
            var currency = new Currency() {Rate = 10f};
            var obj = new SimpleObjectForRule(default, default, default, default, default,
                new ShippingCalculationParameters(){Currency = currency, ItemsTotalPriceWithDiscounts = 0.5f});
            var filterByRangeItemsTotalPrice = new FilterByRangeItemsTotalPrice(from: 0, to: null, currency.Rate, true);
            
            //Act
            var positive = filterByRangeItemsTotalPrice.Check(obj);

            //Assert
            ClassicAssert.IsNotNull(obj.CalculationParameters?.ItemsTotalPriceWithDiscounts);
            ClassicAssert.IsTrue(positive);
        }

        [Test]
        public void NegativeByLess()
        {
            //Arrange
            var currency = new Currency() {Rate = 10f};
            var obj = new SimpleObjectForRule(default, default, default, default, default,
                new ShippingCalculationParameters(){Currency = currency, ItemsTotalPriceWithDiscounts = 0.5f});
            var filterByRangeItemsTotalPrice = new FilterByRangeItemsTotalPrice(from: null, to: 0f, currency.Rate, true);
            
            //Act
            var negative = filterByRangeItemsTotalPrice.Check(obj);

            //Assert
            ClassicAssert.IsNotNull(obj.CalculationParameters?.ItemsTotalPriceWithDiscounts);
            ClassicAssert.IsFalse(negative);
        }

        [Test]
        public void NegativeByMore()
        {
            //Arrange
            var currency = new Currency() {Rate = 10f};
            var obj = new SimpleObjectForRule(default, default, default, default, default,
                new ShippingCalculationParameters(){Currency = currency, ItemsTotalPriceWithDiscounts = 0.5f});
            var filterByRangeItemsTotalPrice = new FilterByRangeItemsTotalPrice(from: 1f, to: null, currency.Rate, true);
            
            //Act
            var negative = filterByRangeItemsTotalPrice.Check(obj);

            //Assert
            ClassicAssert.IsNotNull(obj.CalculationParameters?.ItemsTotalPriceWithDiscounts);
            ClassicAssert.IsFalse(negative);
        }

        [Test]
        public void NegativeByInvertLess()
        {
            //Arrange
            var currency = new Currency() {Rate = 10f};
            var obj = new SimpleObjectForRule(default, default, default, default, default,
                new ShippingCalculationParameters(){Currency = currency, ItemsTotalPriceWithDiscounts = 0.5f});
            var filterByRangeItemsTotalPrice = new FilterByRangeItemsTotalPrice(from: null, to: 1f, currency.Rate, filterIsPositive: false);
            
            //Act
            var negative = filterByRangeItemsTotalPrice.Check(obj);

            //Assert
            ClassicAssert.IsNotNull(obj.CalculationParameters?.ItemsTotalPriceWithDiscounts);
            ClassicAssert.IsFalse(negative);
        }

        [Test]
        public void NegativeByInvertMore()
        {
            //Arrange
            var currency = new Currency() {Rate = 10f};
            var obj = new SimpleObjectForRule(default, default, default, default, default,
                new ShippingCalculationParameters(){Currency = currency, ItemsTotalPriceWithDiscounts = 0.5f});
            var filterByRangeItemsTotalPrice = new FilterByRangeItemsTotalPrice(from: 0f, to: null, currency.Rate, filterIsPositive: false);
            
            //Act
            var negative = filterByRangeItemsTotalPrice.Check(obj);

            //Assert
            ClassicAssert.IsNotNull(obj.CalculationParameters?.ItemsTotalPriceWithDiscounts);
            ClassicAssert.IsFalse(negative);
        }

    }
}