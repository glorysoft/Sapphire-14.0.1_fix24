using System;
using AdvantShop.Core.Services.Shipping.Rules;
using NUnit.Framework;
using NUnit.Framework.Legacy;

namespace AdvantShop.Core.Test.ShippingRules
{
    public class ByTypeTest
    {
        [Test]
        public void ByType_NegativeByEmpty()
        {
            //Arrange
            var obj = new SimpleObjectForRule();
            var filterByEmpty = new FilterByType(new string[]{}, true);
            
            //Act
            var negativeByEmpty = filterByEmpty.Check(obj);
            
            //Assert
            ClassicAssert.IsFalse(negativeByEmpty);
        }
        
        [Test]
        public void ByType_PositiveByEmpty()
        {
            //Arrange
            var obj = new SimpleObjectForRule();
            var filterByEmpty = new FilterByType(new string[]{}, false);
            
            //Act
            var positiveByEmpty = filterByEmpty.Check(obj);
            
            //Assert
            ClassicAssert.IsTrue(positiveByEmpty);
        }
  
        [Test]
        public void ByType_Negative()
        {
            //Arrange
            var obj = new SimpleObjectForRule(default, "test-type", default, null);
            var filterById = new FilterByType(new string[]{"other-type"}, filterIsPositive: true);
            
            //Act
            var negative = filterById.Check(obj);
            
            //Assert
            ClassicAssert.IsFalse(negative);
        }
  
        [Test]
        public void ByType_NegativeByInvert()
        {
            //Arrange
            var type = "test-type";
            var obj = new SimpleObjectForRule(default, type, default, null);
            var filterById = new FilterByType(new string[]{type}, filterIsPositive: false);
            
            //Act
            var negative = filterById.Check(obj);
            
            //Assert
            ClassicAssert.IsFalse(negative);
        }
  
        [Test]
        public void ByType_Positive()
        {
            //Arrange
            var type = "test-type";
            var obj = new SimpleObjectForRule(default, type, default, null);
            var filterById = new FilterByType(new string[]{type}, filterIsPositive: true);
            
            //Act
            var positive = filterById.Check(obj);
            
            //Assert
            ClassicAssert.IsTrue(positive);
        }
  
        [Test]
        public void ByType_PositiveByInvert()
        {
            //Arrange
            var obj = new SimpleObjectForRule(default, "test-type", default, null);
            var filterById = new FilterByType(new string[]{"other-type"}, filterIsPositive: false);
            
            //Act
            var positive = filterById.Check(obj);
            
            //Assert
            ClassicAssert.IsTrue(positive);
        }
  
        [Test]
        public void ByType_PositiveByComparer()
        {
            //Arrange
            var type = "test-type";
            var obj = new SimpleObjectForRule(default, type, default, null);
            var filterById = new FilterByType(new string[]{type}, StringComparer.Ordinal, filterIsPositive: true);
            
            //Act
            var positive = filterById.Check(obj);
            
            //Assert
            ClassicAssert.IsTrue(positive);
        }
  
        [Test]
        public void ByType_PositiveByIgnoreCaseComparer()
        {
            //Arrange
            var type = "test-type";
            var typeUpper = "TEST-TYPE";
            var obj = new SimpleObjectForRule(default, type, default, null);
            var filterById = new FilterByType(new string[]{typeUpper}, StringComparer.OrdinalIgnoreCase, filterIsPositive: true);
            
            //Act
            var positive = filterById.Check(obj);
            
            //Assert
            ClassicAssert.IsTrue(positive);
        }
  
        [Test]
        public void ByType_NegativeByCaseComparer()
        {
            //Arrange
            var type = "test-type";
            var typeUpper = type.ToUpper();
            var obj = new SimpleObjectForRule(default, type, default, null);
            var filterById = new FilterByType(new string[]{typeUpper}, StringComparer.Ordinal, filterIsPositive: true);
            
            //Act
            var negative = filterById.Check(obj);
            
            //Assert
            ClassicAssert.IsFalse(negative);
        }
     
    }
}