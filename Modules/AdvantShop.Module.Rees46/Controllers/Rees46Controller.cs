using System;
using System.Linq;
using System.Web.Mvc;
using AdvantShop.Catalog;
using AdvantShop.Configuration;
using AdvantShop.Customers;
using AdvantShop.Diagnostics;
using AdvantShop.Module.Rees46.Domain;
using AdvantShop.Orders;
using AdvantShop.Web.Infrastructure.Controllers;
using System.Collections.Generic;

namespace AdvantShop.Module.Rees46.Controllers
{
    public class Rees46Controller : ModuleController
    {
        public ActionResult GetScript()
        {
            if (Request.UserAgent != null && Request.UserAgent.Contains("Chrome-Lighthouse"))
            {
                return Content(string.Empty);
            }

            var customer = CustomerContext.CurrentCustomer;

            var str = 
                "<script type=\"text/javascript\"> \n" + 
                "  (function(r){ window.r46 = window.r46 || function(){ (r46.q = r46.q ||[]).push(arguments)};var s = document.getElementsByTagName(r)[0], rs = document.createElement(r); rs.async = 1; rs.src = '//cdn.rees46.ru/v3.js';s.parentNode.insertBefore(rs, s); })('script');" +
                "  r46('init','" + Rees46Settings.ShopKey + "');\n" +
                
                (customer != null && customer.RegistredUser
                    ? "r46('profile', 'set', { id: '" + customer.Id + "', email: '" + customer.EMail + "' } );"
                    : "") +

                "</script>\n";

            return Content(str);
        }

        public JsonResult TrackCart()
        {
            return Json(ShoppingCartService.CurrentShoppingCart.Select(x => new { id = x.OfferId, amount = x.Amount }));
        }

        public JsonResult GetProductForEvent(int offerId, int? productId, int? amount, TypeEvent type, string recommend_by)
        {
            var result = Rees46Service.GetTrackItem(offerId, productId, amount, type, recommend_by);
            return Json(result);
        }

        public ActionResult ShoppingcartAfter()
        {
            if (string.IsNullOrEmpty(Rees46Settings.CartCode) || CustomerContext.CurrentCustomer == null)
                return new EmptyResult();

            return Content(Rees46Service.GetRecomender(PageType.Cart));
        }

        public ActionResult CheckoutFinalStep(IOrder order)
        {
            try
            {
                var productsTemp = order.OrderItems.Where(x => x.ProductID > 0);
                var productsList = new List<ProductRees46>();
                foreach (var item in productsTemp)
                {
                    if(item.ProductID == null)
                        continue;
                    var offer = OfferService.GetProductOffers(item.ProductID.Value).Find(x => x.ArtNo == item.ArtNo);
                    if(offer == null)
                        continue;
                    productsList.Add(new ProductRees46()
                    {
                        Id = offer.OfferId,
                        Price = offer.BasePrice.ToString().Replace(",","."),
                        Amount = item.Amount
                    });
                }
                var obj = new TrackItem()
                {
                    Order = order.Number,
                    OrderPrice = order.Sum.ToString().Replace(",", "."),
                    Products = productsList.ToArray()
                };
                return Content(Rees46Service.TrackView(obj,TypeEvent.purchase));
            }
            catch (Exception ex)
            {
                Debug.Log.Error(ex);
            }

            return new EmptyResult();
        }

        public ActionResult ProductRight(Product product, Offer offer)
        {
            if (product == null || offer == null)
                return new EmptyResult();

            var obj = Rees46Service.GetTrackItem(offer, null, TypeEvent.view, "none");

            return Content(Rees46Service.TrackView(obj, TypeEvent.view));
        }

        public ActionResult CategoryTop(Category category)
        {
            if (category == null)
                return new EmptyResult();

            var trackCategory = string.Format(Rees46Service.FormatTrack, "category", category.CategoryId);

            var html = Rees46Service.GetRecomender(PageType.CategoryTop, category.CategoryId);

            return Content(trackCategory + "\r\n " + html);
        }

        public ActionResult CategoryBottom(Category category)
        {
            if (category == null)
                return new EmptyResult();

            return Content(Rees46Service.GetRecomender(PageType.CategoryBottom, category.CategoryId));
        }

        public ActionResult MainPage()
        {
           return Content(Rees46Service.GetRecomender(PageType.MainPage));
        }

        public ActionResult Search(string q)
        {
            var track = string.Format(Rees46Service.FormatTrack, "search", "\"" + q + "\"");

            return Content(track);
        }

        public ActionResult SuggestionsInSearch()
        {
            return Content(Rees46Settings.UseSuggestionsInSearch ? "<div class='rees46-use-suggestions'></div>" : "");
        }
    }
}
