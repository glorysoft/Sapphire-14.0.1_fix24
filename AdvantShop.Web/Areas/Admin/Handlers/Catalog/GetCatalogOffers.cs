using System.Collections.Generic;
using System.Linq;
using AdvantShop.Web.Admin.Models.Catalog;
using AdvantShop.Web.Infrastructure.Admin;
using AdvantShop.Web.Infrastructure.Handlers;

namespace AdvantShop.Web.Admin.Handlers.Catalog
{
    public sealed class GetCatalogOffers : BaseGetCatalogOffers, ICommandHandler<FilterResult<CatalogOfferModel>>
    {
        private readonly CatalogFilterModel _filter;

        public GetCatalogOffers(CatalogFilterModel filter)
        {
            _filter = filter;
        }

        public FilterResult<CatalogOfferModel> Execute()
        {
            var model = new FilterResult<CatalogOfferModel>();

            var (paging, productsResult) = GetPaging(_filter, false);

            // _productsResult.TotalItemsCount имеет общее количество только товаров
            // _paging.TotalRowsCount имеет количество только текущей выборки грида, а не общее количество
            // по этому достаем общее количество по количеству всех id
            model.TotalItemsCount = new GetCatalogOffersIds(_filter, withLimitation: false).GetCount();
            model.TotalPageCount = productsResult.TotalPageCount;
            model.DataItems = new List<CatalogOfferModel>();

            if (model.TotalPageCount < _filter.Page && _filter.Page > 1)
                return model;

            model.DataItems = paging.PageItemsList<CatalogOfferModel>();

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