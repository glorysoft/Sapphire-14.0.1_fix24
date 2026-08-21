using AdvantShop.Core.Common.Attributes;
using Newtonsoft.Json;
using Newtonsoft.Json.Converters;

namespace AdvantShop.Core.Services.Taxes
{
    [JsonConverter(typeof(StringEnumConverter))]
    public enum ePaymentSubjectType
    {
        /// <summary>
        /// товар
        /// </summary>
        [Localize("Admin.Core.Services.Taxes.PaymentAttributes.Product")]
        commodity = 1,

        /// <summary>
        ///  подакцизный товар
        /// </summary>
        [Localize("Admin.Core.Services.Taxes.PaymentAttributes.ExciseGoods")]
        excise = 2,

        /// <summary>
        /// работа
        /// </summary>
        [Localize("Admin.Core.Services.Taxes.PaymentAttributes.Job")]
        job = 3,

        /// <summary>
        /// услуга
        /// </summary>
        [Localize("Admin.Core.Services.Taxes.PaymentAttributes.Service")]
        service = 4,

        /// <summary>
        /// ставка в азартной игре
        /// </summary>
        [Localize("Admin.Core.Services.Taxes.PaymentAttributes.BetGamblingGame")]
        gambling_bet = 5,

        /// <summary>
        /// выигрыш в азартной игре
        /// </summary>
        [Localize("Admin.Core.Services.Taxes.PaymentAttributes.WinningGamblingGame")]
        gambling_prize = 6,

        /// <summary>
        ///  лотерейный билет
        /// </summary>
        [Localize("Admin.Core.Services.Taxes.PaymentAttributes.LotteryTicket")]
        lottery = 7,

        /// <summary>
        /// выигрыш в лотерею
        /// </summary>
        [Localize("Admin.Core.Services.Taxes.PaymentAttributes.WinningLottery")]
        lottery_prize = 8,

        /// <summary>
        /// результаты интеллектуальной деятельности
        /// </summary>
        [Localize("Admin.Core.Services.Taxes.PaymentAttributes.ResultsIntellectualActivity")]
        intellectual_activity = 9,

        /// <summary>
        /// платеж
        /// </summary>
        [Localize("Admin.Core.Services.Taxes.PaymentAttributes.Payment")]
        payment = 10,

        /// <summary>
        ///  агентское вознаграждение
        /// </summary>
        [Localize("Admin.Core.Services.Taxes.PaymentAttributes.AgentsFee")]
        agent_commission = 11,

        /// <summary>
        ///  несколько вариантов
        /// </summary>
        [Localize("Admin.Core.Services.Taxes.PaymentAttributes.SeveralOptions")]
        composite = 12,

        /// <summary>
        /// другое
        /// </summary>
        [Localize("Admin.Core.Services.Taxes.PaymentAttributes.Other")]
        another = 13
    }

    [JsonConverter(typeof(StringEnumConverter))]
    public enum ePaymentMethodType
    {
        /// <summary>
        /// полная предоплата
        /// </summary>
        [Localize("Admin.Core.Services.Taxes.PaymentAttributes.FullPrepayment")]
        full_prepayment = 1,

        /// <summary>
        /// частичная предоплата
        /// </summary>
        [Localize("Admin.Core.Services.Taxes.PaymentAttributes.PartialPrepayment")]
        partial_prepayment = 2,

        /// <summary>
        /// аванс
        /// </summary>
        [Localize("Admin.Core.Services.Taxes.PaymentAttributes.Advance")]
        advance = 3,

        /// <summary>
        /// полный расчет
        /// </summary>
        [Localize("Admin.Core.Services.Taxes.PaymentAttributes.FullPayment")]
        full_payment = 4,

        /// <summary>
        /// частичный расчет и кредит
        /// </summary>
        [Localize("Admin.Core.Services.Taxes.PaymentAttributes.PartialPaymentAndCredit")]
        partial_payment = 5,

        /// <summary>
        /// кредит
        /// </summary>
        [Localize("Admin.Core.Services.Taxes.PaymentAttributes.Credit")]
        credit = 6,

        /// <summary>
        /// выплата по кредиту
        /// </summary>
        [Localize("Admin.Core.Services.Taxes.PaymentAttributes.LoanRepayment")]
        credit_payment = 7
    }
}
