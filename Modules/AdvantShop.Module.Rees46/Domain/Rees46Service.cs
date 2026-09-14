//--------------------------------------------------
// Project: AdvantShop.NET
// Web site: http:\\www.advantshop.net
//--------------------------------------------------

using System;
using System.Collections.Generic;
using System.Linq;
using AdvantShop.Catalog;
using AdvantShop.Core.Common.Attributes;
using AdvantShop.Core.Common.Extensions;
using AdvantShop.ExportImport;
using AdvantShop.Configuration;
using AdvantShop.Module.Rees46.Domain.PartnersApi;
using Newtonsoft.Json;

namespace AdvantShop.Module.Rees46.Domain
{
    public class Rees46Service
    {
        private const string FormatStr = 
@"<div class='rees46-recommender {0}'></div> 
<script>
window.addEventListener('load', function load () {{
   window.removeEventListener('load', load);

   try {{
     r46('recommend', '{0}', {{{1}}}, 
            function(data) {{
            getRees46Products('{0}', {4}, data, '{2}', '{3}', '{5}');
        }});
    r46('add_css', 'recommendations');
  }} catch(e) {{ }}
}});
</script>";

        private const string NewApiFormatStr =
@"<div class='rees46-recommender' data-recommender-code='{0}'></div> 
<script>
window.addEventListener('load', function load () {{
   window.removeEventListener('load', load);

   try {{
     r46('recommend', '{0}', {1}, function(data) {{
            getRees46ProductsByCode(data, '{0}', {2});
        }});
    r46('add_css', 'recommendations');
  }} catch(e) {{ }}
}});
</script>";

        public const string FormatTrack = 
@"<script>
window.addEventListener('load', function load () {{
    window.removeEventListener('load', load);

    r46('track', '{0}', {1});
}});
</script>";

        public static string GetRecomender(PageType pageType, int? id = null, string searchQuery = null)
        {
            var code = "";

            switch (pageType)
            {
                case PageType.CategoryTop:
                    code = Rees46Settings.CatalogTopCode;
                    break;
                case PageType.CategoryBottom:
                    code = Rees46Settings.CatalogBottomCode;
                    break;
                case PageType.AlternativeProduct:
                    code = Rees46Settings.AlternativeProductCode;
                    break;
                case PageType.RelatedProduct:
                    code = Rees46Settings.RelatedProductCode;
                    break;
                case PageType.Cart:
                    code = Rees46Settings.CartCode;
                    break;
                case PageType.MainPage:
                    code = Rees46Settings.MainPageCode;
                    break;
            }

            if (string.IsNullOrWhiteSpace(code))
                return null;

            switch (pageType)
            {
                case PageType.RelatedProduct:
                case PageType.AlternativeProduct:
                {
                    var obj = JsonConvert.SerializeObject(new {code, item = id, limit = Rees46Settings.Limit});
                    return String.Format(NewApiFormatStr, code, obj, id);
                }

                case PageType.CategoryTop:
                case PageType.CategoryBottom:
                {
                    var obj = JsonConvert.SerializeObject(new {code, category = id, limit = Rees46Settings.Limit});
                    return String.Format(NewApiFormatStr, code, obj, 0);
                }

                case PageType.MainPage:
                case PageType.Cart:
                {
                    var obj = JsonConvert.SerializeObject(new {code, limit = Rees46Settings.Limit});
                    return String.Format(NewApiFormatStr, code, obj, 0);
                }

                case PageType.Search:
                {
                    var obj = JsonConvert.SerializeObject(new {code, search_query = searchQuery, limit = Rees46Settings.Limit});
                    return String.Format(NewApiFormatStr, code, obj, 0);
                }
            }
            return null;
        }


        public static string GetRecomender(Recomender recom, int? offerId = null, int? categoryId = null,
                                            List<int> cartIds = null, string title = "", string relatedType = "", 
                                            int productCount = 0)
        {
            var parammetrs = "";

            switch (recom)
            {
                case Recomender.interesting:
                case Recomender.also_bought:
                    if (offerId != null)
                        parammetrs = "item: " + offerId;
                    break;
                case Recomender.similar:
                case Recomender.buying_now:
                    if (offerId != null)
                        parammetrs = "item: " + offerId;
                    if (cartIds != null && cartIds.Count > 0)
                        parammetrs += (parammetrs != "" ? ",\n" : "\n") + "cart: [" + string.Join(",", cartIds) + "]";
                    break;

                case Recomender.popular:
                    if (categoryId != null)
                        parammetrs = "category: " + categoryId;
                    break;

                case Recomender.see_also:
                    if (cartIds != null && cartIds.Count > 0)
                        parammetrs = "cart: [" + string.Join(",", cartIds) + "]";
                    break;

                case Recomender.none:
                    return string.Empty;
            }

            if (Rees46Settings.Limit > 0)
            {
                parammetrs += (parammetrs != "" ? ",\n" : "\n") + "limit: " + Rees46Settings.Limit;
            }

            if (string.IsNullOrEmpty(title))
                title = recom.StrName();

            return string.Format(FormatStr, recom, parammetrs, title, relatedType, offerId != null ? offerId.Value : 0, productCount != 0 ? productCount.ToString() : "");
        }

        public static string TrackView(TrackItem obj, TypeEvent type)
        {
            if (type == TypeEvent.view)
            {
                return string.Format(FormatTrack, type, string.Format("{{id: {0}, stock: {1}}}", obj.Id, obj.Stock.ToString().ToLower()));
            }

            if (type == TypeEvent.purchase)
            {
                var str = "[";
                foreach (var item in obj.Products)
                {
                    str += "{ id: " + item.Id + ", price: " + item.Price + ", amount: " + item.Amount + "}" + (item == obj.Products.Last() ? "]" : ",");
                }
                return string.Format(FormatTrack,type, "{products: " + str + ", order: '" + obj.Order + "', order_price: " + obj.OrderPrice + "}");
            }

            return string.Format(FormatTrack, type, "{id: " + obj.Id + ", stock: " + obj.Stock.ToString().ToLower() + ", price: " + obj.Price +
                                                    ", name: '" + obj.Name + "', categories: [" + string.Join(",",obj.Categories) + "], image: '" + obj.Image + "', url: '" + obj.Url + "'}");
        }

        public static TrackItem GetTrackItem(int offerId, int? productId, int? amount, TypeEvent type, string recommend_by)
        {
            var offer = OfferService.GetOffer(offerId);

            if (offer == null && productId != null)
                offer = OfferService.GetProductOffers(productId.Value).FirstOrDefault();

            if (offer == null)
                return null;

            return GetTrackItem(offer, amount, type, recommend_by);
        }

        public static TrackItem GetTrackItem(Offer offer, int? amount, TypeEvent type, string recommend_by)
        {
            switch (type)
            {
                case TypeEvent.view:
                    {
                        var obj = new TrackItem()
                        {
                            Id = offer.OfferId,
                            Stock = offer.Amount > 0,
                            Type = TypeEvent.view
                        };
                        return obj;
                    }

                case TypeEvent.cart:
                    {
                        var obj = new TrackItem()
                        {
                            Id = offer.OfferId,
                            Amount = amount,
                            Stock = offer.Amount > 0,
                            RecommendedBy = recommend_by,
                            Type = TypeEvent.cart
                        };
                        return obj;
                    }
                case TypeEvent.remove_from_cart:
                    {
                        var obj = new TrackItem()
                        {
                            Id = offer.OfferId,
                            Type = TypeEvent.remove_from_cart
                        };
                        return obj;
                    }
            }
            return null;
        }

        #region Registration

        public static ResponsesApi Registration(Rees46Customer customer)
        {
            var keys = Rees46PartnerService.RegisterCustomer(customer);

            if (keys == null || string.IsNullOrEmpty(keys.ApiKey) || string.IsNullOrEmpty(keys.ApiSecret))
                return SetMessageError(keys != null && keys.Duplicate 
                    ? "Пользователь с такими данными уже зарегистрирован"
                    : "Не удалось добавить пользователя, проверьте ваши данные.");

            var categories = Rees46PartnerService.GetCategories();
            var currencies = Rees46PartnerService.GetCurrencies();
            
            if (categories == null || categories.Count == 0 ||
                currencies == null || currencies.Count == 0)
                return SetMessageError("Не возможно создать магазин, т.к. список категорий или валют пуст");

            var category = categories.FirstOrDefault(x => x.Id == 0) ?? categories.First();
            var currency = currencies.FirstOrDefault(x => x.Code == "rub") ?? currencies.First();

            var shop = new Rees46Shop()
            {
                ApiKey = keys.ApiKey,
                ApiSecret = keys.ApiSecret,
                Url = SettingsMain.SiteUrl,
                Name = SettingsMain.ShopName,
                CmsId = 11,
                YmlNotification = true,
                Promocode = "advantshop",
                Category = category.Id,
                CurrencyId = currency.Id,
                BillingCurrencyId = currency.Id
            };

            var allFeeds = ExportFeedService.GetExportFeeds();
            if (allFeeds.Count > 0)
            {
                allFeeds = allFeeds.Where(x => x.FeedType == EExportFeedType.YandexMarket && x.Name.ToLower().Contains("rees46")).ToList();
                if (allFeeds.Count > 0)
                {
                    var settings = ExportFeedSettingsProvider.GetSettings(allFeeds[0].Id);
                    if (settings != null)
                        shop.YmlFileUrl = SettingsMain.SiteUrl + "/" + settings.FileFullName;
                }
            }
            
            if (string.IsNullOrEmpty(shop.YmlFileUrl))
            {
                var exportFeedId = ExportFeedService.AddExportFeed(new ExportFeed(EExportFeedType.YandexMarket)
                {
                    Name = "Выгрузка для Rees46",
                    Description = "Выгрузка для Rees46"
                });

                ExportFeedService.InsertCategory(exportFeedId, 0, false);

                //var type = ReflectionExt.GetTypeByAttributeValue<ExportFeedKeyAttribute>(typeof(BaseExportFeed), atr => atr.Value, EExportFeedType.YandexMarket.ToString());
                //var currentExportFeed = (BaseExportFeed)Activator.CreateInstance(type, exportFeedId);
                var currentExportFeed = ExportFeedService.GetExportFeedInstance(EExportFeedType.YandexMarket.ToString(), exportFeedId);
                currentExportFeed.SetDefaultSettings();

                var settings = ExportFeedSettingsProvider.GetSettings(exportFeedId);
                
                shop.YmlFileUrl = SettingsMain.SiteUrl + "/" + settings.FileFullName;
            }

            var shopKeys = Rees46PartnerService.CreateShop(shop);
            if (shopKeys == null)
                return SetMessageError("Не удалось создать магазин для пользователя.");
            

            Rees46Settings.ShopKey = shopKeys.ShopKey;
            Rees46Settings.SecretKey = shopKeys.SecretKey;

            return new ResponsesApi() {status = true};
        }

        private static ResponsesApi SetMessageError(string message)
        {
            return new ResponsesApi {message = message};
        }

        #endregion
    }
}