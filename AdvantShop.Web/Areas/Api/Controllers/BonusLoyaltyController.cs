using System;
using System.Web.Mvc;
using AdvantShop.Areas.Api.Attributes;
using AdvantShop.Areas.Api.Handlers.BonusLoyalty;
using AdvantShop.Areas.Api.Models.BonusLoyalty;
using AdvantShop.Customers;
using AdvantShop.Web.Infrastructure.Filters;

namespace AdvantShop.Areas.Api.Controllers
{
    [LogRequest, BonusSystem, AntiInjection]
    public class BonusLoyaltyController : BaseApiController
    {
        // Получение бонусной карты по номеру   
        // GET /api/bonus/cards/{number} (/api/bonus/cards/?number={number})
        [HttpGet, AuthApiKey]
        public JsonResult GetCardByNumber(string number) => JsonApi(new GetCustomerBonusCard(number));

        // Получение бонусной карты по покупателю
        // GET /api/bonus/cards/{customerId}
        [HttpGet, AuthApiKey]
        public JsonResult GetCardByCustomer(Guid customerId) => JsonApi(new GetCustomerBonusCard(customerId, false));

        // Создание бонусной карты для покупателя
        // POST /api/bonus/cards/{customerId}/add
        [HttpPost, AuthApiKey]
        public JsonResult CreateBonusCard(Guid customerId) => JsonApi(new CreateBonusCard(customerId));

        // Начисление бонусов
        // POST /api/bonus/cards/{customerId}/bonuses/accept
        [HttpPost, AuthApiKey]
        public JsonResult AcceptBonuses(Guid customerId, AcceptBonusModel model) => JsonApi(new AcceptBonuses(customerId, model));

        // Списание бонусов
        // POST /api/bonus/cards/{customerId}/bonuses/substract
        [HttpPost, AuthApiKey]
        public JsonResult SubstractBonuses(Guid customerId, SubstractBonusModel model) => JsonApi(new SubstractBonuses(customerId, model));

        // Создание бонусной карты для авторизованного покупателя
        // POST api/bonus/cards/me/add
        [HttpPost, AuthApiKeyByUser, AuthUserApi]
        public JsonResult MeCreate() => JsonApi(new CreateBonusCard(CustomerContext.CustomerId));
    }
}