using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using AdvantShop.Catalog;
using AdvantShop.Configuration;
using AdvantShop.Core.Common.Extensions;
using AdvantShop.Core.SQL;
using AdvantShop.Helpers;
using AdvantShop.SEO;

namespace AdvantShop.ExportImport
{
    public class ExportFeedCsvCategoryService
    {
        private const string Separator = ";";
        private const int BatchSize = 10;

        public static IEnumerable<ExportFeedCsvCategory> GetCsvCategories(
            List<CategoryFields> fieldMapping,
            string propertySeparator,
            string nameSameProductProperty,
            string nameNotSameProductProperty)
        {
            var lastCategoryId = -1;
            List<Category> categories;

            do
            {
                categories = SQLDataAccess.ExecuteReadList(
                    "Select Top (@BatchSize) * From [Catalog].[Category] Where CategoryId > @LastCategoryId Order By CategoryId",
                    CommandType.Text,
                    CategoryService.GetCategoryFromReader,
                    new SqlParameter("@BatchSize", BatchSize),
                    new SqlParameter("@LastCategoryId", lastCategoryId));

                foreach (var category in categories)
                {
                    yield return GetCsvCategory(
                        category,
                        fieldMapping,
                        propertySeparator,
                        nameSameProductProperty,
                        nameNotSameProductProperty);
                }

                if (categories.Count > 0)
                    lastCategoryId = categories[categories.Count - 1].CategoryId;

            } while (categories.Count == BatchSize);
        }

        public static int GetCsvCategoriesCount()
        {
            return SQLDataAccess.ExecuteScalar<int>(
                "Select Count(CategoryId) From [Catalog].[Category]",
                CommandType.Text);
        }

        public static List<string> GetRelatedPropertyNames(RelatedType type)
        {
            return SQLDataAccess.ExecuteReadList(
                @"Select Property.Name
                  From Catalog.RelatedProperties
                  Left Join Catalog.Property On Property.PropertyId = RelatedProperties.PropertyId
                  Where RelatedType = @RelatedType

                  Union

                  Select Property.Name
                  From Catalog.RelatedPropertyValues
                  Left Join Catalog.PropertyValue On PropertyValue.PropertyValueId = RelatedPropertyValues.PropertyValueId
                  Left Join Catalog.Property On Property.PropertyId = PropertyValue.PropertyId
                  Where RelatedType = @RelatedType

                  Order By Name",
                CommandType.Text,
                reader => SQLDataHelper.GetString(reader, "Name"),
                new SqlParameter("@RelatedType", (int)type));
        }

        private static ExportFeedCsvCategory GetCsvCategory(
            Category category,
            List<CategoryFields> fieldMapping,
            string propertySeparator,
            string nameSameProductProperty,
            string nameNotSameProductProperty)
        {
            var categoryCsv = new ExportFeedCsvCategory()
            {
                CategoryId = category.CategoryId.ToString(),
                ExternalId = category.ExternalId.ToString(),
                Name = category.Name,
                Slug = category.UrlPath,
                ParentCategory = category.ParentCategoryId.ToString(),
                SortOrder = category.SortOrder.ToString(),
                Enabled = category.Enabled ? "+" : "-",
                Hidden = category.Hidden ? "+" : "-",
                BriefDescription = category.GetCategoryBriefDescriptionFormatted(SettingsMain.City),
                Description = category.GetCategoryDescriptionFormatted(SettingsMain.City),
                DisplayStyle = category.DisplayStyle.ToString(),
                Sorting = category.Sorting.ToString(),
                DisplayBrandsInMenu = category.DisplayBrandsInMenu ? "+" : "-",
                DisplaySubCategoriesInMenu = category.DisplaySubCategoriesInMenu ? "+" : "-",
                ShowOnMainPage = category.ShowOnMainPage ? "+" : "-",
                SizeChart = category.SizeChart?.Name
            };

            if (fieldMapping.Contains(CategoryFields.Tags))
            {
                categoryCsv.Tags = String.Join(Separator, category.Tags.Select(x => x.Name));
            }

            if (fieldMapping.Contains(CategoryFields.Picture))
            {
                categoryCsv.Picture = category.Picture.PhotoName;
            }

            if (fieldMapping.Contains(CategoryFields.MiniPicture))
            {
                categoryCsv.MiniPicture = category.MiniPicture.PhotoName;
            }

            if (fieldMapping.Contains(CategoryFields.Icon))
            {
                categoryCsv.Icon = category.Icon.PhotoName;
            }
            
            if (fieldMapping.Contains(CategoryFields.Title) 
                || fieldMapping.Contains(CategoryFields.H1) 
                || fieldMapping.Contains(CategoryFields.MetaKeywords) 
                || fieldMapping.Contains(CategoryFields.MetaDescription))
            {
                var meta = 
                    MetaInfoService.GetMetaInfo(category.CategoryId, MetaType.Category) 
                    ?? new MetaInfo(0, 0, MetaType.Category, string.Empty, string.Empty, string.Empty, string.Empty);

                categoryCsv.Title = meta.Title;
                categoryCsv.H1 = meta.H1;
                categoryCsv.MetaKeywords = meta.MetaKeywords;
                categoryCsv.MetaDescription = meta.MetaDescription;
            }

            if (fieldMapping.Contains(CategoryFields.PropertyGroups))
            {
                var groups = PropertyGroupService.GetListByCategory(category.CategoryId);
                categoryCsv.PropertyGroups = String.Join(Separator, groups.Select(x => x.Name));
            }

            if (fieldMapping.Contains(CategoryFields.RelatedCategories))
            {
                categoryCsv.RelatedCategories = string.Join(";", CategoryService.GetRelatedCategoryIds(category.CategoryId, RelatedType.Related));
            }

            if (fieldMapping.Contains(CategoryFields.SimilarCategories))
            {
                categoryCsv.SimilarCategories = string.Join(";", CategoryService.GetRelatedCategoryIds(category.CategoryId, RelatedType.Alternative));
            }

            if (fieldMapping.Contains(CategoryFields.RelatedProperties))
            {
                categoryCsv.RelatedProperties =
                    CategoryService.GetRelatedPropertyValues(category.CategoryId, RelatedType.Related)
                        .GroupBy(x => x.Property.Name)
                        .ToDictionary(x => x.Key, x => x.Select(y => y.Value).AggregateString(propertySeparator));

                foreach (var property in CategoryService.GetRelatedProperties(category.CategoryId, RelatedType.Related))
                {
                    if (categoryCsv.RelatedProperties.ContainsKey(property.Name))
                        categoryCsv.RelatedProperties[property.Name] +=
                            property.IsSame
                                ? propertySeparator + nameSameProductProperty
                                : propertySeparator + nameNotSameProductProperty;
                    else
                        categoryCsv.RelatedProperties.Add(property.Name, property.IsSame ? nameSameProductProperty : nameNotSameProductProperty);
                }
            }

            if (fieldMapping.Contains(CategoryFields.SimilarProperties))
            {
                categoryCsv.SimilarProperties =
                    CategoryService.GetRelatedPropertyValues(category.CategoryId, RelatedType.Alternative)
                        .GroupBy(x => x.Property.Name)
                        .ToDictionary(x => x.Key, x => x.Select(y => y.Value).AggregateString(propertySeparator));

                foreach (var property in CategoryService.GetRelatedProperties(category.CategoryId, RelatedType.Alternative))
                {
                    if (categoryCsv.SimilarProperties.ContainsKey(property.Name))
                        categoryCsv.SimilarProperties[property.Name] +=
                            property.IsSame
                                ? propertySeparator + nameSameProductProperty
                                : propertySeparator + nameNotSameProductProperty;
                    else
                        categoryCsv.SimilarProperties.Add(property.Name,
                            property.IsSame ? nameSameProductProperty : nameNotSameProductProperty);
                }
            }

            return categoryCsv;
        }
    }
}