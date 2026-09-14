using System.Collections.Generic;
using System.Linq;
using AdvantShop.Core.Services.Localization;
using AdvantShop.Core.SQL2;
using AdvantShop.Web.Infrastructure.Admin;
using AdvantShop.Module.RemindAboutReceipt.Models;

namespace AdvantShop.Module.RemindAboutReceipt.Handlers
{
    public class GetRadClientsHandler
    {
        private readonly RadClientFilterModel _filterModel;
        private SqlPaging _paging;

        public GetRadClientsHandler(RadClientFilterModel filterModel)
        {
            _filterModel = filterModel;
        }

        public FilterResult<RadClient> Execute()
        {
            var model = new FilterResult<RadClient>();

            GetPaging();

            model.TotalItemsCount = _paging.TotalRowsCount;
            model.TotalPageCount = _paging.PageCount();
            model.TotalString = LocalizationService.GetResourceFormat("Admin.Grid.FildTotal", model.TotalItemsCount);

            if (model.TotalPageCount < _filterModel.Page && _filterModel.Page > 1)
            {
                return model;
            }

            model.DataItems = _paging.PageItemsList<RadClient>();

            return model;
        }

        public List<int> GetItemsIds(string fieldName)
        {
            GetPaging();

            return _paging.ItemsIds<int>(fieldName);
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
                    "ProductId",
                    "Email",
                    "OldPrice",
                    "SendNotification",
                    "LeadId"
            );

            _paging.From("Module.RemindAboutDiscountClients");

            Sorting();
            Filter();
        }

        private void Filter()
        {
            if (!string.IsNullOrEmpty(_filterModel.Search))
            {
                _paging.Where("Email LIKE '%'+{0}+'%'", _filterModel.Search);
            }

            if (!string.IsNullOrEmpty(_filterModel.Email))
            {
                _paging.Where("Email LIKE '%'+{0}+'%'", _filterModel.Email);
            }
        }

        private void Sorting()
        {
            if (string.IsNullOrEmpty(_filterModel.Sorting) || _filterModel.SortingType == FilterSortingType.None)
            {
                _paging.OrderByDesc("Id");
                return;
            }

            var sorting = _filterModel.Sorting.ToLower().Replace("formatted", "");

            var field = _paging.SelectFields().FirstOrDefault(x => x.FieldName == sorting);
            if (field != null)
            {
                if (_filterModel.SortingType == FilterSortingType.Asc)
                {
                    _paging.OrderBy(sorting);
                }
                else
                {
                    _paging.OrderByDesc(sorting);
                }
            }
        }
    }
}