using System;
using System.IO;
using System.Text;
using System.Web;
using AdvantShop.Core.Common.Extensions;
using AdvantShop.Core.Services.Localization;
using AdvantShop.Customers;
using AdvantShop.ExportImport;
using AdvantShop.Helpers;

namespace AdvantShop.Web.Admin.Handlers.Customers.Subscription
{
    public class ImportSubscriptionHandlers
    {
        private readonly HttpPostedFileBase _file;
        private readonly string _outputFilePath;

        public class Results
        {
            public bool Result { get; set; }
            public string Error { get; set; }
        } 

        public ImportSubscriptionHandlers(HttpPostedFileBase file, string outputFilePath)
        {
            _file = file;
            _outputFilePath = outputFilePath;

            FileHelpers.DeleteFile(outputFilePath);
        }

        public Results Execute()
        {
            if (_file == null || string.IsNullOrEmpty(_file.FileName))
                return new Results { Result = false, Error = LocalizationService.GetResource("Admin.Error.FileNotFound") };
            _file.SaveAs(_outputFilePath);
            if (!File.Exists(_outputFilePath))
                return new Results { Result = false, Error = LocalizationService.GetResource("Admin.Error.FileNotFound") };

            var result = Import(_outputFilePath);

            return result;
        }

        public Results Import(string filePath)
        {
            try
            {
                using (var csvReader = new CsvHelper.CsvReader(new StreamReader(filePath, Encoding.UTF8), CsvConstants.DefaultCsvConfiguration))
                {
                    csvReader.Read();
                    csvReader.ReadHeader();
                    
                    if (csvReader.HeaderRecord == null ||
                        !csvReader.HeaderRecord.Contains(LocalizationService.GetResource("Admin.Subscribe.Export.Email")))
                        return new Results { Result = false, Error = LocalizationService.GetResource("Admin.Subscribe.Import.WrongFile") };
                    
                    while (csvReader.Read())
                    {
                        var email = csvReader.GetField<string>(
                            LocalizationService.GetResource("Admin.Subscribe.Export.Email"));
                        if (!ValidationHelper.IsValidEmail(email))
                            continue;

                        var subscription = SubscriptionService.GetSubscription(email) ?? new AdvantShop.Customers.Subscription();

                        subscription.Email = email;
                        subscription.Subscribe = csvReader.GetField<string>(
                            LocalizationService.GetResource("Admin.Subscribe.Export.Status")) == "1";
                        subscription.SubscribeDate = csvReader.GetField<string>(
                            LocalizationService.GetResource("Admin.Subscribe.Export.Date"))
                            .TryParseDateTime(true) ?? DateTime.Now;
                        subscription.SubscribeFromPage = csvReader.GetField<string>(
                            LocalizationService.GetResource("Admin.Subscribe.Export.SubscribeFromPage"));
                        subscription.SubscribeFromIp = csvReader.GetField<string>(
                            LocalizationService.GetResource("Admin.Subscribe.Export.SubscribeFromIp"));
                        subscription.UnsubscribeDate = csvReader.GetField<string>(
                            LocalizationService.GetResource("Admin.Subscribe.Export.UnsubscribeDate"))
                            .TryParseDateTime(true);
                        
                        if (subscription.Id > 0)
                            SubscriptionService.UpdateSubscription(subscription);
                        else
                            SubscriptionService.AddSubscription(subscription);
                    }
                }
                return new Results { Result = true };
            }
            catch
            {
                return new Results { Result = false, Error = LocalizationService.GetResource("Admin.Subscribe.Import.ImportError") };
            }
        }
    }
}
