using AdvantShop.Catalog;
using AdvantShop.Core;
using AdvantShop.Core.Common.Extensions;
using AdvantShop.Core.UrlRewriter;
using AdvantShop.SEO;
using AdvantShop.Web.Admin.Models.Catalog.ProductLists;
using AdvantShop.Web.Infrastructure.Handlers;

namespace AdvantShop.Web.Admin.Handlers.Catalog.ProductLists
{
    public sealed class UpdateProductListHandler : AbstractCommandHandler<int>
    {
        private readonly ProductList _list;
        private readonly MetaInfoProductLists _metaInfo;

        public UpdateProductListHandler(ProductList list, MetaInfoProductLists metaInfo)
        {
            _list = list;
            _metaInfo = metaInfo ?? new MetaInfoProductLists();
        }
        
        protected override void Validate()
        {
            if (string.IsNullOrWhiteSpace(_list.Name))
                throw new BlException("Отсутствует название списка товаров");
            
            if (_list.Id == 0)
                throw new BlException("Не удалось получить идентификатор списка");

            var oldList = ProductListService.Get(_list.Id);
            
            if (oldList == null)
                throw new BlException("Не удалось найти список товаров");
            
            if (string.IsNullOrEmpty(_list.UrlPath))
                throw new BlException("Отсутствует синоним для URL запроса");
        }
        
        protected override int Handle()
        {
            CheckUrlPath();
            AddMeta();
            Update();
            
            return _list.Id;
        }

        private void CheckUrlPath()
        {
            if (UrlService.GetObjUrlFromDb(ParamType.ProductList, _list.Id) != _list.UrlPath 
                && !UrlService.IsValidUrl(_list.UrlPath, ParamType.ProductList))
            {
                _list.UrlPath = UrlService.GetAvailableValidUrl(0, ParamType.ProductList, _list.UrlPath);
            }
        }

        private void AddMeta() =>
            _list.Meta =
                new MetaInfo(0, 
                            _list.Id,
                            MetaType.MainPageProducts,
                            _metaInfo.Title.DefaultOrEmpty(),
                            _metaInfo.MetaKeywords.DefaultOrEmpty(),
                            _metaInfo.MetaDescription.DefaultOrEmpty(),
                            _metaInfo.H1.DefaultOrEmpty());
        
        private void Update() =>
            ProductListService.Update(_list);
    }
}