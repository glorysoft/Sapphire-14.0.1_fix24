using AdvantShop.Core.Services.Shipping.Rules;
using AdvantShop.Repository.Currencies;
using NUnit.Framework;
using NUnit.Framework.Legacy;

namespace AdvantShop.Core.Test.ShippingRules
{
    public class FiltersTest
    {
        [Test]
        public void ByCost_NegativeByNull()
        {
            //Arrange
            var objWithNullCost = new SimpleObjectForRule();
            var filterByZero = new FilterByCost(0f, 1f, true);
            var filterByNegativeValue = new FilterByCost(-10f, 1f, true);
            var filterByPositiveValue = new FilterByCost(10f, 1f, true);
            
            //Act
            var negativeByZero = filterByZero.Check(objWithNullCost);
            var negativeByNegativeValue = filterByNegativeValue.Check(objWithNullCost);
            var negativeByPositiveValue = filterByPositiveValue.Check(objWithNullCost);
            
            //Assert
            ClassicAssert.IsNull(objWithNullCost.Cost);
            ClassicAssert.IsFalse(negativeByZero);
            ClassicAssert.IsFalse(negativeByNegativeValue);
            ClassicAssert.IsFalse(negativeByPositiveValue);
        }

        [Test]
        public void ByCost_Positive()
        {
            //Arrange
            var currency = new Currency() {Rate = 1f};
            var cost = 10f;
            var objWithTenCost = new SimpleObjectForRule(default, default, cost, currency);
            var filterByCost = new FilterByCost(cost, currency.Rate, true);
            
            //Act
            var positiveFilter = filterByCost.Check(objWithTenCost);
            
            //Assert
            ClassicAssert.AreEqual(objWithTenCost.Cost, cost);
            ClassicAssert.IsTrue(positiveFilter);
        }

        [Test]
        public void ByCost_PositiveByMultiCurrency()
        {
            //Arrange
            var costInCurrencyObject = 10f;
            var currencyOfObject = new Currency() {Rate = 1f};
            var objWithTenCost = new SimpleObjectForRule(default, default, costInCurrencyObject, currencyOfObject);
            var currencyOfFilter= new Currency() {Rate = 2f};
            var filterByCost = new FilterByCost(5f, currencyOfFilter.Rate, true);
            
            //Act
            var positiveFilter = filterByCost.Check(objWithTenCost);
            
            //Assert
            ClassicAssert.AreNotEqual(currencyOfObject.Rate, currencyOfFilter.Rate);
            ClassicAssert.AreEqual(objWithTenCost.Cost, costInCurrencyObject);
            ClassicAssert.IsTrue(positiveFilter);
        }
   
        [Test]
        public void ByCost_NegativeByNullCurrency()
        {
            //Arrange
            var cost = 10f;
            var objWithTenCost = new SimpleObjectForRule(default, default, cost, null);
            var filterByCost = new FilterByCost(cost, 1f, true);
            
            //Act
            var negativeFilter = filterByCost.Check(objWithTenCost);
            
            //Assert
            ClassicAssert.IsNull(objWithTenCost.Currency);
            ClassicAssert.AreEqual(objWithTenCost.Cost, cost);
            ClassicAssert.IsFalse(negativeFilter);
        }
     
        [Test]
        public void ByCost_NegativeByLess()
        {
            //Arrange
            var currency = new Currency() {Rate = 1f};
            var cost = 0f;
            var objWithZeroCost = new SimpleObjectForRule(default, default, cost, currency);
            var filterByCost = new FilterByCost(10f, currency.Rate, true);
            
            //Act
            var negativeByLess = filterByCost.Check(objWithZeroCost);
            
            //Assert
            ClassicAssert.AreEqual(objWithZeroCost.Cost, cost);
            ClassicAssert.IsFalse(negativeByLess);
        }
        
        [Test]
        public void ByCost_NegativeByMore()
        {
            //Arrange
            var currency = new Currency() {Rate = 1f};
            var cost = 100f;
            var objWithHundredCost = new SimpleObjectForRule(default, default, cost, currency);
            var filterByCost = new FilterByCost(10f, currency.Rate, true);
            
            //Act
            var negativeByMore = filterByCost.Check(objWithHundredCost);
            
            //Assert
            ClassicAssert.AreEqual(objWithHundredCost.Cost, cost);
            ClassicAssert.IsFalse(negativeByMore);
        }
    }
}