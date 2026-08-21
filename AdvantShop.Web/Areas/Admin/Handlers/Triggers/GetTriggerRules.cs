using AdvantShop.Web.Admin.Models.Triggers;
using AdvantShop.Core.SQL2;
using AdvantShop.Web.Infrastructure.Admin;
using System.Linq;
using System.Collections.Generic;
using AdvantShop.Web.Admin.ViewModels.Triggers;

namespace AdvantShop.Web.Admin.Handlers.Triggers
{
    public class GetTriggerRules
    {
        private readonly TriggerFilterModel _filter;
        private SqlPaging _paging;

        public GetTriggerRules(TriggerFilterModel filter)
        {
            _filter = filter;
        }

        public FilterResult<TriggerRuleGridItemDto> Execute()
        {
            var model = new FilterResult<TriggerRuleGridItemDto>();

            GetPaging();

            model.TotalItemsCount = _paging.TotalRowsCount;
            model.TotalPageCount = _paging.PageCount();
            model.TotalString = $"Найдено триггеров: {model.TotalItemsCount}";

            if (model.TotalPageCount < _filter.Page && _filter.Page > 1)
            {
                return model;
            }

            model.DataItems = _paging.PageItemsList<TriggerRuleGridItemDto>();

            return model;
        }

        private void GetPaging()
        {
            _paging = new SqlPaging()
                {
                    ItemsPerPage = _filter.ItemsPerPage,
                    CurrentPageIndex = _filter.Page
                }
                .Select(
                    "[TriggerRule].[Id]",
                    "EventType",
                    "CategoryId",
                    "[TriggerCategory].[Name]".AsSqlField("CategoryName"),
                    "[TriggerRule].[Name]".AsSqlField("Name"),
                    "DateCreated",
                    "DateModified",
                    "Enabled",
                    "WorksOnlyOnce"
                )
                .From("[CRM].[TriggerRule]")
                .Left_Join("[CRM].[TriggerCategory] ON [CRM].[TriggerRule].[CategoryId] = [CRM].[TriggerCategory].[Id]");

            Filter();
            Sorting();
        }

        private void Filter()
        {
            if (!string.IsNullOrEmpty(_filter.Search))
                _paging.Where("TriggerRule.Name like '%'+{0}+'%'", _filter.Search);
            

            if (!string.IsNullOrEmpty(_filter.Name))
                _paging.Where("TriggerRule.Name like '%'+{0}+'%'", _filter.Name);
            
            if (_filter.Enabled.HasValue)
                _paging.Where("Enabled = {0}", _filter.Enabled.Value ? "1" : "0");
            
            if (_filter.CategoryId.HasValue)
            {
                if (_filter.CategoryId.Value > 0)
                    _paging.Where("CategoryId = {0}", _filter.CategoryId.Value);
                else
                    _paging.Where("CategoryId is NULL");
            }

            if (_filter.ActionType != null)
                _paging.Where("exists (Select 1 From [CRM].[TriggerAction] Where TriggerRuleId = [TriggerRule].[Id] and [ActionType] = {0})",
                    (int)_filter.ActionType);
            
            if (_filter.ObjectType != null)
                _paging.Where("ObjectType = {0}", (int)_filter.ObjectType);
            
            if (_filter.WorksOnlyOnce != null)
                _paging.Where("WorksOnlyOnce = {0}", _filter.WorksOnlyOnce);
        }

        private void Sorting()
        {
            if (!string.IsNullOrEmpty(_filter.Sorting))
            {
                var sorting = _filter.Sorting.ToLower();

                var field = _paging.SelectFields().FirstOrDefault(x => x.FieldName == sorting);
                if (field != null)
                {
                    if (_filter.SortingType == FilterSortingType.Asc)
                        _paging.OrderBy(sorting);
                    else
                        _paging.OrderByDesc(sorting);
                }
            }
        }

        public List<T> GetItemsIds<T>(string fieldName)
        {
            GetPaging();

            return _paging.ItemsIds<T>(fieldName);
        }
    }
}
