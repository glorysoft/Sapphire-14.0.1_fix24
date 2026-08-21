using System;
using System.Globalization;
using AdvantShop.Catalog;
using AdvantShop.Customers;
using NUnit.Framework;
using NUnit.Framework.Legacy;

namespace AdvantShop.Core.Test.Services.Catalog
{
    public static class CouponServiceTests
    {
        private const string OnEmptyBirthdayExceptionText = "onEmptyBirthdayExceptionText";
        private const string OnlyOnCustomerBirthdayExceptionText = "onlyOnCustomerBirthdayExceptionText";
        private const string OnlyOnDatesExceptionText = "onlyOnDatesExceptionText";
        
        [Test]
        // Диапазон через Новый год
        [TestCase(null, "31.12.2026", "01.01.1991", 1, 1, true)]
        [TestCase(null, "01.01.2026", "01.01.1991", 1, 1, true)]
        [TestCase(null, "02.01.2026", "01.01.1991", 1, 1, true)]
        [TestCase(OnlyOnDatesExceptionText, "03.01.2026", "01.01.1991", 1, 1, true)]
        // Диапазон в начале года
        [TestCase(null, "02.01.2026", "03.01.1991", 1, 0, true)]
        [TestCase(null, "03.01.2026", "03.01.1991", 1, 0, true)]
        [TestCase(OnlyOnDatesExceptionText, "04.01.2026", "03.01.1991", 1, 0, true)]
        // Диапазон в конце года
        [TestCase(null, "30.12.2026", "31.12.1991", 1, 0, true)]
        [TestCase(null, "31.12.2026", "31.12.1991", 1, 0, true)]
        [TestCase(OnlyOnDatesExceptionText, "01.01.2026", "31.12.1991", 1, 0, true)]
        // Только в день рождения
        [TestCase(null, "01.01.2026", "01.01.1991", null, null, true)]
        [TestCase(OnlyOnCustomerBirthdayExceptionText, "02.01.2026", "01.01.1991", null, null, true)]
        [TestCase(null, "10.05.2026", "10.05.1991", 0, 0, true)]
        [TestCase(OnlyOnCustomerBirthdayExceptionText, "11.05.2026", "10.05.1991", 0, 0, true)]
        // Без флага OnlyOnCustomerBirthday
        [TestCase(null, "01.01.2026", "01.01.1991", 5, 5, false)]
        [TestCase(null, "15.07.2026", null, 5, 5, false)]
        // Нет у пользователя записи о дне рождения
        [TestCase(OnEmptyBirthdayExceptionText, "01.01.2026", null, 0, 0, true)]
        public static void Should_ValidateCustomerBirthdayCoupon_Correctly(
            string expectedResult,
            string currentDateText,
            string birthdayText,
            int? daysBeforeBirthday,
            int? daysAfterBirthday,
            bool onlyOnCustomerBirthday
        )
        {
            var currentDate = DateTime.ParseExact(
                currentDateText,
                "dd.MM.yyyy",
                CultureInfo.InvariantCulture
            );
            DateTime? birthday = null;
            if (!string.IsNullOrWhiteSpace(birthdayText))
                birthday = DateTime.Parse(birthdayText);
            
            var result = CouponService.CheckCustomerCouponByBirthday(
                new Coupon
                {
                    OnlyOnCustomerBirthday = onlyOnCustomerBirthday,
                    DaysBeforeBirthday = daysBeforeBirthday,
                    DaysAfterBirthday = daysAfterBirthday,
                },
                new Customer
                {
                    BirthDay = birthday,
                },
                currentDate,
                OnEmptyBirthdayExceptionText,
                OnlyOnCustomerBirthdayExceptionText,
                OnlyOnDatesExceptionText
            );
            
            ClassicAssert.AreEqual(expectedResult, result);
        }
    }
}