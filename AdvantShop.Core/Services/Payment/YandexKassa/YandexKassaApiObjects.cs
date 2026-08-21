using System.Collections.Generic;
using System.Runtime.Serialization;
using AdvantShop.Core.Services.Taxes;
using Newtonsoft.Json;
using Newtonsoft.Json.Converters;

namespace AdvantShop.Core.Services.Payment.YandexKassa
{
    public class NotifyEvent
    {
        public string Type { get; set; }
        public string Event { get; set; }
        public Payment Object { get; set; }
    }

    public class Payment
    {
        public string Id { get; set; }
        public string Status { get; set; }
        public PaymentAmount Amount { get; set; }
        public string Description { get; set; }
        public PaymentRecipient Recipient { get; set; }
        public PaymentConfirmation Confirmation { get; set; }
        public bool Test { get; set; }
        public PaymentMetadata Metadata { get; set; }
        public CancellationDetails CancellationDetails { get; set; }
    }

    public class CreatePayment
    {
        [JsonProperty(Required = Required.Always)]
        public PaymentAmount Amount { get; set; }

        /// <summary>
        /// не более 128 символов
        /// </summary>
        public string Description { get; set; }

        public PaymentReceipt Receipt { get; set; }
        public PaymentRecipient Recipient { get; set; }
        //public string PaymentToken { get; set; }
        //public string PaymentMethodId { get; set; }
        public PaymentMethodData PaymentMethodData { get; set; }
        public CreatePaymentConfirmation Confirmation { get; set; }
        public bool? SavePaymentMethod { get; set; }
        public bool? Capture { get; set; }
        public string ClientIp { get; set; }
        public PaymentMetadata Metadata { get; set; }

        public override int GetHashCode()
        {
            unchecked
            {
                int hash = 17;
                hash = Amount != null ? hash * 23 + Amount.GetHashCode() : hash;
                hash = Description != null ? hash * 23 + Description.GetHashCode() : hash;
                hash = Receipt != null ? hash * 23 + Receipt.GetHashCode() : hash;
                hash = Recipient != null ? hash * 23 + Recipient.GetHashCode() : hash;
                hash = PaymentMethodData != null ? hash * 23 + PaymentMethodData.GetHashCode() : hash;
                hash = Confirmation != null ? hash * 23 + Confirmation.GetHashCode() : hash;
                hash = Capture != null ? hash * 23 + Capture.GetHashCode() : hash;
                hash = ClientIp != null ? hash * 23 + ClientIp.GetHashCode() : hash;
                hash = Metadata != null ? hash * 23 + Metadata.GetHashCode() : hash;
                hash = SavePaymentMethod.HasValue ? hash * 23 + SavePaymentMethod.Value.GetHashCode() : hash;
                return hash;
            }
        }
    }

    public class PaymentMetadata
    {
        public string OrderNumber { get; set; }

        public string CmsName => "AdVantShop.NET";

        public override int GetHashCode()
        {
            unchecked
            {
                int hash = 15;
                hash = OrderNumber != null ? hash * 25 + OrderNumber.GetHashCode() : hash;
                return hash;
            }
        }
    }

    public class PaymentMethodData
    {
        public PaymentMethodData(string type)
        {
            Type = type;
        }
        
        [JsonProperty(Required = Required.Always)]
        public virtual string Type { get; }

        public override int GetHashCode()
        {
            unchecked
            {
                int hash = 13;
                hash = Type != null ? hash * 21 + Type.GetHashCode() : hash;
                return hash;
            }
        }
    }

    public class PaymentMobileMethodData : PaymentMethodData
    {
        public PaymentMobileMethodData() : base(null)
        {
        }
        
        public override string Type => "mobile_balance";

        [JsonProperty(Required = Required.Always)]
        public string Phone { get; set; }

        public override int GetHashCode()
        {
            unchecked
            {
                int hash = base.GetHashCode();
                hash = Type != null ? hash * 21 + Type.GetHashCode() : hash;
                hash = Phone != null ? hash * 21 + Phone.GetHashCode() : hash;
                return hash;
            }
        }
    }

    public class PaymentSberbankBusinessMethodData : PaymentMethodData
    {
        public PaymentSberbankBusinessMethodData() : base(null)
        {
        }
        public override string Type => "b2b_sberbank";

        /// <summary>
        /// Назначение платежа (не больше 210 символов).
        /// </summary>
        [JsonProperty(Required = Required.Always)]
        public string PaymentPurpose { get; set; }
        
        /// <summary>
        /// Данные о налоге на добавленную стоимость (НДС). Платеж может облагаться и не облагаться НДС. Товары могут облагаться по одной ставке НДС или по разным.
        /// </summary>
        [JsonProperty(Required = Required.Always)]
        public VatData VatData { get; set; }

        public override int GetHashCode()
        {
            unchecked
            {
                int hash = base.GetHashCode();
                hash = Type != null ? hash * 21 + Type.GetHashCode() : hash;
                hash = PaymentPurpose != null ? hash * 21 + PaymentPurpose.GetHashCode() : hash;
                hash = VatData != null ? hash * 21 + VatData.GetHashCode() : hash;
                return hash;
            }
        }
    }

    public class VatData
    {
        [JsonProperty(Required = Required.Always)]
        public VatDataType Type { get; set; }
        
        [JsonConverter(typeof(NumbersAsStringConverter))]
        public int? Rate { get; set; }
        public VatDataAmount Amount { get; set; }

        public override int GetHashCode()
        {
            unchecked
            {
                int hash = 17;
                hash = hash * 23 + Type.GetHashCode();
                hash = Rate != null ? hash * 23 + Rate.GetHashCode() : hash;
                hash = Amount != null ? hash * 23 + Amount.GetHashCode() : hash;
                return hash;
            }
        }
    }

    public class VatDataAmount
    {
        [JsonProperty(Required = Required.Always)]
        [JsonConverter(typeof(NumbersAsStringConverter))]
        public float? Value { get; set; }
        
        [JsonProperty(Required = Required.Always)]
        public string Currency { get; set; }

        public override int GetHashCode()
        {
            unchecked
            {
                int hash = 15;
                hash = Value != null ? hash * 25 + Value.GetHashCode() : hash;
                hash = Currency != null ? hash * 25 + Currency.GetHashCode() : hash;
                return hash;
            }
        }
    }

    [JsonConverter(typeof(StringEnumConverter))]
    public enum VatDataType
    {
        /// <summary>
        /// Без НДС
        /// </summary>
        [EnumMember(Value = "untaxed")]UnTaxed,
        
        /// <summary>
        /// Одна ставка у всех товаров
        /// </summary>
        [EnumMember(Value = "calculated")]Calculated,
        
        /// <summary>
        /// Разные ставки
        /// </summary>
        [EnumMember(Value = "mixed")]Mixed,
      
    }

    public class PaymentAmount
    {
        [JsonConverter(typeof(NumbersAsStringConverter))]
        [JsonProperty(Required = Required.Always)]
        public float Value { get; set; }

        [JsonProperty(Required = Required.Always)]
        public string Currency { get; set; }

        public override int GetHashCode()
        {
            unchecked
            {
                int hash = 23;
                hash = hash * 21 + Value.GetHashCode();
                hash = Currency != null ? hash * 21 + Currency.GetHashCode() : hash;
                return hash;
            }
        }
    }

    public class PaymentReceipt
    {
        public ReceiptCustomer Customer { get; set; }

        [JsonProperty(Required = Required.Always)]
        public List<ReceiptItem> Items { get; set; }

        public byte? TaxSystemCode { get; set; }

        public override int GetHashCode()
        {
            unchecked
            {
                int hash = 11;
                hash = Customer != null ? hash * 17 + Customer.GetHashCode() : hash;
                if (Items != null)
                    Items.ForEach(x => hash = x != null ? hash * 17 + x.GetHashCode() : hash);
                hash = TaxSystemCode != null ? hash * 17 + TaxSystemCode.GetHashCode() : hash;
                return hash;
            }
        }
    }

    public class CreateReceipt
    {
        public ReceiptType Type { get; set; }
        
        public string PaymentId { get; set; }
        
        public string RefundId { get; set; }
        public ReceiptCustomer Customer { get; set; }

        [JsonProperty(Required = Required.Always)]
        public List<ReceiptItem> Items { get; set; }

        public bool Send => true;
        public byte? TaxSystemCode { get; set; }
        
        public List<SettlementItem> Settlements { get; set; }

        public override int GetHashCode()
        {
            unchecked
            {
                int hash = 11;
                hash = PaymentId != null ? hash * 17 + PaymentId.GetHashCode() : hash;
                hash = RefundId != null ? hash * 17 + RefundId.GetHashCode() : hash;

                hash = Customer != null ? hash * 17 + Customer.GetHashCode() : hash;
                if (Items != null)
                    Items.ForEach(x => hash = x != null ? hash * 17 + x.GetHashCode() : hash);
                hash = TaxSystemCode != null ? hash * 17 + TaxSystemCode.GetHashCode() : hash;
                if (Settlements != null)
                    Settlements.ForEach(x => hash = x != null ? hash * 17 + x.GetHashCode() : hash);
                hash = hash * 17 + Send.GetHashCode();
                return hash;
            }
        }
    }

    public class Receipt
    {
        public string Id { get; set; }
        public ReceiptType Type { get; set; }

        public string PaymentId { get; set; }
        public ReceiptStatus Status { get; set; }

        public string RefundId { get; set; }

        [JsonProperty(Required = Required.Always)]
        public List<ReceiptItem> Items { get; set; }

        public byte? TaxSystemCode { get; set; }

        public List<SettlementItem> Settlements { get; set; }
    }

    public class SettlementItem
    {
        public SettlementItemType Type { get; set; }
        public PaymentAmount Amount { get; set; }
    
        public override int GetHashCode()
        {
            unchecked
            {
                int hash = 23;
                hash = hash * 21 + Type.GetHashCode();
                hash = Amount != null ? hash * 21 + Amount.GetHashCode() : hash;
                return hash;
            }
        }
    }

    [JsonConverter(typeof(StringEnumConverter))]
    public enum SettlementItemType
    {
        /// <summary>
        /// Безналичный расчет
        /// </summary>
        [EnumMember(Value = "cashless")]Cashless,
        
        /// <summary>
        /// Предоплата (аванс)
        /// </summary>
        [EnumMember(Value = "prepayment")]Prepayment,
        
        /// <summary>
        /// Постоплата (кредит)
        /// </summary>
        [EnumMember(Value = "postpayment")]Postpayment,
        
        /// <summary>
        /// Встречное предоставление
        /// </summary>
        [EnumMember(Value = "consideration")]Consideration,
    }

    [JsonConverter(typeof(StringEnumConverter))]
    public enum ReceiptType
    {
        /// <summary>
        /// Приход
        /// </summary>
        [EnumMember(Value = "payment")]Payment,
        
        /// <summary>
        /// Возврат прихода
        /// </summary>
        [EnumMember(Value = "refund")]Refund,
    }

    [JsonConverter(typeof(StringEnumConverter))]
    public enum ReceiptStatus
    {
        /// <summary>
        /// данные в обработке
        /// </summary>
        [EnumMember(Value = "pending")]Pending,
        
        /// <summary>
        /// чек успешно зарегистрирован
        /// </summary>
        [EnumMember(Value = "succeeded")]Succeeded,
        
        /// <summary>
        /// чек зарегистрировать не удалось
        /// </summary>
        [EnumMember(Value = "canceled")]Canceled,
    }

    public class ReceiptCustomer
    {
        /// <summary>
        /// Не более 256 символов
        /// </summary>
        public string FullName { get; set; }
        public string Inn { get; set; }
        public string Email { get; set; }
        public string Phone { get; set; }

        public override int GetHashCode()
        {
            unchecked
            {
                int hash = 15;
                hash = FullName != null ? hash * 21 + FullName.GetHashCode() : hash;
                hash = Inn != null ? hash * 21 + Inn.GetHashCode() : hash;
                hash = Email != null ? hash * 21 + Email.GetHashCode() : hash;
                hash = Phone != null ? hash * 21 + Phone.GetHashCode() : hash;
                return hash;
            }
        }
    }

    public class ReceiptItem
    {
        /// <summary>
        /// Название товара (не более 128 символов)
        /// </summary>
        [JsonProperty(Required = Required.Always)]
        public string Description { get; set; }

        [JsonConverter(typeof(NumbersAsStringConverter))]
        [JsonProperty(Required = Required.Always)]
        public float Quantity { get; set; }

        [JsonProperty(Required = Required.Always)]
        public PaymentAmount Amount { get; set; }

        [JsonProperty(Required = Required.Always)]
        public byte VatCode { get; set; }
        public ePaymentSubjectType PaymentSubject { get; set; }
        public ePaymentMethodType PaymentMode { get; set; }
        public string Measure { get; set; }
        public string CountryOfOriginCode { get; set; }
        public string CustomsDeclarationNumber { get; set; }
        public string Excise { get; set; }
        public string ProductCode { get; set; }
        public string MarkMode { get; set; }
        public MarkQuantity MarkQuantity { get; set; }
        public MarkCodeInfo MarkCodeInfo { get; set; }

        public override int GetHashCode()
        {
            unchecked
            {
                int hash = 19;
                hash = Description != null ? hash * 21 + Description.GetHashCode() : hash;
                hash = hash * 21 + Quantity.GetHashCode();
                hash = Amount != null ? hash * 21 + Amount.GetHashCode() : hash;
                hash = hash * 21 + VatCode.GetHashCode();
                hash = hash * 21 + PaymentSubject.GetHashCode();
                hash = hash * 21 + PaymentMode.GetHashCode();
                hash = ProductCode != null ? hash * 21 + ProductCode.GetHashCode() : hash;
                hash = MarkMode != null ? hash * 21 + MarkMode.GetHashCode() : hash;
                hash = CountryOfOriginCode != null ? hash * 21 + CountryOfOriginCode.GetHashCode() : hash;
                hash = CustomsDeclarationNumber != null ? hash * 21 + CustomsDeclarationNumber.GetHashCode() : hash;
                hash = Excise != null ? hash * 21 + Excise.GetHashCode() : hash;
                hash = MarkQuantity != null ? hash * 21 + MarkQuantity.GetHashCode() : hash;
                hash = MarkCodeInfo != null ? hash * 21 + MarkCodeInfo.GetHashCode() : hash;
                return hash;
            }
        }
    }

    public class MarkQuantity
    {
        public int Numerator { get; set; }
        public int Denominator { get; set; }

        public override int GetHashCode()
        {
            unchecked
            {
                int hash = 19;
                hash = hash * 21 + Numerator.GetHashCode();
                hash = hash * 21 + Denominator.GetHashCode();
                return hash;
            }
        }
    }

    public class MarkCodeInfo
    {
        public string MarkCodeRaw { get; set; }
        public string Unknown { get; set; }
        [JsonProperty("ean_8")]
        public string Ean8 { get; set; }
        [JsonProperty("ean_13")]
        public string Ean13 { get; set; }
        [JsonProperty("itf_14")]
        public string Itf14 { get; set; }
        [JsonProperty("gs_10")]
        public string Gs10 { get; set; }
        [JsonProperty("gs_1m")]
        public string Gs1M { get; set; }
        public string Short { get; set; }
        public string Fur { get; set; }
        [JsonProperty("egais_20")]
        public string Egais20 { get; set; }
        [JsonProperty("egais_30")]
        public string Egais30 { get; set; }
  
        public override int GetHashCode()
        {
            unchecked
            {
                int hash = 19;
                hash = MarkCodeRaw != null ? hash * 21 + MarkCodeRaw.GetHashCode() : hash;
                hash = Unknown != null ? hash * 21 + Unknown.GetHashCode() : hash;
                hash = Ean8 != null ? hash * 21 + Ean8.GetHashCode() : hash;
                hash = Ean13 != null ? hash * 21 + Ean13.GetHashCode() : hash;
                hash = Itf14 != null ? hash * 21 + Itf14.GetHashCode() : hash;
                hash = Gs10 != null ? hash * 21 + Gs10.GetHashCode() : hash;
                hash = Gs1M != null ? hash * 21 + Gs1M.GetHashCode() : hash;
                hash = Short != null ? hash * 21 + Short.GetHashCode() : hash;
                hash = Fur != null ? hash * 21 + Fur.GetHashCode() : hash;
                hash = Egais20 != null ? hash * 21 + Egais20.GetHashCode() : hash;
                hash = Egais30 != null ? hash * 21 + Egais30.GetHashCode() : hash;
                return hash;
            }
        }
    }

    public class PaymentRecipient
    {
        public string GatewayId { get; set; }

        public override int GetHashCode()
        {
            unchecked
            {
                int hash = 33;
                hash = GatewayId != null ? hash * 51 + GatewayId.GetHashCode() : hash;
                return hash;
            }
        }
    }

    #region CreatePaymentConfirmation

    public abstract class CreatePaymentConfirmation
    {
        [JsonProperty(Required = Required.Always)]
        public abstract string Type { get; }

        /// <summary>
        /// Возможные значения: ru_RU, en_US.
        /// </summary>
        public string Locale { get; set; }

        public override int GetHashCode()
        {
            unchecked
            {
                int hash = 33;
                hash = Type != null ? hash * 27 + Type.GetHashCode() : hash;
                hash = Locale != null ? hash * 27 + Locale.GetHashCode() : hash;
                return hash;
            }
        }
    }

    public class CreatePaymentConfirmationExternal : CreatePaymentConfirmation
    {
        public override string Type { get { return "external"; } }

        public override int GetHashCode()
        {
            unchecked
            {
                int hash = base.GetHashCode();
                hash = Type != null ? hash * 13 + Type.GetHashCode() : hash;
                return hash;
            }
        }
    }

    public class CreatePaymentConfirmationQrCode : CreatePaymentConfirmation
    {
        public override string Type { get { return "qr"; } }

        public override int GetHashCode()
        {
            unchecked
            {
                int hash = base.GetHashCode();
                hash = Type != null ? hash * 13 + Type.GetHashCode() : hash;
                return hash;
            }
        }
    }

    public class CreatePaymentConfirmationRedirect : CreatePaymentConfirmation
    {
        public override string Type { get { return "redirect"; } }
        public bool? Enforce { get; set; }

        [JsonProperty(Required = Required.Always)]
        public string ReturnUrl { get; set; }

        public override int GetHashCode()
        {
            unchecked
            {
                int hash = base.GetHashCode();
                hash = Type != null ? hash * 13 + Type.GetHashCode() : hash;
                hash = Enforce != null ? hash * 13 + Enforce.GetHashCode() : hash;
                hash = ReturnUrl != null ? hash * 13 + ReturnUrl.GetHashCode() : hash;
                return hash;
            }
        }
    }

    public class CreatePaymentConfirmationEmbedded : CreatePaymentConfirmation
    {
        public override string Type { get { return "embedded"; } }

        public override int GetHashCode()
        {
            unchecked
            {
                int hash = base.GetHashCode();
                hash = Type != null ? hash * 13 + Type.GetHashCode() : hash;
                return hash;
            }
        }
    }

    #endregion

    #region PaymentConfirmation

    [JsonConverter(typeof(PaymentConfirmationConverter))]
    public class PaymentConfirmation
    {
        public string Type { get; set; }
    }

    public class PaymentConfirmationExternal : PaymentConfirmation { }

    public class PaymentConfirmationQrCode : PaymentConfirmation
    {
        public string ConfirmationData { get; set; }
    }

    public class PaymentConfirmationRedirect : PaymentConfirmation
    {
        public string ConfirmationUrl { get; set; }
        public bool? Enforce { get; set; }
        public string ReturnUrl { get; set; }
    }

    public class PaymentConfirmationEmbedded : PaymentConfirmation
    {
        public string ConfirmationToken { get; set; }
    }

    #endregion


    public class CancellationDetails
    {
        public string Party { get; set; }
        public string Reason { get; set; }

        public string GetErrorMessage()
        {
            switch (Reason)
            {
                case "3d_secure_failed":
                    return "Не пройдена аутентификация по 3-D Secure.";
                case "call_issuer":
                    return "Оплата данным платежным средством отклонена по неизвестным причинам. Вам следует обратиться в организацию, выпустившую платежное средство.";
                case "canceled_by_merchant":
                    return "Платеж отменен.";
                case "card_expired":
                    return "Истек срок действия банковской карты.";
                case "country_forbidden":
                    return "Нельзя заплатить банковской картой, выпущенной в этой стране.";
                case "expired_on_capture":
                    return "Истек срок списания оплаты. Повторите попытку.";
                case "expired_on_confirmation":
                    return "Истек срок оплаты. Повторите попытку.";
                case "fraud_suspected":
                    return "Платеж заблокирован из-за подозрения в мошенничестве.";
                case "general_decline":
                    return "Причина не детализирована.";
                case "identification_required":
                    return "Превышены ограничения на платежи для кошелька ЮMoney.";
                case "insufficient_funds":
                    return "Не хватает денег для оплаты.";
                case "internal_timeout":
                    return "Технические неполадки на стороне ЮKassa. Повторите попытку.";
                case "invalid_card_number":
                    return "Неправильно указан номер карты.";
                case "invalid_csc":
                    return "Неправильно указан код CVV2 (CVC2, CID).";
                case "issuer_unavailable":
                    return "Организация, выпустившая платежное средство, недоступна.";
                case "payment_method_limit_exceeded":
                    return "Исчерпан лимит платежей для данного платежного средства.";
                case "payment_method_restricted":
                    return "Запрещены операции данным платежным средством.";
                case "permission_revoked":
                    return "Нельзя провести безакцептное списание";
                default:
                    return null;
            }
        }
    }
}
