using System.Collections.Generic;
using System.Linq;
using AdvantShop.Core.SQL2;
using AdvantShop.Web.Admin.Models.Catalog.WarehouseGroups;
using AdvantShop.Web.Infrastructure.Admin;

namespace AdvantShop.Web.Admin.Handlers.Catalog.WarehouseGroups
{
    public sealed class GetWarehouseGroups
    {
        private readonly WarehouseGroupFilter _filterModel;
        private SqlPaging _paging;

        public GetWarehouseGroups(WarehouseGroupFilter filterModel)
        {
            _filterModel = filterModel;
        }
        
        public WarehouseGroupFilterResult Execute()
        {
            var result = new WarehouseGroupFilterResult();
        
            GetPaging();

            result.TotalItemsCount = _paging.TotalRowsCount;
            result.TotalPageCount = _paging.PageCount();

            if (result.TotalPageCount < _filterModel.Page && _filterModel.Page > 1)
            {
                return result;
            }

            result.DataItems = _paging.PageItemsList<WarehouseGroupItem>();

            return result;
        }

        public List<int> GetItemsIds()
        {
            GetPaging();

            return _paging.ItemsIds<int>("StockLabel.Id");
        }

        private void GetPaging()
        {
            _paging = new SqlPaging
            {
                ItemsPerPage = _filterModel.ItemsPerPage,
                CurrentPageIndex = _filterModel.Page
            };

            _paging
                .Select(
                    "Id",
                    "Name",
                    "Enabled",
                    "SortOrder"
                )
                .From("[Catalog].[WarehouseGroup]");

            Sorting();
            Filter();
        }
 
        private void Filter()
        {
            if (!string.IsNullOrWhiteSpace(_filterModel.Search))
                _paging.Where("([Name] LIKE '%'+{0}+'%')", _filterModel.Search);

            if (!string.IsNullOrWhiteSpace(_filterModel.Name))
                _paging.Where("[Name] LIKE '%'+{0}+'%'", _filterModel.Name);
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