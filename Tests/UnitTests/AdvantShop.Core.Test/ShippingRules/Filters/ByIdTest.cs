using AdvantShop.Core.Services.Shipping.Rules;
using NUnit.Framework;
using NUnit.Framework.Legacy;

namespace AdvantShop.Core.Test.ShippingRules
{
    public class ByIdTest
    {
        [Test]
        public void ById_NegativeByEmpty()
        {
            //Arrange
            var obj = new SimpleObjectForRule();
            var filterByEmpty = new FilterById(new int[]{}, true);
            
            //Act
            var negativeByEmpty = filterByEmpty.Check(obj);
            
            //Assert
            ClassicAssert.IsFalse(negativeByEmpty);
        }
        
        [Test]
        public void ById_PositiveByEmpty()
        {
            //Arrange
            var obj = new SimpleObjectForRule();
            var filterByEmpty = new FilterById(new int[]{}, false);
            
            //Act
            var positiveByEmpty = filterByEmpty.Check(obj);
            
            //Assert
            ClassicAssert.IsTrue(positiveByEmpty);
        }
  
        [Test]
        public void ById_Negative()
        {
            //Arrange
            var obj = new SimpleObjectForRule(1, default, default, null);
            var filterById = new FilterById(new int[]{2}, filterIsPositive: true);
            
            //Act
            var negative = filterById.Check(obj);
            
            //Assert
            ClassicAssert.IsFalse(negative);
        }
  
        [Test]
        public void ById_NegativeByInvert()
        {
            //Arrange
            var obj = new SimpleObjectForRule(1, default, default, null);
            var filterById = new FilterById(new int[]{1}, filterIsPositive: false);
            
            //Act
            var negative = filterById.Check(obj);
            
            //Assert
            ClassicAssert.IsFalse(negative);
        }
  
        [Test]
        public void ById_Positive()
        {
            //Arrange
            var obj = new SimpleObjectForRule(1, default, default, null);
            var filterById = new FilterById(new int[]{1}, filterIsPositive: true);
            
            //Act
            var positive = filterById.Check(obj);
            
            //Assert
            ClassicAssert.IsTrue(positive);
        }
  
        [Test]
        public void ById_PositiveByInvert()
        {
            //Arrange
            var obj = new SimpleObjectForRule(1, default, default, null);
            var filterById = new FilterById(new int[]{2}, filterIsPositive: false);
            
            //Act
            var positive = filterById.Check(obj);
            
            //Assert
            ClassicAssert.IsTrue(positive);
        }
        
    }
}