using AdvantShop.CMS;
using AdvantShop.Core.Services.Bonuses;
using AdvantShop.Core.Services.Bonuses.Internal;
using AdvantShop.Core.Services.Bonuses.Internal.Service;
using AdvantShop.Core.Services.Catalog;
using AdvantShop.Customers;
using AdvantShop.Models.BonusSystemModule;
using AdvantShop.Orders;
using AdvantShop.Web.Infrastructure.Extensions;
using AdvantShop.Web.Infrastructure.Filters;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.Mvc;
using AdvantShop.Core.Common.Extensions;
using AdvantShop.Core.Services.Localization;
using AdvantShop.SEO;
using AdvantShop.Repository.Currencies;
using Card = AdvantShop.Core.Services.Bonuses.Internal.Model.Card;

namespace AdvantShop.Controllers
{
    public partial class BonusesController : BaseClientController
    {
        public ActionResult GetBonusCard()
        {
            if (!BonusSystem.IsActive)
                return Error404();
            
            var breadCrumbs = new List<BreadCrumbs>()
            {
                new BreadCrumbs(T("MainPage"), Url.AbsoluteRouteUrl("Home")),
                new BreadCrumbs(T("Module.BonusSystem.GetBonusCardTitle"), Url.AbsoluteRouteUrl("GetBonusCardRoute"))
            };
            
            var metaInformation = SetMetaInformation(MetaInfoService.GetDefaultMetaInfo(MetaType.BonusProgram, ""));

            var model = new GetBonusCardViewModel
            {
                BreadCrumbs = breadCrumbs,
                H1 = metaInformation.H1,
                Title = metaInformation.Title
            };

            if (BonusSystem.IsInternal)
            {
                model.BonusTextBlock = InternalBonusSystem.BonusTextBlock;
                model.BonusRightTextBlock = InternalBonusSystem.BonusRightTextBlock;
                model.Grades = InternalBonusSystem.BonusShowGrades
                    ? InternalBonusSystemService.GetGrades()
                    : null;
            }

            SetNgController(Web.Infrastructure.Controllers.NgControllers.NgControllersTypes.BonusPageCtrl);

            return View(model);
        }

        public JsonResult BonusJson()
        {
            var customer = CustomerContext.CurrentCustomer;

            var bonusCard = BonusSystem.GetCard(customer);

            if (bonusCard == null)
            {
                var checkoutData = OrderConfirmationService.Get(customer.Id);
                if (checkoutData?.User.BonusCardNumber != null) 
                    bonusCard = BonusSystem.GetCardByNumber(checkoutData.User.BonusCardNumber);
            }

            if (bonusCard == null && (Session["bonuscard"]?.ToString()).IsNotEmpty()) 
                bonusCard = BonusSystem.GetCardByNumber(Session["bonuscard"].ToString());

            if (bonusCard != null
                // если бонусная не работает с картами,
                // то необходимо при оформлении заказа дать возможность использовать бонусы,
                // если бонусная дает такую возможность
                || !BonusSystem.ImplementICardService)
            {
                var current = MyCheckout.Factory(customer.Id);
                var haveCardAndBonuses = bonusCard?.Bonuses != null;
                var bonusAmount = bonusCard?.Bonuses?.SimpleRoundPrice();

                
                var maxBonus = bonusAmount;
                var bonusApply = BonusSystem.GetApplyBonuses(current.Cart, current.Data.SelectShipping?.FinalRate ?? 0, current.Data.SelectPayment?.Rate ?? 0, bonusAmount);

                if (bonusAmount is null
                    && bonusApply > 0)
                {
                    bonusAmount = bonusApply;
                    maxBonus = bonusApply;
                }
                else if (bonusAmount > bonusApply)
                    maxBonus = bonusApply;
                
                // может быть карта без бонусов и быть начисления
                // // нет карты, нет бонусов, нет начисления за продажу
                // if (!haveCardAndBonuses
                //     && bonusAmount is null)
                //     return Json(null);
     
                maxBonus = (float)Math.Truncate(maxBonus ?? 0);
                var bonusPlus = BonusSystem.GetAccrueBonuses(current.Cart, current.Data.SelectShipping?.FinalRate ?? 0, current.Data.SelectPayment?.Rate ?? 0, 0);
                
                Card internalCard = null;
                if (bonusCard != null
                    && BonusSystem.IsInternal)
                {
                    if (long.TryParse(bonusCard.Number, out long numberAsLong))
                        internalCard = InternalBonusSystemService.GetCard(numberAsLong);
                }

                var temporaryBonuses = internalCard != null
                    ? BonusService.GetAllTemporary(internalCard.CardId)
                        .Select(bonus => new 
                        {
                            Name = bonus.Name,
                            Amount = bonus.Amount,
                            StartDate = bonus.StartDate?.ToString("dd MMMM yyyy"),
                            EndDate = bonus.EndDate?.ToString("dd MMMM yyyy")
                        })
                    : null;
                
                var transactions = internalCard != null 
                    ? TransactionService.GetLastUnitedByDateAndType(internalCard.CardId)
                        .Select(transaction => new
                        {
                            IsAdd = (int)transaction.OperationType % 2 == 0 ? false : true,
                            Amount = (int)transaction.OperationType % 2 == 0 ? -transaction.Amount : transaction.Amount,
                            Foundation = transaction.Basis,
                            Date = transaction.CreateOn.Date == DateTime.Now.Date 
                                ? LocalizationService.GetResourceFormat(
                                    "Bonuses.Bonus.TransactionCreatedToday", 
                                    transaction.CreateOn.ToString("H:mm")
                                ) 
                                : transaction.CreateOn.Date == DateTime.Now.Date.AddDays(-1) 
                                    ? LocalizationService.GetResourceFormat(
                                        "Bonuses.Bonus.TransactionCreatedYesterday", 
                                        transaction.CreateOn.ToString("H:mm")
                                    )
                                    : transaction.CreateOn.ToString("d.MM.yyyy H:mm")
                        })
                    : null;
                
                return Json(new
                {
                    bonus = new
                    {
                        CardNumber = bonusCard?.Number,
                        CardBonuses = bonusCard?.Bonuses?.SimpleRoundPrice(),
                        BonusAmount = bonusAmount,
                        BonusPercent = internalCard?.Grade.BonusPercent,
                        BonusGradeName = internalCard?.Grade.Name,
                        Blocked = internalCard?.Blocked,
                        TemporaryBonuses = temporaryBonuses,
                        Transactions = transactions,
                        TransactionsMode = 0,
                        ShowTransactions = BonusSystem.IsInternal,
                    },
                    bonusText = BonusSystem.IsInternal 
                        ? $"{T("Bonuses.YourBonuses")} {(bonusAmount ?? 0).FormatBonuses()}" + 
                            (maxBonus > 0 && InternalBonusSystem.AllowSpecifyBonusAmount ? $". {T("Bonuses.AvailableBonuses")} {maxBonus.Value.FormatBonuses()}. <br/>{T("Bonuses.SelectBonusAmount")}" : null)
                        : haveCardAndBonuses
                            ? $"{T("Bonuses.YourBonuses")} {(bonusAmount ?? 0).FormatBonuses()}"
                            : $"{T("Bonuses.AvailableBonuses")} {(bonusAmount ?? 0).FormatBonuses()}",
                    applyText = haveCardAndBonuses ? T("Js.Bonuses.ByBonusCard") : "Бонусами",
                    bonusPlus = bonusPlus,
                    maxBonus,
                    rangeSliderStep = CurrencyService.CurrentCurrency.RoundNumbers < 1 ? 1 : CurrencyService.CurrentCurrency.RoundNumbers
                });
            }
            
            return Json(null);
        }

        [HttpPost, ValidateJsonAntiForgeryToken]
        public JsonResult CreateBonusCard()
        {
            if (!BonusSystem.ImplementICardService)
                return Json(new { result = false, error = "Бонусная система не поддерживает работу с бонусными картами." });
                
            var customer = CustomerContext.CurrentCustomer;
            if (!customer.RegistredUser)
                return Json(new { result = false, error = T("Bonuses.UserNotRegistred") });

            var bonusCard = BonusSystem.GetCard(customer);
            if (bonusCard != null)
                return Json(new { result = false, error = T("Bonuses.BonusCardAlreadyRegistered") });

            bonusCard = BonusSystem.CreateCard(customer);
            if (bonusCard is null)
                return Json(new { result = false, error = "Не удалось создать бонусную карту." });

            return Json(new {result = true});
        }
    }
}