using System.Collections.Generic;
using System.Linq;
using AdvantShop.Core.SQL2;
using AdvantShop.Web.Admin.Models.Settings.ShippingRules;
using AdvantShop.Web.Infrastructure.Admin;

namespace AdvantShop.Web.Admin.Handlers.Settings.ShippingRules
{
    public class GetRuleItems
    {
        private readonly RuleFilterModel _filterModel;
        private SqlPaging _paging;

        public GetRuleItems(RuleFilterModel filterModel)
        {
            _filterModel = filterModel;
        }
   
        public RulesFilterResult Execute()
        {
            var model = new RulesFilterResult();

            GetPaging();

            model.TotalItemsCount = _paging.TotalRowsCount;
            model.TotalPageCount = _paging.PageCount();

            if (model.TotalPageCount < _filterModel.Page && _filterModel.Page > 1)
            {
                return model;
            }

            model.DataItems = _paging.PageItemsList<RuleGridModel>();
            
            return model;
        }

        public List<T> GetItemsIds<T>()
        {
            GetPaging();

            return _paging.ItemsIds<T>("Id");
        }
 
        private void GetPaging()
        {
            _paging = new SqlPaging()
            {
                ItemsPerPage = _filterModel.ItemsPerPage,
                CurrentPageIndex = _filterModel.Page
            };

            _paging.Select(
                "Id",
                "Name",
                "Enabled",
                "SortOrder");

            _paging.From("[Order].[ShippingRule]");

            Sorting();
            Filter();
        }

        private void Filter()
        {
            if (!string.IsNullOrWhiteSpace(_filterModel.Search))
                _paging.Where("Name LIKE '%'+{0}+'%'", _filterModel.Search);

            if (_filterModel.Enabled.HasValue)
                _paging.Where("Enabled = {0}", _filterModel.Enabled.Value);
        }
   
        private void Sorting()
        {
            if (string.IsNullOrEmpty(_filterModel.Sorting) || _filterModel.SortingType == FilterSortingType.None)
            {
                _paging.OrderBy("SortOrder");
                return;
            }

            var sorting = _filterModel.Sorting.ToLower();

            var field = _paging.SelectFields().FirstOrDefault(x => x.FieldName == sorting);
            if (field != null)
            {
                if (_filterModel.SortingType == FilterSortingType.Asc)
                    _paging.OrderBy(sorting);
                else
                    _paging.OrderByDesc(sorting);
            }
        }
    }
}