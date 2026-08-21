using System;
using System.Collections.Generic;
using System.Linq;
using AdvantShop.Core.Common.Extensions;
using AdvantShop.Core.Modules;
using AdvantShop.Core.Modules.Interfaces;
using AdvantShop.ExportImport;
using AdvantShop.Web.Admin.Models.Catalog.ExportFeeds;
using Newtonsoft.Json;

namespace AdvantShop.Web.Admin.Handlers.Catalog.ExportFeeds
{
    public sealed class GetExportFeedCsvFieldsV2
    {
        private readonly int _exportFeedId;
        private readonly ExportFeedCsvV2Options _advancedSettings;
        private readonly List<CSVField> _moduleFields;

        public GetExportFeedCsvFieldsV2(int exportFeedId, ExportFeedCsvV2Options advancedSettings)
        {
            _exportFeedId = exportFeedId;
            _advancedSettings = advancedSettings;

            _moduleFields = new List<CSVField>();
            
            foreach (var csvExportImportModule in AttachedModules.GetModules<ICSVExportImport>())
            {
                var classInstance = (ICSVExportImport)Activator.CreateInstance(csvExportImportModule);
                
                if (ModulesRepository.IsActiveModule(classInstance.ModuleStringId) && classInstance.CheckAlive())
                    _moduleFields.AddRange(classInstance.GetCSVFields());
            }
        }

        public ExportFeedCsvFieldsV2 Execute()
        {
            var allFields = GetAllFields();

            var defaultExportFields =
                allFields.Select(x => x.Key)
                    .Where(x => x != EProductField.None.ToString())
                    .ToList();

            try
            {
                var settings = new ExportFeedSettingsCsvV2Model(_advancedSettings);
                return new ExportFeedCsvFieldsV2
                {
                    AllFields = allFields,
                    FieldMapping = settings.FieldMapping,
                    ModuleFieldMapping = settings.ModuleFieldMapping,
                    Id = _exportFeedId,
                    DefaultExportFields = JsonConvert.SerializeObject(defaultExportFields),
                    BaseExportFields = JsonConvert.SerializeObject(GetBaseFields())
                };
            }
            catch
            {
                return null;
            }
        }

        private Dictionary<string, string> GetAllFields()
        {
            var result = 
                Enum.GetValues(typeof(EProductField)).Cast<EProductField>()
                    .Where(x => x != EProductField.Sorting && x != EProductField.ExternalCategoryId)
                    .ToDictionary(x => x.ToString(), x => x.Localize());
            
            result.AddRange(_moduleFields.Select(moduleField => new KeyValuePair<string, string>(moduleField.StrName, moduleField.DisplayName)));

            return result;
        }

        private List<string> GetBaseFields()
        {
            var result = new List<EProductField>()
            {
                EProductField.Code,
                EProductField.Sku,
                EProductField.Name,
                EProductField.Price,
                EProductField.Amount,
                EProductField.Size,
                EProductField.Color,
                EProductField.Weight,
                EProductField.Dimensions,
                EProductField.BarCode,
                EProductField.Category,
                EProductField.Enabled,
                EProductField.Photos,
                EProductField.OfferPhotos,
                EProductField.Property,
                EProductField.Unit,
                EProductField.Discount,
                EProductField.DiscountAmount,
                EProductField.BriefDescription,
                EProductField.Description,
                EProductField.MarkerNew,
                EProductField.MarkerBestseller,
                EProductField.Producer,
                EProductField.CustomOptions,
                EProductField.Comment,
                EProductField.Url
            };

            return result.Select(x => x.ToString()).ToList();
        }
    }
}
