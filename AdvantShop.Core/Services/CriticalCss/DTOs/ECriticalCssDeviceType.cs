using AdvantShop.CriticalCss.Enums;

namespace AdvantShop.CriticalCss.DTOs
{
    public enum ECriticalCssDeviceType
    {
        Desktop,
        IPhone,
        Android,
    }

    public static class ECriticalCssDeviceTypeHelper
    {
        public static ECriticalCssDeviceType FromCriticalCssDevice(CriticalCssDevice device)
        {
            switch (device)
            {
                case CriticalCssDevice.Desktop:
                    return ECriticalCssDeviceType.Desktop;
                case CriticalCssDevice.Mobile:
                    return ECriticalCssDeviceType.IPhone;
                default:
                    return ECriticalCssDeviceType.Desktop;
            }
        }
    }
}