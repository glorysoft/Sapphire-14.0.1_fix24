using System.Collections.Generic;
using System.Linq;
using AdvantShop.Core.Services.Shipping;
using AdvantShop.Core.Services.Shipping.Rules;
using AdvantShop.Shipping;
using NUnit.Framework;
using NUnit.Framework.Legacy;

namespace AdvantShop.Core.Test.ShippingRules
{
    public class ByRangeWeightTest
    {
        [Test]
        public void NegativeByNull()
        {
            //Arrange
            var objDefault = new SimpleObjectForRule();
            var filterByRangeWeight = new FilterByRangeWeight(0f, 1f, true);
            var filterByRangeWeightNegative = new FilterByRangeWeight(0f, 1f, filterIsPositive: false);
            var filterByRangeWeightNullRange = new FilterByRangeWeight(from: null, to: null, true);
            var filterByRangeWeightNullRangeNegative = new FilterByRangeWeight(from: null, to: null, filterIsPositive: false);
            
            //Act
            var negative = filterByRangeWeight.Check(objDefault);
            var negative2 = filterByRangeWeightNegative.Check(objDefault);
            var negative3 = filterByRangeWeightNullRange.Check(objDefault);
            var negative4 = filterByRangeWeightNullRangeNegative.Check(objDefault);

            //Assert
            ClassicAssert.IsNull(objDefault.CalculationParameters);
            ClassicAssert.IsNull(objDefault.CalculationParameters?.TotalWeight);
            ClassicAssert.IsNull(objDefault.CalculationParameters?.PreOrderItems);
            ClassicAssert.IsFalse(negative);
            ClassicAssert.IsFalse(negative2);
            ClassicAssert.IsFalse(negative3);
            ClassicAssert.IsFalse(negative4);
        }
        
        [Test]
        public void NegativeByTotalWeightAndPreOrderItems()
        {
            //Arrange
            var objDefault = new SimpleObjectForRule(default, default, default, default, default, new ShippingCalculationParameters());
            var filterByRangeWeight = new FilterByRangeWeight(0f, 1f, true);
            var filterByRangeWeightNegative = new FilterByRangeWeight(0f, 1f, filterIsPositive: false);
            var filterByRangeWeightNullRange = new FilterByRangeWeight(from: null, to: null, true);
            var filterByRangeWeightNullRangeNegative = new FilterByRangeWeight(from: null, to: null, filterIsPositive: false);
  
            //Act
            var negative = filterByRangeWeight.Check(objDefault);
            var negative2 = filterByRangeWeightNegative.Check(objDefault);
            var negative3 = filterByRangeWeightNullRange.Check(objDefault);
            var negative4 = filterByRangeWeightNullRangeNegative.Check(objDefault);

            //Assert
            ClassicAssert.IsNotNull(objDefault.CalculationParameters);
            ClassicAssert.IsNull(objDefault.CalculationParameters.TotalWeight);
            ClassicAssert.IsNull(objDefault.CalculationParameters.PreOrderItems);
            ClassicAssert.IsFalse(negative);
            ClassicAssert.IsFalse(negative2);
            ClassicAssert.IsFalse(negative3);
            ClassicAssert.IsFalse(negative4);
        }
        
        [Test]
        public void PositiveByNullRange()
        {
            //Arrange
            var obj = new SimpleObjectForRule(default, default, default, null, default,
                new ShippingCalculationParameters() {TotalWeight = 1f, PreOrderItems = new List<PreOrderItem>{new PreOrderItem{Weight = 1f, Amount = 1}}});
            var filterByRangeWeight = new FilterByRangeWeight(from: null, to: null, true);
            var filterByRangeWeightNegative = new FilterByRangeWeight(from: null, to: null, filterIsPositive: false);
            
            //Act
            var positive = filterByRangeWeight.Check(obj);
            var positive2 = filterByRangeWeightNegative.Check(obj);

            //Assert
            ClassicAssert.IsNotNull(obj.CalculationParameters);
            ClassicAssert.IsNotNull(obj.CalculationParameters.TotalWeight);
            ClassicAssert.IsNotNull(obj.CalculationParameters.PreOrderItems);
            ClassicAssert.IsTrue(positive);
            ClassicAssert.IsTrue(positive2);
        }
        
        [Test]
        public void PositiveByTotalWeight()
        {
            //Arrange
            var weight = 10f;
            var objWithTenWeight = new SimpleObjectForRule(default, default, default, null, default,
                new ShippingCalculationParameters() {TotalWeight = weight});
            var filterByRangeWeight = new FilterByRangeWeight(from: weight - 1f, to: weight + 1f, true);
            
            //Act
            var positiveFilter = filterByRangeWeight.Check(objWithTenWeight);
            
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
            var filterByRangeWeight = new FilterByRangeWeight(from: weight - 1f, to: weight + 1f, true);
            
            //Act
            var positiveFilter = filterByRangeWeight.Check(objWithTenWeight);
            
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
            var filterByRangeWeight = new FilterByRangeWeight(from: weight + 1f, to: weight + 2f, filterIsPositive: false);
            
            //Act
            var positiveFilter = filterByRangeWeight.Check(objWithTenWeight);
            
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
            var filterByRangeWeight = new FilterByRangeWeight(from: weight + 1f, to: weight + 2f, filterIsPositive: false);
            
            //Act
            var positiveFilter = filterByRangeWeight.Check(objWithTenWeight);
            
            //Assert
            ClassicAssert.AreEqual(objWithTenWeight.CalculationParameters.PreOrderItems.Sum(item => item.Weight), weight);
            ClassicAssert.IsTrue(positiveFilter);
        }

        [Test]
        public void PositiveByLess()
        {
            //Arrange
            var weight = 10f;
            var objWithTenWeightTotalWeight = new SimpleObjectForRule(default, default, default, null, default,
                new ShippingCalculationParameters() {TotalWeight = weight});
            var objWithTenWeightByItems = new SimpleObjectForRule(default, default, default, null, default,
                new ShippingCalculationParameters() {PreOrderItems = new List<PreOrderItem>{new PreOrderItem{Weight = weight, Amount = 1}}});
            var to = weight + 1f;
            var filterByRangeWeight = new FilterByRangeWeight(from: null, to: to, true);
            
            //Act
            var positive = filterByRangeWeight.Check(objWithTenWeightTotalWeight);
            var positive2 = filterByRangeWeight.Check(objWithTenWeightByItems);

            //Assert
            ClassicAssert.LessOrEqual(objWithTenWeightTotalWeight.CalculationParameters.TotalWeight, to);
            ClassicAssert.IsTrue(positive);
            ClassicAssert.LessOrEqual(objWithTenWeightByItems.CalculationParameters.PreOrderItems.Sum(item => item.Weight), to);
            ClassicAssert.IsTrue(positive2);
        }

        [Test]
        public void PositiveByMore()
        {
            //Arrange
            var weight = 10f;
            var objWithTenWeightByTotalWeight = new SimpleObjectForRule(default, default, default, null, default,
                new ShippingCalculationParameters() {TotalWeight = weight});
            var objWithTenWeightByItems = new SimpleObjectForRule(default, default, default, null, default,
                new ShippingCalculationParameters() {PreOrderItems = new List<PreOrderItem>{new PreOrderItem{Weight = weight, Amount = 1}}});
            var from = weight - 1f;
            var filterByRangeWeight = new FilterByRangeWeight(from: from, to: null, true);
            
            //Act
            var positive = filterByRangeWeight.Check(objWithTenWeightByTotalWeight);
            var positive2 = filterByRangeWeight.Check(objWithTenWeightByItems);
        
            //Assert
            ClassicAssert.GreaterOrEqual(objWithTenWeightByTotalWeight.CalculationParameters.TotalWeight, from);
            ClassicAssert.IsTrue(positive);
            ClassicAssert.GreaterOrEqual(objWithTenWeightByItems.CalculationParameters.PreOrderItems.Sum(item => item.Weight), from);
            ClassicAssert.IsTrue(positive2);
        }

        [Test]
        public void NegativeByLess()
        {
            //Arrange
            var weight = 10f;
            var objWithTenWeightTotalWeight = new SimpleObjectForRule(default, default, default, null, default,
                new ShippingCalculationParameters() {TotalWeight = weight});
            var objWithTenWeightByItems = new SimpleObjectForRule(default, default, default, null, default,
                new ShippingCalculationParameters() {PreOrderItems = new List<PreOrderItem>{new PreOrderItem{Weight = weight, Amount = 1}}});
            var to = weight - 1f;
            var filterByRangeWeight = new FilterByRangeWeight(from: null, to: to, true);
            
            //Act
            var negative = filterByRangeWeight.Check(objWithTenWeightTotalWeight);
            var negative2 = filterByRangeWeight.Check(objWithTenWeightByItems);

            //Assert
            ClassicAssert.Greater(objWithTenWeightTotalWeight.CalculationParameters.TotalWeight, to);
            ClassicAssert.IsFalse(negative);
            ClassicAssert.Greater(objWithTenWeightByItems.CalculationParameters.PreOrderItems.Sum(item => item.Weight), to);
            ClassicAssert.IsFalse(negative2);
        }

        [Test]
        public void NegativeByMore()
        {
            //Arrange
            var weight = 10f;
            var objWithTenWeightByTotalWeight = new SimpleObjectForRule(default, default, default, null, default,
                new ShippingCalculationParameters() {TotalWeight = weight});
            var objWithTenWeightByItems = new SimpleObjectForRule(default, default, default, null, default,
                new ShippingCalculationParameters() {PreOrderItems = new List<PreOrderItem>{new PreOrderItem{Weight = weight, Amount = 1}}});
            var from = weight + 1f;
            var filterByRangeWeight = new FilterByRangeWeight(from: from, to: null, true);
            
            //Act
            var negative = filterByRangeWeight.Check(objWithTenWeightByTotalWeight);
            var negative2 = filterByRangeWeight.Check(objWithTenWeightByItems);
        
            //Assert
            ClassicAssert.Less(objWithTenWeightByTotalWeight.CalculationParameters.TotalWeight, from);
            ClassicAssert.IsFalse(negative);
            ClassicAssert.Less(objWithTenWeightByItems.CalculationParameters.PreOrderItems.Sum(item => item.Weight), from);
            ClassicAssert.IsFalse(negative2);
        }

        [Test]
        public void NegativeByInvertLess()
        {
            //Arrange
            var weight = 10f;
            var objWithTenWeightTotalWeight = new SimpleObjectForRule(default, default, default, null, default,
                new ShippingCalculationParameters() {TotalWeight = weight});
            var objWithTenWeightByItems = new SimpleObjectForRule(default, default, default, null, default,
                new ShippingCalculationParameters() {PreOrderItems = new List<PreOrderItem>{new PreOrderItem{Weight = weight, Amount = 1}}});
            var to = weight + 1f;
            var filterByRangeWeight = new FilterByRangeWeight(from: null, to: to, false);
            
            //Act
            var negative = filterByRangeWeight.Check(objWithTenWeightTotalWeight);
            var negative2 = filterByRangeWeight.Check(objWithTenWeightByItems);

            //Assert
            ClassicAssert.LessOrEqual(objWithTenWeightTotalWeight.CalculationParameters.TotalWeight, to);
            ClassicAssert.IsFalse(negative);
            ClassicAssert.LessOrEqual(objWithTenWeightByItems.CalculationParameters.PreOrderItems.Sum(item => item.Weight), to);
            ClassicAssert.IsFalse(negative2);
        }

        [Test]
        public void NegativeByInvertMore()
        {
            //Arrange
            var weight = 10f;
            var objWithTenWeightByTotalWeight = new SimpleObjectForRule(default, default, default, null, default,
                new ShippingCalculationParameters() {TotalWeight = weight});
            var objWithTenWeightByItems = new SimpleObjectForRule(default, default, default, null, default,
                new ShippingCalculationParameters() {PreOrderItems = new List<PreOrderItem>{new PreOrderItem{Weight = weight, Amount = 1}}});
            var from = weight - 1f;
            var filterByRangeWeight = new FilterByRangeWeight(from: from, to: null, false);
            
            //Act
            var negative = filterByRangeWeight.Check(objWithTenWeightByTotalWeight);
            var negative2 = filterByRangeWeight.Check(objWithTenWeightByItems);
        
            //Assert
            ClassicAssert.GreaterOrEqual(objWithTenWeightByTotalWeight.CalculationParameters.TotalWeight, from);
            ClassicAssert.IsFalse(negative);
            ClassicAssert.GreaterOrEqual(objWithTenWeightByItems.CalculationParameters.PreOrderItems.Sum(item => item.Weight), from);
            ClassicAssert.IsFalse(negative2);
        }
    }
}