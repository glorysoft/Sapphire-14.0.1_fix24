using System;
using System.Collections.Generic;
using System.Linq;
using AdvantShop.Core.Services.Localization;
using AdvantShop.Core.SQL;
using AdvantShop.Web.Infrastructure.Admin;
using AdvantShop.Localization;
using SqlPaging = AdvantShop.Core.SQL2.SqlPaging;

namespace AdvantShop.Web.Admin.Handlers.Settings.Mails
{
    public sealed class GetBannedListForSms
    {
        private SqlPaging _paging;
        private readonly BannedListForSmsFilter _filterModel;


        public GetBannedListForSms(BannedListForSmsFilter filterModel)
        {
            _filterModel = filterModel;
        }

        public FilterResult<SmsBanItem> Execute()
        {
            var model = new FilterResult<SmsBanItem>();

            GetPaging();

            model.TotalItemsCount = _paging.TotalRowsCount;
            model.TotalPageCount = _paging.PageCount();
            model.TotalString = LocalizationService.GetResourceFormat("Admin.Grid.FildTotal", model.TotalItemsCount);

            if (model.TotalPageCount < _filterModel.Page && _filterModel.Page > 1)
                return model;

            model.DataItems = _paging.PageItemsList<SmsBanItem>();

            return model;
        }

        public List<int> GetItemsIds()
        {
            GetPaging();
            return _paging.ItemsIds<int>("Id");
        }

        private void GetPaging()
        {
            _paging = new SqlPaging()
                {
                    ItemsPerPage = _filterModel.ItemsPerPage,
                    CurrentPageIndex = _filterModel.Page
                }
                .Select("Id", "Phone", "Ip", "UntilDate")
                .From("[Customers].[SmsBan]");

            Sorting();
            Filter();
        }

        private void Filter()
        {
            if (!string.IsNullOrEmpty(_filterModel.Search))
                _paging.Where("Phone LIKE '%'+{0}+'%' or Ip LIKE '%'+{0}+'%'", _filterModel.Search);
        }

        private void Sorting()
        {
            if (string.IsNullOrEmpty(_filterModel.Sorting) || _filterModel.SortingType == FilterSortingType.None)
            {
                _paging.OrderBy("UntilDate");
                return;
            }

            var sorting = _filterModel.Sorting.ToLower().Replace("formatted", "");

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

    public sealed class BannedListForSmsFilter : BaseFilterModel
    {
        public int? Id { get; set; }
    }

    public sealed class SmsBanItem
    {
        public int Id { get; set; }
        public string Phone { get; set; }
        public string Ip { get; set; }
        public DateTime UntilDate { get; set; }
        public string UntilDateStr => Culture.ConvertDate(UntilDate);
    }
}