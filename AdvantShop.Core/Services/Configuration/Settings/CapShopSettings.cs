using System;
using System.Globalization;

namespace AdvantShop.Core.Services.Configuration.Settings
{
    public class CapShopSettings
    {
        private const string DateTimePattern = "dd.MM.yyyy HH:mm:ss";

        public static string FromEmail => CapSettingProvider.Items["FromEmail"];

        //set { CapSettingProvider.Items["FromEmail"] = value; }
        public static string FromName => CapSettingProvider.Items["FromName"];

        //set { CapSettingProvider.Items["FromName"] = value; }
        public static string FromSms => CapSettingProvider.Items["FromSms"];

        //set { CapSettingProvider.Items["FromSms"] = value; }
        public static DateTime? ConfirmDate
        {
            get
            {
                var value = CapSettingProvider.Items["ConfirmDate"];
                return DateTime.TryParseExact(value, DateTimePattern, CultureInfo.InvariantCulture, DateTimeStyles.None,
                    out var time)
                    ? time
                    : (DateTime?)null;
            }
        }

        //set { CapSettingProvider.Items["ConfirmDate"] = value.HasValue ? value.Value.ToString(dateTimePattern) : ""; }
        public static string HtmlMessage => CapSettingProvider.Items["HtmlMessage"];
    }
}