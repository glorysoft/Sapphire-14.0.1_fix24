using System.Collections.Generic;
using System.Linq;
using AdvantShop.Core.Services.Shipping;
using AdvantShop.Core.Services.Shipping.Rules;
using AdvantShop.Shipping;
using NUnit.Framework;
using NUnit.Framework.Legacy;

namespace AdvantShop.Core.Test.ShippingRules
{
    public class ByWeightTest
    {
        [Test]
        public void NegativeByNull()
        {
            //Arrange
            var objWithNullCost = new SimpleObjectForRule();
            var filterByZero = new FilterByWeight(0f, true);
            var filterByNegativeValue = new FilterByWeight(-10f, true);
            var filterByPositiveValue = new FilterByWeight(10f, true);
            var filterByZeroInvert = new FilterByWeight(0f, false);
            var filterByNegativeValueInvert = new FilterByWeight(-10f, false);
            var filterByPositiveValueInvert = new FilterByWeight(10f, false);
            
            //Act
            var negativeByZero = filterByZero.Check(objWithNullCost);
            var negativeByNegativeValue = filterByNegativeValue.Check(objWithNullCost);
            var negativeByPositiveValue = filterByPositiveValue.Check(objWithNullCost);
            var negativeByZeroInvert = filterByZeroInvert.Check(objWithNullCost);
            var negativeByNegativeValueInvert = filterByNegativeValueInvert.Check(objWithNullCost);
            var negativeByPositiveValueInvert = filterByPositiveValueInvert.Check(objWithNullCost);
            
            //Assert
            ClassicAssert.IsNull(objWithNullCost.CalculationParameters?.TotalWeight);
            ClassicAssert.IsNull(objWithNullCost.CalculationParameters?.PreOrderItems);
            ClassicAssert.IsFalse(negativeByZero);
            ClassicAssert.IsFalse(negativeByNegativeValue);
            ClassicAssert.IsFalse(negativeByPositiveValue);
            ClassicAssert.IsFalse(negativeByZeroInvert);
            ClassicAssert.IsFalse(negativeByNegativeValueInvert);
            ClassicAssert.IsFalse(negativeByPositiveValueInvert);
        }
        
        [Test]
        public void PositiveByTotalWeight()
        {
            //Arrange
            var weight = 10f;
            var objWithTenWeight = new SimpleObjectForRule(default, default, default, null, default,
                new ShippingCalculationParameters() {TotalWeight = weight});
            var filterByWeight = new FilterByWeight(weight, true);
            
            //Act
            var positiveFilter = filterByWeight.Check(objWithTenWeight);
            
            //Assert
            ClassicAssert.AreEqual(objWithTenWeight.CalculationParameters.TotalWeight, weight);
            ClassicAssert.IsTrue(positiveFilter);
        }
        
        [Test]
        public void PositiveByItems()
        {
            //Arrange
            var weight = 10f;
            var objWithTenWeight = new SimpleObjectForRule(default, default, default, null, default,
                new ShippingCalculationParameters() {PreOrderItems = new List<PreOrderItem>{new PreOrderItem{Weight = weight, Amount = 1}}});
            var filterByWeight = new FilterByWeight(weight, true);
            
            //Act
            var positiveFilter = filterByWeight.Check(objWithTenWeight);
            
            //Assert
            ClassicAssert.AreEqual(objWithTenWeight.CalculationParameters.PreOrderItems.Sum(item => item.Weight), weight);
            ClassicAssert.IsTrue(positiveFilter);
        }
        
        [Test]
        public void PositiveInvertByTotalWeight()
        {
            //Arrange
            var weight = 10f;
            var objWithTenWeight = new SimpleObjectForRule(default, default, default, null, default,
                new ShippingCalculationParameters() {TotalWeight = weight});
            var filterByWeight = new FilterByWeight(weight - 1f, filterIsPositive: false);
            
            //Act
            var positiveFilter = filterByWeight.Check(objWithTenWeight);
            
            //Assert
            ClassicAssert.AreEqual(objWithTenWeight.CalculationParameters.TotalWeight, weight);
            ClassicAssert.IsTrue(positiveFilter);
        }
        
        [Test]
        public void PositiveInvertByItems()
        {
            //Arrange
            var weight = 10f;
            var objWithTenWeight = new SimpleObjectForRule(default, default, default, null, default,
                new ShippingCalculationParameters() {PreOrderItems = new List<PreOrderItem>{new PreOrderItem{Weight = weight, Amount = 1}}});
            var filterByWeight = new FilterByWeight(weight - 1f, filterIsPositive: false);
            
            //Act
            var positiveFilter = filterByWeight.Check(objWithTenWeight);
            
            //Assert
            ClassicAssert.AreEqual(objWithTenWeight.CalculationParameters.PreOrderItems.Sum(item => item.Weight), weight);
            ClassicAssert.IsTrue(positiveFilter);
        }
        
        [Test]
        public void NegativeByTotalWeight()
        {
            //Arrange
            var weight = 10f;
            var objWithTenWeight = new SimpleObjectForRule(default, default, default, null, default,
                new ShippingCalculationParameters() {TotalWeight = weight});
            var filterByWeight = new FilterByWeight(weight - 1, true);
            
            //Act
            var negativeFilter = filterByWeight.Check(objWithTenWeight);
            
            //Assert
            ClassicAssert.AreEqual(objWithTenWeight.CalculationParameters.TotalWeight, weight);
            ClassicAssert.IsFalse(negativeFilter);
        }
        
        [Test]
        public void NegativeByItems()
        {
            //Arrange
            var weight = 10f;
            var objWithTenWeight = new SimpleObjectForRule(default, default, default, null, default,
                new ShippingCalculationParameters() {PreOrderItems = new List<PreOrderItem>{new PreOrderItem{Weight = weight, Amount = 1}}});
            var filterByWeight = new FilterByWeight(weight - 1, true);
            
            //Act
            var negativeFilter = filterByWeight.Check(objWithTenWeight);
            
            //Assert
            ClassicAssert.AreEqual(objWithTenWeight.CalculationParameters.PreOrderItems.Sum(item => item.Weight), weight);
            ClassicAssert.IsFalse(negativeFilter);
        }
        
        [Test]
        public void NegativeInvertByTotalWeight()
        {
            //Arrange
            var weight = 10f;
            var objWithTenWeight = new SimpleObjectForRule(default, default, default, null, default,
                new ShippingCalculationParameters() {TotalWeight = weight});
            var filterByWeight = new FilterByWeight(weight, filterIsPositive: false);
            
            //Act
            var negativeFilter = filterByWeight.Check(objWithTenWeight);
            
            //Assert
            ClassicAssert.AreEqual(objWithTenWeight.CalculationParameters.TotalWeight, weight);
            ClassicAssert.IsFalse(negativeFilter);
        }
        
        [Test]
        public void NegativeInvertByItems()
        {
            //Arrange
            var weight = 10f;
            var objWithTenWeight = new SimpleObjectForRule(default, default, default, null, default,
                new ShippingCalculationParameters() {PreOrderItems = new List<PreOrderItem>{new PreOrderItem{Weight = weight, Amount = 1}}});
            var filterByWeight = new FilterByWeight(weight, filterIsPositive: false);
            
            //Act
            var negativeFilter = filterByWeight.Check(objWithTenWeight);
            
            //Assert
            ClassicAssert.AreEqual(objWithTenWeight.CalculationParameters.PreOrderItems.Sum(item => item.Weight), weight);
            ClassicAssert.IsFalse(negativeFilter);
        }
    }
}