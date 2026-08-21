using System;
using System.Collections.Generic;
using System.Linq;
using AdvantShop.Core.Common.Extensions;
using AdvantShop.Core.Modules;
using AdvantShop.Core.Modules.Interfaces;
using AdvantShop.Core.Services.Auth;
using AdvantShop.Core.Services.Auth.Emails;
using AdvantShop.Helpers;
using Newtonsoft.Json;

namespace AdvantShop.Configuration
{
    public static class SettingsAuth
    {
        #region Email

        public static EEmailAuthType EmailAuthType
        {
            get
            {
                var type = SettingProvider.Items["EmailAuthType"].TryParseEnum(EEmailAuthType.Password);

                if (type == EEmailAuthType.Code && !SettingsMail.IsMailServiceEnabled)
                    type = EEmailAuthType.Password;
                
                return type;
            }
            set => SettingProvider.Items["EmailAuthType"] = value.ToString();
        }

        #endregion
        
        #region Code

        public static bool AuthByCodeActive
        {
            get => SQLDataHelper.GetBoolean(SettingProvider.Items["OpenIdProviderAuthByCodeActive"]);
            set => SettingProvider.Items["OpenIdProviderAuthByCodeActive"] = value.ToString();
        }

        public static EAuthByCodeMode AuthByCodeMethod
        {
            get
            {
                if (SQLDataHelper.GetInt(SettingProvider.Items["OpenIdProviderAuthByCodeMethod"]) == 0)
                    return EAuthByCodeMode.Sms;

                return (EAuthByCodeMode)SQLDataHelper.GetInt(SettingProvider.Items["OpenIdProviderAuthByCodeMethod"]);
            }
            set => SettingProvider.Items["OpenIdProviderAuthByCodeMethod"] = ((int)value).ToString();
        }

        #endregion

        #region Modules
        
        private static List<IModuleAuthorization> GetAuthModules() => 
            AttachedModules.GetModules<IModuleAuthorization>()
                .Select(type => (IModuleAuthorization)Activator.CreateInstance(type, null))
                .ToList();

        public static bool UseAuthModules
        {
            get => SQLDataHelper.GetBoolean(SettingProvider.Items["UseAuthModules"]);
            set => SettingProvider.Items["UseAuthModules"] = value.ToString();
        }

        public static string DefaultAuthModuleId
        {
            get
            {
                var moduleStringId = SettingProvider.Items["DefaultAuthModuleId"];
                
                var defaultModuleStringId = EnabledAuthModuleIds?.FirstOrDefault(enabledAuthModuleId =>
                    enabledAuthModuleId.Equals(moduleStringId, StringComparison.OrdinalIgnoreCase)
                ) ?? string.Empty;

                if (string.IsNullOrWhiteSpace(defaultModuleStringId))
                    SettingProvider.Items["DefaultAuthModuleId"] = string.Empty;

                return defaultModuleStringId;
            }
            set => SettingProvider.Items["DefaultAuthModuleId"] = value;
        }

        public static List<string> EnabledAuthModuleIds
        {
            get
            {
                var modulesIdsValue = SettingProvider.Items["EnabledAuthModulesIds"];
                if (string.IsNullOrEmpty(modulesIdsValue))
                    return new List<string>();

                var modulesIds = JsonConvert.DeserializeObject<List<string>>(modulesIdsValue);
                if (modulesIds == null || modulesIds.Count == 0)
                    return new List<string>();

                var modules = GetAuthModules();
                var needUpdate = false;

                foreach (var modulesId 
                         in modulesIds.Where(moduleId => modules.All(module => moduleId != module.ModuleStringId))
                             .ToList())
                {
                    modulesIds.Remove(modulesId);
                    needUpdate = true;
                }
                
                if (needUpdate)
                    SettingProvider.Items["EnabledAuthModulesIds"] = JsonConvert.SerializeObject(modulesIds);

                return modulesIds;
            }
            set => SettingProvider.Items["EnabledAuthModulesIds"] = JsonConvert.SerializeObject(
                value ?? new List<string>()
            );
        }

        #endregion

        #region Methods

        public static EAuthMethod AuthMethod
        {
            get
            {
                var method = SettingProvider.Items["AuthMethod"].TryParseEnum(EAuthMethod.Email);
                
                if (method == EAuthMethod.Code && !AuthByCodeActive 
                    || method == EAuthMethod.Module && (!UseAuthModules 
                                                        || string.IsNullOrWhiteSpace(DefaultAuthModuleId)))
                    method = EAuthMethod.Email;
                
                return method;
            }
            set => SettingProvider.Items["AuthMethod"] = ((int)value).ToString();
        }

        private static int GetAuthMethodsMaxSortOrderWithStep(List<AuthMethod> methods)
        {
            const int sortOrderStep = 10;
            
            return methods.Max(method => method.SortOrder) + sortOrderStep;
        }

        private static List<AuthMethod> GetValidAuthMethods(string authMethodsValue)
        {
            const int emailSortOrder = 0;
            const int codeSortOrder = 10;

            var methods = new List<AuthMethod>();
            if (!string.IsNullOrEmpty(authMethodsValue))
                methods = JsonConvert.DeserializeObject<List<AuthMethod>>(authMethodsValue)
                          ?? new List<AuthMethod>();

            if (methods.All(method => method.Type != EAuthMethod.Email))
                methods.Add(new AuthMethod(EAuthMethod.Email, emailSortOrder));

            if (!AuthByCodeActive)
                methods.RemoveAll(method => method.Type == EAuthMethod.Code);
            else if (methods.All(method => method.Type != EAuthMethod.Code))
                methods.Add(new AuthMethod(EAuthMethod.Code, codeSortOrder));

            if (!UseAuthModules)
                methods.RemoveAll(method => method.Type == EAuthMethod.Module);
            else
            {
                var enabledAuthModuleIds = EnabledAuthModuleIds;

                methods.RemoveAll(method =>
                    method.Type == EAuthMethod.Module && enabledAuthModuleIds.All(id => id != method.ModuleId)
                );

                foreach (var id in enabledAuthModuleIds.Where(id => methods.All(method => method.ModuleId != id)))
                    methods.Add(new AuthMethod(EAuthMethod.Module, id, GetAuthMethodsMaxSortOrderWithStep(methods)));
            }

            return methods;
        }

        public static List<AuthMethod> AuthMethods
        {
            get => GetValidAuthMethods(SettingProvider.Items["AuthMethods"])
                .OrderBy(method => method.SortOrder)
                .ToList();
            set => SettingProvider.Items["AuthMethods"] = JsonConvert.SerializeObject(value ?? new List<AuthMethod>());
        }

        #endregion

        #region Confiramtions

        public static bool UseEmailConfirmation
        {
            get => SQLDataHelper.GetBoolean(SettingProvider.Items["SettingsAuth_UseEmailConfirmation"]);
            set => SettingProvider.Items["SettingsAuth_UseEmailConfirmation"] = value.ToString();
        }
        
        public static bool UsePhoneConfirmation
        {
            get => SQLDataHelper.GetBoolean(SettingProvider.Items["SettingsAuth_UsePhoneConfirmation"]);
            set => SettingProvider.Items["SettingsAuth_UsePhoneConfirmation"] = value.ToString();
        }

        #endregion
    }
}