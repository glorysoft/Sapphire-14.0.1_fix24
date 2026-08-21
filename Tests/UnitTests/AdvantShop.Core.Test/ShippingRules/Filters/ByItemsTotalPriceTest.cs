using AdvantShop.Core.Services.Shipping;
using AdvantShop.Core.Services.Shipping.Rules;
using AdvantShop.Repository.Currencies;
using NUnit.Framework;
using NUnit.Framework.Legacy;

namespace AdvantShop.Core.Test.ShippingRules
{
    public class FilterByItemsTotalPriceTest
    {
        [Test]
        public void NegativeByNull()
        {
            //Arrange
            var objWithNullCost = new SimpleObjectForRule();
            var filterByZero = new FilterByItemsTotalPrice(0f, 1f, true);
            var filterByNegativeValue = new FilterByItemsTotalPrice(-10f, 1f, true);
            var filterByPositiveValue = new FilterByItemsTotalPrice(10f, 1f, true);
            
            //Act
            var negativeByZero = filterByZero.Check(objWithNullCost);
            var negativeByNegativeValue = filterByNegativeValue.Check(objWithNullCost);
            var negativeByPositiveValue = filterByPositiveValue.Check(objWithNullCost);
            
            //Assert
            ClassicAssert.IsNull(objWithNullCost.CalculationParameters?.ItemsTotalPriceWithDiscounts);
            ClassicAssert.IsFalse(negativeByZero);
            ClassicAssert.IsFalse(negativeByNegativeValue);
            ClassicAssert.IsFalse(negativeByPositiveValue);
        }

        [Test]
        public void Positive()
        {
            //Arrange
            var currency = new Currency() {Rate = 1f};
            var totalPrice = 10f;
            var objWithTenTotalPrice = new SimpleObjectForRule(default, default, default, null, default,
                new ShippingCalculationParameters() {ItemsTotalPriceWithDiscounts = totalPrice, Currency = currency});
            var filterByItemsTotalPrice = new FilterByItemsTotalPrice(totalPrice, currency.Rate, true);
            
            //Act
            var positiveFilter = filterByItemsTotalPrice.Check(objWithTenTotalPrice);
            
            //Assert
            ClassicAssert.AreEqual(objWithTenTotalPrice.CalculationParameters.ItemsTotalPriceWithDiscounts, totalPrice);
            ClassicAssert.IsTrue(positiveFilter);
        }

        [Test]
        public void PositiveByMultiCurrency()
        {
            //Arrange
            var totalPriceInCurrencyObject = 10f;
            var currencyOfObject = new Currency() {Rate = 1f};
            var objWithTenTotalPrice = new SimpleObjectForRule(default, default, default, null, default,
                new ShippingCalculationParameters() {ItemsTotalPriceWithDiscounts = totalPriceInCurrencyObject, Currency = currencyOfObject});
            var currencyOfFilter= new Currency() {Rate = 2f};
            var filterByItemsTotalPrice = new FilterByItemsTotalPrice(5f, currencyOfFilter.Rate, true);
            
            //Act
            var positiveFilter = filterByItemsTotalPrice.Check(objWithTenTotalPrice);
            
            //Assert
            ClassicAssert.AreNotEqual(currencyOfObject.Rate, currencyOfFilter.Rate);
            ClassicAssert.AreEqual(objWithTenTotalPrice.CalculationParameters.ItemsTotalPriceWithDiscounts, totalPriceInCurrencyObject);
            ClassicAssert.IsTrue(positiveFilter);
        }
   
        [Test]
        public void NegativeByNullCurrency()
        {
            //Arrange
            var totalPrice = 10f;
            var objWithTenTotalPrice = new SimpleObjectForRule(default, default, default, null, default,
                new ShippingCalculationParameters() {ItemsTotalPriceWithDiscounts = totalPrice, Currency = null});
            var filterByItemsTotalPrice = new FilterByItemsTotalPrice(totalPrice, 1f, true);
            
            //Act
            var negativeFilter = filterByItemsTotalPrice.Check(objWithTenTotalPrice);
            
            //Assert
            ClassicAssert.IsNull(objWithTenTotalPrice.CalculationParameters.Currency);
            ClassicAssert.AreEqual(objWithTenTotalPrice.CalculationParameters.ItemsTotalPriceWithDiscounts, totalPrice);
            ClassicAssert.IsFalse(negativeFilter);
        }
     
        [Test]
        public void NegativeByLess()
        {
            //Arrange
            var currency = new Currency() {Rate = 1f};
            var totalPrice = 0f;
            var objWithZeroTotalPrice = new SimpleObjectForRule(default, default, default, null, default,
                new ShippingCalculationParameters() {ItemsTotalPriceWithDiscounts = totalPrice, Currency = currency});
            var filterByItemsTotalPrice = new FilterByItemsTotalPrice(10f, currency.Rate, true);
            
            //Act
            var negativeByLess = filterByItemsTotalPrice.Check(objWithZeroTotalPrice);
            
            //Assert
            ClassicAssert.AreEqual(objWithZeroTotalPrice.CalculationParameters.ItemsTotalPriceWithDiscounts, totalPrice);
            ClassicAssert.IsFalse(negativeByLess);
        }
        
        [Test]
        public void NegativeByMore()
        {
            //Arrange
            var currency = new Currency() {Rate = 1f};
            var totalPrice = 100f;
            var objWithHundredCost = new SimpleObjectForRule(default, default, default, null, default,
                new ShippingCalculationParameters() {ItemsTotalPriceWithDiscounts = totalPrice, Currency = currency});
            var filterByItemsTotalPrice = new FilterByItemsTotalPrice(10f, currency.Rate, true);
            
            //Act
            var negativeByMore = filterByItemsTotalPrice.Check(objWithHundredCost);
            
            //Assert
            ClassicAssert.AreEqual(objWithHundredCost.CalculationParameters.ItemsTotalPriceWithDiscounts, totalPrice);
            ClassicAssert.IsFalse(negativeByMore);
        }
    }
}