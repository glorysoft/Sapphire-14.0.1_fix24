using System.Collections.Generic;
using System.Linq;
using AdvantShop.Catalog;
using AdvantShop.Core.SQL2;
using AdvantShop.Web.Admin.Models.Catalog;
using AdvantShop.Web.Infrastructure.Handlers;

namespace AdvantShop.Web.Admin.Handlers.Catalog
{
    public sealed class GetCatalogOffersIds : BaseGetCatalogOffers, ICommandHandler<List<int>>
    {
        private readonly CatalogFilterModel _filter;
        private SqlPaging _paging;
        private readonly bool _withLimitation;

        public GetCatalogOffersIds(CatalogFilterModel filter, bool withLimitation = true)
        {
            _filter = filter;
            _withLimitation = withLimitation;
        }
        
        private void GetPaging()
        {
            // Необходимо для получения всех id если это рутовая категория
            if (_filter.CategoryId == CategoryService.GetAdaptiveRootCategoryId())
                _filter.ShowMethod = ECatalogShowMethod.AllProducts;

            (_paging, _) = GetPaging(_filter, true);
        }

        public List<int> Execute()
        {
            GetPaging();
            
            var ids = _paging.ItemsIds<int>("[Offer].[OfferId]");

            // Данное условие здесь необходимо для того, чтобы обезопасить работу с оферами
            // чтобы не вызвали тяжелые задачи над модификациями товаров
            // при обращениях, убрать
            return _withLimitation
                ? ids.Take(1000).ToList()
                : ids;
        }
        
        public int GetCount()
        {
            GetPaging();
            
            return _paging.GetRowsCount("[Offer].[OfferId]");
        }
    }
}