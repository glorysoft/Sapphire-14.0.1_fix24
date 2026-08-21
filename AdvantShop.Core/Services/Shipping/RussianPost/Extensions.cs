using AdvantShop.Core.Common.Extensions;
using AdvantShop.Shipping.RussianPost.Api;

namespace AdvantShop.Shipping.RussianPost
{
    public static class Extensions
    {
        public static string AddressFromStreet(this Address address)
        {
            return string.Format("{0}{1}{2}{3}", 
                address.Street, 
                address.House.IsNotEmpty() ? ", " + address.House : null,
                address.Corpus.IsNotEmpty() ? " к " + address.Corpus : null,
                address.Building.IsNotEmpty() ? " стр " + address.Building : null);
        }

        public static string AddressFromLocation(this Address address)
        {
            return string.Format("{0}{1}{2}{3}{4}{5}", 
                address.Location, 
                address.Location.IsNotEmpty() ? ", " : null,
                address.Street, 
                address.House.IsNotEmpty() ? ", " + address.House : null,
                address.Corpus.IsNotEmpty() ? " к " + address.Corpus : null,
                address.Building.IsNotEmpty() ? " стр " + address.Building : null);
        }

        //public static string Localize<T>(this T enumValue)
        //    where T: StringEnum<T>
        //{
        //    return AttributeHelper.GetAttributeValueProperty<LocalizeAttribute, string>(enumValue) ?? enumValue.Value;
        //}

        public static RussianPostPoint SetDimensionLimit(this RussianPostPoint point, EnDimensionType dimensionLimit)
        {
            if (dimensionLimit is null)
                return point;

            if (dimensionLimit == EnDimensionType.S)
            {
                point.MaxHeightInMillimeters = 80;
                point.MaxWidthInMillimeters = 170;
                point.MaxLengthInMillimeters = 260;
            }
            if (dimensionLimit == EnDimensionType.M)
            {
                point.MaxHeightInMillimeters = 150;
                point.MaxWidthInMillimeters = 200;
                point.MaxLengthInMillimeters = 300;
            }
            if (dimensionLimit == EnDimensionType.L)
            {
                point.MaxHeightInMillimeters = 180;
                point.MaxWidthInMillimeters = 270;
                point.MaxLengthInMillimeters = 400;
            }
            if (dimensionLimit == EnDimensionType.XL)
            {
                point.MaxHeightInMillimeters = 220;
                point.MaxWidthInMillimeters = 360;
                point.MaxLengthInMillimeters = 530;
            }
            if (dimensionLimit == EnDimensionType.Oversized)
            {
                point.MaxHeightInMillimeters = 600;
                point.MaxWidthInMillimeters = 600;
                point.MaxLengthInMillimeters = 600;
                point.DimensionSumInMillimeters = 1400;
            }
            
            return point;
        }
    }
}
