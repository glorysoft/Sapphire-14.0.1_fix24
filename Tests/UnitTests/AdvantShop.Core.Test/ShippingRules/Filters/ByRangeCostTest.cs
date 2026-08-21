using AdvantShop.Core.Services.Shipping.Rules;
using AdvantShop.Repository.Currencies;
using NUnit.Framework;
using NUnit.Framework.Legacy;

namespace AdvantShop.Core.Test.ShippingRules
{
    public class ByRangeCostTest
    {
        [Test]
        public void NegativeByNullCurrency()
        {
            //Arrange
            var objWithNullCost = new SimpleObjectForRule(default, default, cost: 0.5f, currency: null);
            var filterByRangeCost = new FilterByRangeCost(0f, 1f, 1f, true);
            var filterByRangeCostNegative = new FilterByRangeCost(0f, 1f, 1f, filterIsPositive: false);
            var filterByRangeCostNullRange = new FilterByRangeCost(null, null, 1f, true);
            var filterByRangeCostNegativeNullRange = new FilterByRangeCost(null, null, 1f, filterIsPositive: false);
            
            //Act
            var negative = filterByRangeCost.Check(objWithNullCost);
            var negative2 = filterByRangeCostNegative.Check(objWithNullCost);
            var negative3 = filterByRangeCostNullRange.Check(objWithNullCost);
            var negative4 = filterByRangeCostNegativeNullRange.Check(objWithNullCost);

            //Assert
            ClassicAssert.IsNotNull(objWithNullCost.Cost);
            ClassicAssert.IsNull(objWithNullCost.Currency);
            ClassicAssert.IsFalse(negative);
            ClassicAssert.IsFalse(negative2);
            ClassicAssert.IsFalse(negative3);
            ClassicAssert.IsFalse(negative4);
        }
        
        [Test]
        public void NegativeByNullCost()
        {
            //Arrange
            var currency = new Currency() {Rate = 1f};
            var objWithNullCost = new SimpleObjectForRule(default, default, cost: null, currency: currency);
            var filterByRangeCost = new FilterByRangeCost(0f, 1f, currency.Rate, true);
            var filterByRangeCostNegative = new FilterByRangeCost(0f, 1f, currency.Rate, filterIsPositive: false);
            var filterByRangeCostNullRange = new FilterByRangeCost(null, null, currency.Rate, true);
            var filterByRangeCostNegativeNullRange = new FilterByRangeCost(null, null, currency.Rate, filterIsPositive: false);
            
            //Act
            var negative = filterByRangeCost.Check(objWithNullCost);
            var negative2 = filterByRangeCostNegative.Check(objWithNullCost);
            var negative3 = filterByRangeCostNullRange.Check(objWithNullCost);
            var negative4 = filterByRangeCostNegativeNullRange.Check(objWithNullCost);

            //Assert
            ClassicAssert.IsNotNull(objWithNullCost.Currency);
            ClassicAssert.IsNull(objWithNullCost.Cost);
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
            var objWithNullCost = new SimpleObjectForRule(default, default, cost: 0.5f, currency: currency);
            var filterByRangeCost = new FilterByRangeCost(from: null, to: null, currency.Rate, true);
            var filterByRangeCostNegative = new FilterByRangeCost(from: null, to: null, currency.Rate, filterIsPositive: false);
            
            //Act
            var positive = filterByRangeCost.Check(objWithNullCost);
            var positive2 = filterByRangeCostNegative.Check(objWithNullCost);

            //Assert
            ClassicAssert.IsNotNull(objWithNullCost.Currency);
            ClassicAssert.IsNotNull(objWithNullCost.Cost);
            ClassicAssert.IsTrue(positive);
            ClassicAssert.IsTrue(positive2);
        }

        [Test]
        public void Positive()
        {
            //Arrange
            var currency = new Currency() {Rate = 1f};
            var objWithNullCost = new SimpleObjectForRule(default, default, cost: 0.5f, currency: currency);
            var filterByRangeCost = new FilterByRangeCost(0f, 1f, currency.Rate, true);
            
            //Act
            var positive = filterByRangeCost.Check(objWithNullCost);

            //Assert
            ClassicAssert.IsNotNull(objWithNullCost.Cost);
            ClassicAssert.IsTrue(positive);
        }

        [Test]
        public void PositiveByMultiCurrency()
        {
            //Arrange
            var costInCurrencyObject = 10f;
            var currencyOfObject = new Currency() {Rate = 1f};
            var objWithTenCost = new SimpleObjectForRule(default, default, costInCurrencyObject, currencyOfObject);
            var currencyOfFilter= new Currency() {Rate = 2f};
            var filterByRangeCost = new FilterByRangeCost(2f, 8f, currencyOfFilter.Rate, true);
            
            //Act
            var positiveFilter = filterByRangeCost.Check(objWithTenCost);
            
            //Assert
            ClassicAssert.AreNotEqual(currencyOfObject.Rate, currencyOfFilter.Rate);
            ClassicAssert.AreEqual(objWithTenCost.Cost, costInCurrencyObject);
            ClassicAssert.IsTrue(positiveFilter);
        }

        [Test]
        public void PositiveInvert()
        {
            //Arrange
            var currency = new Currency() {Rate = 1f};
            var objWithNullCost = new SimpleObjectForRule(default, default, cost: 0.5f, currency: currency);
            var filterByRangeCost = new FilterByRangeCost(objWithNullCost.Cost + 1f, objWithNullCost.Cost + 2f, currency.Rate, filterIsPositive: false);
            
            //Act
            var positive = filterByRangeCost.Check(objWithNullCost);

            //Assert
            ClassicAssert.IsNotNull(objWithNullCost.Cost);
            ClassicAssert.IsTrue(positive);
        }

        [Test]
        public void PositiveInvertByMultiCurrency()
        {
            //Arrange
            var costInCurrencyObject = 10f;
            var currencyOfObject = new Currency() {Rate = 1f};
            var objWithTenCost = new SimpleObjectForRule(default, default, costInCurrencyObject, currencyOfObject);
            var currencyOfFilter= new Currency() {Rate = 2f};
            var filterByRangeCost = new FilterByRangeCost(9f, 12f, currencyOfFilter.Rate, filterIsPositive: false);
            
            //Act
            var positiveFilter = filterByRangeCost.Check(objWithTenCost);
            
            //Assert
            ClassicAssert.AreNotEqual(currencyOfObject.Rate, currencyOfFilter.Rate);
            ClassicAssert.AreEqual(objWithTenCost.Cost, costInCurrencyObject);
            ClassicAssert.IsTrue(positiveFilter);
        }

        [Test]
        public void PositiveByLess()
        {
            //Arrange
            var currency = new Currency() {Rate = 10f};
            var objWithNullCost = new SimpleObjectForRule(default, default, cost: 0.5f, currency: currency);
            var filterByRangeCost = new FilterByRangeCost(from: null, to: 1f, currency.Rate, true);
            
            //Act
            var positive = filterByRangeCost.Check(objWithNullCost);

            //Assert
            ClassicAssert.IsNotNull(objWithNullCost.Cost);
            ClassicAssert.IsTrue(positive);
        }

        [Test]
        public void PositiveByMore()
        {
            //Arrange
            var currency = new Currency() {Rate = 10f};
            var objWithNullCost = new SimpleObjectForRule(default, default, cost: 0.5f, currency: currency);
            var filterByRangeCost = new FilterByRangeCost(from: 0f, to: null, currency.Rate, true);
            
            //Act
            var positive = filterByRangeCost.Check(objWithNullCost);

            //Assert
            ClassicAssert.IsNotNull(objWithNullCost.Cost);
            ClassicAssert.IsTrue(positive);
        }

        [Test]
        public void NegativeByLess()
        {
            //Arrange
            var currency = new Currency() {Rate = 10f};
            var objWithNullCost = new SimpleObjectForRule(default, default, cost: 0.5f, currency: currency);
            var filterByRangeCost = new FilterByRangeCost(from: null, to: 0f, currency.Rate, true);
            
            //Act
            var negative = filterByRangeCost.Check(objWithNullCost);

            //Assert
            ClassicAssert.IsNotNull(objWithNullCost.Cost);
            ClassicAssert.IsFalse(negative);
        }

        [Test]
        public void NegativeByMore()
        {
            //Arrange
            var currency = new Currency() {Rate = 10f};
            var objWithNullCost = new SimpleObjectForRule(default, default, cost: 0.5f, currency: currency);
            var filterByRangeCost = new FilterByRangeCost(from: 1f, to: null, currency.Rate, true);
            
            //Act
            var negative = filterByRangeCost.Check(objWithNullCost);

            //Assert
            ClassicAssert.IsNotNull(objWithNullCost.Cost);
            ClassicAssert.IsFalse(negative);
        }

        [Test]
        public void NegativeByInvertLess()
        {
            //Arrange
            var currency = new Currency() {Rate = 10f};
            var objWithNullCost = new SimpleObjectForRule(default, default, cost: 0.5f, currency: currency);
            var filterByRangeCost = new FilterByRangeCost(from: null, to: 1f, currency.Rate, false);
            
            //Act
            var negative = filterByRangeCost.Check(objWithNullCost);

            //Assert
            ClassicAssert.IsNotNull(objWithNullCost.Cost);
            ClassicAssert.IsFalse(negative);
        }

        [Test]
        public void NegativeByInvertMore()
        {
            //Arrange
            var currency = new Currency() {Rate = 10f};
            var objWithNullCost = new SimpleObjectForRule(default, default, cost: 0.5f, currency: currency);
            var filterByRangeCost = new FilterByRangeCost(from: 0f, to: null, currency.Rate, false);
            
            //Act
            var negative = filterByRangeCost.Check(objWithNullCost);

            //Assert
            ClassicAssert.IsNotNull(objWithNullCost.Cost);
            ClassicAssert.IsFalse(negative);
        }
    }
}