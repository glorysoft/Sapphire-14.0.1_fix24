using System;
using System.Collections.Generic;
using System.Linq;
using AdvantShop.Core;
using AdvantShop.Core.Services.FullSearch;
using AdvantShop.Core.Services.Helpers;
using AdvantShop.Core.SQL;
using AdvantShop.Diagnostics;
using AdvantShop.Module.YandexSearch.Core;

namespace AdvantShop.Module.YandexSearch.Services
{
    public class YandexSearchService
    {
        private static readonly string UrlHost = YandexSearchSettings.Url;

        public SearchResult Find(string term)
        {
            var returned = new SearchResult();

            try
            {
                returned.SearchTerm = term;

                var result = GetFromYandex(term);
                if (result.Documents == null)
                {
                    returned.Hits = 0;
                    returned.SearchResultItems = new List<SearchResultItem>();
                    return returned;
                }

                var resultIds = result.Documents.Select(x => x.Id).ToList();
                List<int> ids;

                if (YandexSearchSettings.IdIsArtNo == false)
                {
                    var stringIds = String.Join("/", resultIds);
                    ids = SQLDataAccess.Query<int>(
                        "Select ProductID From Catalog.Offer " +
                        "Inner join (Select item, sort from [Settings].[ParsingBySeperator](@stringIds,'/')) as dtt on Offer.OfferID = convert(int, dtt.item) " +
                        "Order by dtt.sort",
                        new {stringIds}).Distinct().ToList();
                }
                else
                {
                    var stringIds = String.Join("$#%@*", resultIds);
                    ids = SQLDataAccess.Query<int>(
                        "Select ProductID From Catalog.Offer " +
                        "Inner join (Select item, sort from [Settings].[ParsingBySeperator](@stringIds,'$#%@*')) as dtt on Offer.ArtNo = dtt.item " +
                        "Order by dtt.sort",
                        new {stringIds}).Distinct().ToList();
                }

                returned.Hits = result.DocsTotal;
                returned.SearchResultItems = ids.Select(x => new SearchResultItem() {Id = x}).ToList();
            }
            catch (Exception ex)
            {
                AdvantShop.Diagnostics.Debug.Log.Error(ex);
            }

            return returned;
        }

        private YandexResponceModel GetFromYandex(string term)
        {
            if (string.IsNullOrWhiteSpace(YandexSearchSettings.ApiKey) || string.IsNullOrWhiteSpace(YandexSearchSettings.SearchId))
            {
                Debug.Log.Error(new BlException("настройки Яндекс.поиск ApiKey или SearchId не заданны"));
                return new YandexResponceModel();
            }

            var urlAction = "/v1.0?";

            try
            {
                string requestDtp;

                YandexResponceModel result = null;

                int perPage = 100;
                var countPages = (int)Math.Ceiling((decimal) (Math.Min(YandexSearchSettings.SearchMaxItems, 10_000) / perPage));
                for (int page = 0; page < countPages; page++)
                {
                    requestDtp = string.Format("apikey={0}&text={1}&searchid={2}&page={3}&per_page={4}",
                        YandexSearchSettings.ApiKey, term, YandexSearchSettings.SearchId, page, perPage);

                    var resultRequest = RequestHelper.MakeRequest<YandexResponceModel>(UrlHost + urlAction + requestDtp, method: ERequestMethod.GET);

                    if (resultRequest?.Documents is null)
                        break;
                    
                    if (result is null)
                        result = resultRequest;
                    else if (resultRequest.Documents != null)
                        result.Documents.AddRange(resultRequest.Documents);

                    if (result.DocsTotal <= (page + 1) * perPage)
                        // выбрали все результаты
                        break;
                }
                return result ?? new YandexResponceModel();
            }
            catch (Exception e)
            {
                Debug.Log.Error(e);
            }

            return new YandexResponceModel();
        }
    }
}
