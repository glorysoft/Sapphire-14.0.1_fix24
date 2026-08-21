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
    public sealed class GetExportFeedFields
    {
        private readonly int _exportFeedId;
        private readonly EExportFeedType _exportFeedType;

        public GetExportFeedFields(int exportFeedId, EExportFeedType exportFeedType)
        {
            _exportFeedId = exportFeedId;
            _exportFeedType = exportFeedType;
        }

        public ExportFeedFields Execute()
        {
            var allFields = GetAllFields();

            var defaultExportFields = 
                allFields.Select(x => x.Key)
                    .Where(x => x != ProductFields.None.ToString())
                    .ToList();
            
            try
            {
                List<ProductFields> fieldMapping = null;
                List<CSVField> moduleFieldMapping = null;
                
                switch (_exportFeedType)
                {
                    case EExportFeedType.Csv:
                        var advancedSettingsCsv =
                            ExportFeedSettingsProvider.GetAdvancedSettings<ExportFeedCsvOptions>(_exportFeedId);
                        fieldMapping = advancedSettingsCsv.FieldMapping;
                        moduleFieldMapping = advancedSettingsCsv.ModuleFieldMapping;
                        break;
                    
                    case EExportFeedType.Reseller:
                        var advancedSettingsReseller =
                            ExportFeedSettingsProvider.GetAdvancedSettings<ExportFeedCsvOptions>(_exportFeedId);
                        fieldMapping = 
                            advancedSettingsReseller.FieldMapping?
                                .Where(x => x != ProductFields.Sorting && x != ProductFields.ExternalCategoryId)
                                .ToList();
                        moduleFieldMapping = advancedSettingsReseller.ModuleFieldMapping;
                        break;
                }
                
                return new ExportFeedFields
                {
                    AllFields = allFields,
                    FieldMapping = fieldMapping,
                    ModuleFieldMapping = moduleFieldMapping,
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
                Enum.GetValues(typeof(ProductFields)).Cast<ProductFields>()
                    .Where(x => x != ProductFields.Sorting && x != ProductFields.ExternalCategoryId)
                    .ToDictionary(x => x.ToString(), x => x.Localize());

            foreach (var moduleField in GetModuleFields())
                result.Add(moduleField.StrName, moduleField.DisplayName);
            
            return result;
        }

        private List<CSVField> GetModuleFields()
        {
            var result = new List<CSVField>();
            foreach (var csvExportImportModule in AttachedModules.GetModules<ICSVExportImport>())
            {
                var classInstance = (ICSVExportImport)Activator.CreateInstance(csvExportImportModule);
                
                if (ModulesRepository.IsActiveModule(classInstance.ModuleStringId) && classInstance.CheckAlive())
                {
                    result.AddRange(classInstance.GetCSVFields());
                }
            }
            return result;
        }
        
        private List<string> GetBaseFields()
        {
            var result = new List<ProductFields>()
            {
                ProductFields.Sku,
                ProductFields.Name,
                ProductFields.MultiOffer,
                ProductFields.Weight,
                ProductFields.Size,
                ProductFields.BarCode,
                ProductFields.Category,
                ProductFields.Enabled,
                ProductFields.Photos,
                ProductFields.Properties,
                ProductFields.Unit,
                ProductFields.Discount,
                ProductFields.DiscountAmount,
                ProductFields.BriefDescription,
                ProductFields.Description,
                ProductFields.Producer,
                ProductFields.CustomOption,
                ProductFields.Comment,
                ProductFields.Url
            };

            return result.Select(x => x.ToString()).ToList();
        }
    }
}
