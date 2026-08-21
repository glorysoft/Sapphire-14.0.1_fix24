using System;
using System.Collections.Generic;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading;
using System.Web;
using System.Web.Mvc;
using System.Web.Mvc.Html;
using System.Web.Routing;
using AdvantShop.Catalog;
using AdvantShop.CDN;
using AdvantShop.CMS;
using AdvantShop.Core.Common.Extensions;
using AdvantShop.Core.Services.Localization;
using AdvantShop.Customers;
using AdvantShop.Repository;
using AdvantShop.ViewModel.StaticBlock;
using AdvantShop.Web.Infrastructure.Extensions;
using AdvantShop.Core.Services.InplaceEditor;
using AdvantShop.Configuration;
using AdvantShop.Core.Services.Diagnostics;
using AdvantShop.Core;
using AdvantShop.Core.Common;
using AdvantShop.Helpers;
using AdvantShop.ViewCommon;
using Quartz.Util;

namespace AdvantShop.Extensions
{
    public static partial class HtmlExtensions
    {
        public static MvcHtmlString StaticBlock(this HtmlHelper helper, string key, string cssClass = null,
            bool onlyContent = false)
        {
            var sb = StaticBlockService.GetPagePartByKeyWithCache(key);

            if (sb == null || !sb.Enabled || DebugMode.IsDebugMode(eDebugMode.StaticBlocks))
                return MvcHtmlString.Create("");

            if (onlyContent)
                return MvcHtmlString.Create(sb.Content);

            var content = sb.Content;
            var canUseInplace = InplaceEditorService.CanUseInplace(RoleAction.Store) &&
                                MobileHelper.IsMobileEnabled() == false;

            if (content.IsNotEmpty() && canUseInplace)
            {
                content = InplaceEditorService.PrepareContent(content);
            }

            var sbModel = new StaticBlockViewModel()
            {
                CssClass = cssClass,
                InplaceAttributes = canUseInplace ? helper.InplaceStaticBlock(sb.StaticBlockId) : new HtmlString(""),
                OnlyContent = onlyContent,
                Content = content,
                Key = sb.Key,
                CanUseInplace = canUseInplace
            };

            return helper.Partial("_StaticBlock", sbModel);
        }

        public static MvcHtmlString Captcha(this HtmlHelper helper, string ngModel, string ngModelSource = null,
            string captchaId = null, CaptchaMode? captchaMode = null,
            int? codeLength = null)
        {
            return helper.Action("Captcha", "Common",
                new { ngModel, ngModelSource, captchaId, captchaMode, codeLength });
        }

        public static MvcHtmlString Rating(this HtmlHelper helper, double rating, int objId = 0, string url = null,
            bool readOnly = true, string binding = null)
        {
            return helper.Action("Rating", "Common",
                new RouteValueDictionary()
                {
                    { "objId", objId },
                    { "rating", rating },
                    { "url", url },
                    { "readOnly", readOnly },
                    { "binding", binding },
                    { "area", "" }
                });
        }

        public static HtmlString RenderCustomOptions(this HtmlHelper helper, List<EvaluatedCustomOptions> evlist)
        {
            if (evlist == null || evlist.Count == 0)
                return new MvcHtmlString("");

            var html = new StringBuilder("<ul class=\"cart-full-properties\">");
            foreach (var ev in evlist)
            {
                html.AppendFormat(
                    "<li class=\"cart-full-properties-item\"><div class=\"cart-full-properties-name cs-light\">{0}{2}</div> <div class=\"cart-full-properties-value\">{1} {3}</div></li>",
                    ev.CustomOptionTitle, ev.OptionTitle, !string.IsNullOrEmpty(ev.OptionTitle) ? ":" : "",
                    ev.OptionAmount > 1 ? "x " + ev.OptionAmount.ToString() : "");
            }

            html.Append("</ul>");

            return new HtmlString(html.ToString());
        }

        public static HtmlString GetCityPhone(this HtmlHelper helper, bool encode = false, bool isPhoneLink = false)
        {
            return new HtmlString(encode
                ? helper.AttributeEncode(CityService.GetPhone(isPhoneLink))
                : CityService.GetPhone(isPhoneLink));
        }

        public static MvcHtmlString SingleBreadCrumb(this HtmlHelper helper, string name)
        {
            var breadCrumbs = new List<BreadCrumbs>();
            var url = new UrlHelper(helper.ViewContext.RequestContext);
            breadCrumbs.Add(new BreadCrumbs(LocalizationService.GetResource("MainPage"), url.AbsoluteRouteUrl("Home")));
            breadCrumbs.Add(new BreadCrumbs(name, string.Empty));
            return helper.Action("BreadCrumbs", "Common",
                new RouteValueDictionary() { { "breadCrumbs", breadCrumbs } });
        }

        public static HtmlString Numerals(this HtmlHelper helper, float count, string zeroText, string oneText,
            string twoText, string fiveText)
        {
            return new HtmlString(count + " " + Strings.Numerals(count, zeroText, oneText, twoText, fiveText));
        }

        public static HtmlString Numerals(this HtmlHelper helper, float count, IHtmlString zeroText,
            IHtmlString oneText, IHtmlString twoText, IHtmlString fiveText)
        {
            return new HtmlString(count + " " + Strings.Numerals(count, zeroText, oneText, twoText, fiveText));
        }


        public static HtmlString GetCustomerManager(this HtmlHelper helper)
        {
            return new HtmlString(CustomerService.GetCurrentCustomerManager());
        }


        public static string GetToolbarClass(this HtmlHelper helper)
        {
            return SettingsDesign.DisplayToolBarBottom || !AdvantShop.Helpers.MobileHelper.IsMobileBrowser()
                ? "toolbar-bottom-enabled"
                : "toolbar-bottom-disabled";
        }

        public static HtmlString Preload(this HtmlHelper helper, string fileName, string ext, string type)
        {
            var pathData = new AssetsTool.PathData("");

            var path = pathData.GetPathByOriginalFileName(fileName);
            if (path != null)
            {
                return new HtmlString(string.Format("<link rel=\"preload\" as=\"{0}\" href=\"{1}\" crossorigin>", type,
                    path));
            }

            return new HtmlString("");
        }

        public static HtmlString PreloadFonts(this HtmlHelper helper, List<string> filePathList)
        {
            var result = "";
            var tempExt = "";
            var basePath = CDNService.UseCDN(eCDN.Fonts) ? CDNService.GetCDNUrl(eCDN.Fonts) + "/" : "fonts/";
            for (var i = 0; i < filePathList.Count; i++)
            {
                tempExt = FileHelpers.GetExtension(filePathList[i]);
                if (FileHelpers.CheckFileExtensionByType(tempExt, EFileType.Font))
                {
                    result += String.Format(
                        "<link rel=\"preload\" as=\"font\" href=\"{0}\" type=\"font/{1}\" crossorigin>\n\r",
                        basePath + filePathList[i], tempExt.Substring(1));
                }
            }

            return new HtmlString(result);
        }


        private static string RenderAttribute(string key, string ngValue, string value)
        {
            if (ngValue.IsNullOrWhiteSpace() && value.IsNullOrWhiteSpace())
                return "";

            if (ngValue.IsNotEmpty() && value.IsNotEmpty())
                return $"{key}='{ngValue} || {value}' ";
            
            if (ngValue.IsNotEmpty())
                return $"{key}='{ngValue}' ";
            
            if (value.IsNotEmpty())
                return $"{key}='{value}' ";

            return "";
        }

        public static HtmlString RenderCartAddAttributes(this HtmlHelper helper, CartAddViewModel model)
        {
            StringBuilder sb = new StringBuilder("data-cart-add ");
            StringBuilder sbOffers = new StringBuilder();

            if (model.OfferIds != null && model.OfferIds.Count > 0)
            {
                sbOffers.Append("[");
                model.OfferIds.ForEach(id => { sbOffers.AppendFormat("{0},", id); });
                sbOffers.Append("]");
                sb.Append(RenderAttribute("data-offer-ids", model.NgOfferIds, sbOffers.ToString()));
            }


            sb.Append(RenderAttribute("data-offer-id", model.NgOfferId,
                model.OfferId.HasValue ? model.OfferId.Value.ToString() : string.Empty));

            sb.Append(RenderAttribute("data-product-id", model.NgProductId,
                model.ProductId.HasValue ? model.ProductId.Value.ToString() : string.Empty));
            sb.Append(RenderAttribute("data-amount", model.NgAmount,
                model.Amount.HasValue ? model.Amount.Value.ToInvariantString() : string.Empty));
            sb.Append(RenderAttribute("data-attributes-xml", model.NgAttributesXml, model.AttributesXml));
            sb.Append(RenderAttribute("data-payment", model.NgPayment,
                model.Payment.HasValue ? model.Payment.Value.ToString() : string.Empty));
            sb.Append(RenderAttribute("data-cart-add-valid", model.NgCartAddValid, ""));
            sb.Append(RenderAttribute("data-mode", model.NgMode, model.Mode));
            sb.Append(RenderAttribute("data-lp-id", model.NgLpId,
                model.LpId.HasValue ? model.LpId.Value.ToString() : string.Empty));
            sb.Append(RenderAttribute("data-lp-up-id", model.NgLpUpId, model.LpUpId));
            sb.Append(RenderAttribute("data-lp-entity-id", model.NgLpEntityId,
                model.LpEntityId.HasValue ? model.LpEntityId.Value.ToString() : string.Empty));
            sb.Append(RenderAttribute("data-lp-entity-type", model.NgLpEntityType, model.LpEntityType));
            sb.Append(RenderAttribute("data-lp-block-id", model.NgLpBlockId,
                model.LpBlockId.HasValue ? model.LpBlockId.Value.ToString() : string.Empty));
            sb.Append(RenderAttribute("type", "", model.TypeButton));
            sb.Append(RenderAttribute("tab-index", "",
                model.TabIndex.HasValue ? model.TabIndex.Value.ToString() : string.Empty));
            sb.Append(RenderAttribute("aria-label", "", model.AriaLabel));
            sb.Append(RenderAttribute("data-hide-shipping", model.NgHideShipping, model.HideShipping));
            sb.Append(RenderAttribute("data-source", model.NgSource, model.Source));
            sb.Append(RenderAttribute("data-force-hidden-popup", model.NgForceHiddenPopup, ""));
            sb.Append(RenderAttribute("data-mode-from", model.NgModeFrom, model.ModeFrom));
            sb.Append(RenderAttribute("data-lp-button-name", model.NgLpButtonName, model.LpButtonName));
            sb.Append(RenderAttribute("data-href", "", model.Href));
            sb.Append(RenderAttribute("data-cart-add-type",
                model.NgCartAddType != null ? "\"" + model.NgCartAddType + "\"" : "",
                "\"" + model.CartAddType.ToString() + "\""));
            sb.Append(RenderAttribute("data-lp-price-value", model.NgLpPriceValue, ""));

            return new HtmlString(sb.ToString());
        }

        public static MvcHtmlString LinkHref(this HtmlHelper helper, string hrefValue, bool? scrollToBlock = null,
            ScrollToBlockOptions scrollToBlockOptions = null)
        {
            var scrollToBlockValue = scrollToBlock.HasValue ? scrollToBlock.Value : SettingsDesign.OnePageCatalog;
            return new MvcHtmlString(scrollToBlockValue
                ? $"href=\"#{StringHelper.ToAnchor(hrefValue)}\" data-scroll-to-block {ScrollToBlockRenderOptions(scrollToBlockOptions)}"
                : $"href=\"{hrefValue}\"");
        }

        private static string ScrollToBlockRenderOptions(ScrollToBlockOptions scrollToBlockOptions = null)
        {
            return scrollToBlockOptions == null
                ? string.Empty
                : "data-scroll-to-block-options=\"{delay: " + (scrollToBlockOptions.Delay.HasValue
                    ? scrollToBlockOptions.Delay.Value.ToString()
                    : "null") + "}\"";
        }

        public class ScrollToBlockOptions
        {
            public int? Delay { get; set; }
        }
        
        // https://github.com/twbs/rfs
        public static string AdaptiveCssCalc(this HtmlHelper helper, int value, int breakpoint = 1400, double baseValue = 1.25, double factor = 10, 
            string unit = "rem", int remValue = 16, bool twoDimensional = false)
        {
            // Вычисляем минимальное значение
            var valueMin = baseValue + (Math.Abs(value) - baseValue) / factor;

            // Вычисляем разницу между значением и минимальным значением
            var valueDiff = Math.Abs(value) - valueMin;

            // Форматируем базовое значение в зависимости от единицы измерения
            string minWidth;
            if (unit == "rem")
            {
                var remValueNew = valueMin / remValue;
                minWidth = $"{remValueNew.ToString("F6", System.Globalization.CultureInfo.InvariantCulture)}rem";
            }
            else
            {
                minWidth = $"{valueMin.ToString("F2", System.Globalization.CultureInfo.InvariantCulture)}px";
            }

            // Учитываем отрицательное значение
            if (value < 0)
            {
                minWidth = $"-{minWidth}";
            }

            // Выбираем единицу измерения
            var variableUnit = twoDimensional ? "vmin" : "vw";

            // Вычисляем переменную ширину
            var variableWidthValue = valueDiff * 100 / breakpoint;
            var variableWidth =
                $"{variableWidthValue.ToString("F6", System.Globalization.CultureInfo.InvariantCulture)}{variableUnit}";

            // Формируем итоговое значение
            var operation = value < 0 ? " - " : " + ";
            var result = $"calc({minWidth}{operation}{variableWidth})";

            return result;
        }
    }
}