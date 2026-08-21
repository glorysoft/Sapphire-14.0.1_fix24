using AdvantShop.Core.Modules;
using AdvantShop.Core.Modules.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using AdvantShop.Diagnostics;
using System.IO;
using AdvantShop.Core.Common.Extensions;
using AdvantShop.Customers;

namespace AdvantShop.Core.Services.Messengers
{
	public class MessengerServices
	{
        public static void SendMessage(
            Message message, 
            List<string> modulesNames,
            Action<string> onSuccess = null, 
            Action<string> onError = null
        )
		{
			Task.Run(() => SendMessageNow(message, modulesNames, false, onSuccess, onError));
		}

		public static  List<IMessengerService> GetAllActiveModules(List<string> modulesNames) => 
            AttachedModules.GetModules<IMessengerService>()
                .Select(moduleType => (IMessengerService)Activator.CreateInstance(moduleType, null))
                .Where(module => modulesNames.Contains(module.ModuleStringId))
                .ToList();

		private static string SendMessageNow(
            Message message, 
            List<string> modulesNames, 
            bool? throwException = false,
            Action<string> onSuccess = null, 
            Action<string> onError = null
        )
		{
			string result = null;
            var throwError = throwException != null && throwException.Value;
            
            if (modulesNames == null || modulesNames.Count == 0)
            {
                if (throwError)
                    throw new BlException("Не выбран ни один модуль");
                
                return result;
            }
            
            if (string.IsNullOrWhiteSpace(message.Text))
            {
                onError?.Invoke("Не указан текст сообщения");
                
                if (throwError)
                    throw new BlException("Укажите валидный текст");
                
                return result;
            }

            try
            {
                var modules = GetAllActiveModules(modulesNames);
                
                if (modules == null || modules.Count == 0)
                {
                    onError?.Invoke("Не подключен модуль");
                    
                    if (throwError)
                        throw new BlException("Нет подключенных модулей");
                    
                    return result;
                }

                foreach (var module in modules)
                {
                    result = module.SendMessage(message);
                    
                    if (result.IsNotEmpty())
                        onError?.Invoke(result);
                    else 
                        onSuccess?.Invoke(module.ModuleName);
                }
            }
            catch (WebException ex)
            {
                using (var eResponse = ex.Response)
                    if (eResponse != null)
                    {
                        using (var eStream = eResponse.GetResponseStream())
                            if (eStream != null)
                                using (var reader = new StreamReader(eStream))
                                {
                                    var error = reader.ReadToEnd();
                                    Debug.Log.Error(error);
                                    onError?.Invoke($"Ошибка при отправке {error}");

                                    if (throwError) throw;
                                }
                    }
            }
            catch (Exception ex)
            {
                Debug.Log.Error(ex);
                onError?.Invoke($"Ошибка при отправке {ex.Message}");

                if (throwError) throw;
            }
            
			return result;
		}
    }
}
