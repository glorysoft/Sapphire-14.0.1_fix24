using System.Collections.Generic;
using System.Linq;
using AdvantShop.Core.Common.Extensions;
using AdvantShop.Core.SQL2;
using AdvantShop.Web.Admin.Models.Catalog;
using AdvantShop.Web.Infrastructure.Admin;

namespace AdvantShop.Web.Admin.Handlers.Catalog
{
    public class BaseGetCatalogOffers
    {
        private protected (SqlPaging, FilterResult<IAdminCatalogGridProduct>) GetPaging(
            CatalogFilterModel filter,
            bool forIds
        )
        {
            var productIds = GetProductIds(filter, forIds, out var productsResult);
            var paging = new SqlPaging
            {
                ItemsPerPage = 100000,
                CurrentPageIndex = 1
            };

            paging
                .Select(
                    "Product.ProductID",
                    "Product.Name",
                    "Product.Enabled",
                    "Product.Discount",
                    "Product.DiscountAmount",
                    "Product.DoNotApplyOtherDiscounts",
                    "Product.MainCategoryId",
                    "Offer.OfferId",
                    "Offer.ArtNo",
                    "Offer.Price",
                    "Offer.ColorID",
                    "Offer.SizeID",
                    "Offer.Amount",
                    "Color.ColorName",
                    "Size.SizeName",
                    "[Currency].Code".AsSqlField("CurrencyCode"),
                    "[Currency].CurrencyIso3",
                    "[Currency].CurrencyValue",
                    "[Currency].IsCodeBefore",
                    "PhotoName",
                    filter.ShowMethod == ECatalogShowMethod.Normal ? "ProductCategories.SortOrder" : "-1 as SortOrder"
                )
                .From("[Catalog].[Product]")
                .Inner_Join(
                    @"(Select value, sort 
                       From dbo.STRING_SPLIT_INT_WITH_ORDER({0},'/') ) as productIds 
                        on Product.ProductId = productIds.value",
                    string.Join("/", 
                        productIds.Count > 15_000 && filter.ShowMethod == ECatalogShowMethod.AllProducts 
                            ? productIds.GetRange(0, 15_000) 
                            : productIds)
                )
                .Inner_Join("[Catalog].[Offer] ON [Product].[ProductID] = [Offer].[ProductID]")
                .Left_Join("[Catalog].[Color] ON [Color].[ColorId] = [Offer].[ColorId]")
                .Left_Join("[Catalog].[Size] ON [Size].[SizeId] = [Offer].[SizeId]")
                .Left_Join("[Catalog].[Currency] ON [Product].[CurrencyID] = [Currency].[CurrencyID]")
                .Left_Join(@"[Catalog].[Photo] ON [Product].[ProductID] = [Photo].[ObjId] 
                    and Type='Product' AND [Photo].[Main] = 1");

            if (filter.ShowMethod == ECatalogShowMethod.Normal)
            {
                paging.Inner_Join(
                    "[Catalog].[ProductCategories] on [ProductCategories].[ProductId] = [Product].[ProductID]");
                paging.Where("ProductCategories.CategoryID = {0}", filter.CategoryId);

                paging.Select("Category_Size.SizeNameForCategory");
                paging.Left_Join(
                    "[Catalog].[Category_Size] ON Size.SizeId = Category_Size.SizeId and Category_Size.CategoryId = {0}",
                    filter.CategoryId ?? 0);
            }

            Filter(filter, paging);
            Sorting(paging);

            return (paging, productsResult);
        }

        private List<int> GetProductIds(
            CatalogFilterModel filter,
            bool forIds,
            out FilterResult<IAdminCatalogGridProduct> productsResult
        )
        {
            productsResult = null;
            var productIds = new List<int> { -1 };

            if (!forIds)
            {
                // Используем FilterResult от товаров за основу, т.к.
                // он правильно выводит пагинацию в гриде,
                // далее по ProductId получаем модификации,
                // если надо фильтруем, чтобы сузить выборку 
                productsResult = new GetCatalog(filter, true).Execute();

                if (productsResult.DataItems.Count > 0)
                    productIds = productsResult.DataItems
                        .Select(x => x.ProductId)
                        .ToList();
            }
            else
            {
                var ids =
                    new GetCatalog(filter, true)
                        .GetItemsIds<int>("[Product].[ProductId]");

                if (ids.Count > 0)
                    productIds = ids;
            }

            return productIds;
        }

        private void Filter(CatalogFilterModel filter, SqlPaging paging)
        {
            if (!string.IsNullOrWhiteSpace(filter.ArtNo))
                paging.Where("(Product.ArtNo LIKE '%'+{0}+'%' OR Offer.ArtNo LIKE '%'+{0}+'%')", filter.ArtNo);

            if (filter.ColorId != null)
                paging.Where("Offer.ColorID={0}", filter.ColorId);

            if (filter.SizeId != null)
                paging.Where("Offer.SizeID={0}", filter.SizeId);

            if (filter.PriceFrom.HasValue || filter.PriceTo.HasValue)
            {
                if (filter.PriceFrom.HasValue)
                    paging.Where(
                        @"(CASE 
                            WHEN Product.Discount > 0 
                            THEN (Price - Price*Product.Discount/100)*CurrencyValue 
                            ELSE (Price - Product.DiscountAmount)*CurrencyValue END
                        ) >= {0}",
                        filter.PriceFrom);

                if (filter.PriceTo.HasValue)
                    paging.Where(
                        @"(CASE 
                            WHEN Product.Discount > 0 
                            THEN (Price - Price*Product.Discount/100)*CurrencyValue 
                            ELSE (Price - Product.DiscountAmount)*CurrencyValue END
                        ) <= {0}",
                        filter.PriceTo);
            }

            if (filter.AmountFrom != null)
                paging.Where("Amount >= {0}", filter.AmountFrom);

            if (filter.AmountTo != null)
                paging.Where("Amount <= {0}", filter.AmountTo);

            if (!string.IsNullOrWhiteSpace(filter.BarCode))
                paging.Where(
                    "(Product.BarCode LIKE '%'+{0}+'%' OR Offer.BarCode LIKE '%'+{0}+'%')",
                    filter.BarCode);

            if (filter.WarehouseIds != null && filter.WarehouseIds.Count > 0)
                paging.Where(
                    @"Exists(
                        Select 1 
                        From [Catalog].[WarehouseStocks]
                        Where [WarehouseStocks].[OfferId] = [Offer].[OfferID]
                             AND [WarehouseStocks].[WarehouseId] in ({0})
                             AND [WarehouseStocks].[Quantity] > 0)",
                    filter.WarehouseIds.ToArray());

            // TODO: check it
            if (filter.ExcludeIds != null)
            {
                var excludeIds = 
                    filter
                        .ExcludeIds
                        .Split(',')
                        .Select(x => x.TryParseInt())
                        .Where(x => x != 0)
                        .ToList();

                if (excludeIds.Count > 0)
                    paging.Where("Offer.OfferId not in (" + string.Join(",", excludeIds) + ")");
            }
        }

        private void Sorting(SqlPaging paging) =>
            paging
                .OrderBy("productIds.sort")
                .OrderBy("Offer.ProductId")
                .OrderByDesc("Offer.Main");
    }
}