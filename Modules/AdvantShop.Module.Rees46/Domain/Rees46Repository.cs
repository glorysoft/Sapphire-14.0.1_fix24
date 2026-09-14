using AdvantShop.Configuration;
using AdvantShop.Core.Modules;
using AdvantShop.Diagnostics;
using AdvantShop.Helpers;
using System;
using System.IO;

namespace AdvantShop.Module.Rees46.Domain
{
    public class Rees46Repository
    {
        public static bool InstallModule()
        {
            return UpdateModule();
        }

        public static bool UninstallModule()
        {
            FileHelpers.DeleteFile(SettingsGeneral.AbsolutePath.Trim('\\') + "\\manifest.json");
            return true;
        }

        public static bool UpdateModule()
        {          
            UpdateSettings();
            return WriteManifestJson();
        }

        private static void UpdateSettings()
        {
            if (!ModuleSettingsProvider.IsSqlSettingExist("PathFilePushSW", Rees46.ModuleStringId))
                Rees46Settings.PathFilePushSW = SettingsMain.SiteUrl.Trim('/') + "/modules/rees46/js/push_sw.js";
            if (!ModuleSettingsProvider.IsSqlSettingExist("Limit", Rees46.ModuleStringId))
                Rees46Settings.Limit = 8;

            if (string.IsNullOrWhiteSpace(Rees46Settings.Url))
                Rees46Settings.Url = "https://app.rees46.ru";
        }

        public static bool WriteManifestJson()
        {
            try
            {
                var filename = SettingsGeneral.AbsolutePath.Trim('\\') + "\\manifest.json";
                if (!File.Exists(filename))
                {
                    FileHelpers.CreateFile(filename);
                    var text = "{\n\t\"name\": \"REES46\",\n\t\"gcm_sender_id\": \"605730184710\"\n}";
                    using (var wr = new StreamWriter(filename))
                    {
                        wr.Write(text);
                    }
                }
                return true;
            }
            catch (Exception ex)
            {
                Debug.Log.Error(ex);
                return false;
            }
        }
    }
}
