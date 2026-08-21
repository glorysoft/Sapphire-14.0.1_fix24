using System.Collections.Generic;
using System.Linq;
using AdvantShop.Core.SQL2;
using AdvantShop.Web.Admin.Handlers.Catalog;
using AdvantShop.Web.Admin.Models.Catalog;
using AdvantShop.Web.Admin.Models.Marketing.Coupons;
using AdvantShop.Web.Infrastructure.Admin;
using AdvantShop.Web.Infrastructure.Handlers;

namespace AdvantShop.Web.Admin.Handlers.Marketing.Coupons
{
    public sealed class GetCatalogOffersForForCoupons : BaseGetCatalogOffersForCoupons, ICommandHandler<FilterResult<CouponsCatalogOfferModel>>
    {
        private readonly CouponsCatalogFilterModel _filter;
        private FilterResult<IAdminCatalogGridProduct> _productsResult;
        private SqlPaging _paging;

        public GetCatalogOffersForForCoupons(CouponsCatalogFilterModel filter)
        {
            _filter = filter;
        }

        public FilterResult<CouponsCatalogOfferModel> Execute()
        {
            var model = new FilterResult<CouponsCatalogOfferModel>();

            (_paging, _productsResult) = GetPaging(_filter, false);

            // _productsResult.TotalItemsCount имеет общее количество только товаров
            // _paging.TotalRowsCount имеет количество только текущей выборки грида, а не общее количество
            // по этому достаем общее количество по количеству всех id
            model.TotalItemsCount = new GetCatalogOffersIdsForCoupons(_filter, withLimitation: false).Execute().Count;
            model.TotalPageCount = _productsResult.TotalPageCount;
            model.DataItems = new List<CouponsCatalogOfferModel>();

            if (model.TotalPageCount < _filter.Page && _filter.Page > 1)
                return model;

            model.DataItems = _paging.PageItemsList<CouponsCatalogOfferModel>();

            // для группировки в гриде нужна главная модификация, после фильтров может ее не быть, поэтому ставим
            foreach (var item in model.DataItems)
            {
                if (!item.Main
                    && model.DataItems.Count(x => x.ProductId == item.ProductId && x.Main) == 0)
                {
                    item.Main = true;
                }
            }

            return model;
        }
    }
}