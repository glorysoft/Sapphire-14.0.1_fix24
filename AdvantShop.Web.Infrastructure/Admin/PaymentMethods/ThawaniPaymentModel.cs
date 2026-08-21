using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using AdvantShop.Core.Common.Attributes;
using AdvantShop.Core.Common.Extensions;
using AdvantShop.Core.Services.Payment;
using AdvantShop.Payment;

namespace AdvantShop.Web.Infrastructure.Admin.PaymentMethods
{
    [PaymentAdminModel("Thawani")]
    public class ThawaniPaymentModel : PaymentMethodAdminModel, IValidatableObject
    {
        public string SecretKey
        {
            get { return Parameters.ElementOrDefault(ThawaniTemplate.SecretKey); }
            set { Parameters.TryAddValue(ThawaniTemplate.SecretKey, value.DefaultOrEmpty()); }
        }

        public string PublishableKey
        {
            get { return Parameters.ElementOrDefault(ThawaniTemplate.PublishableKey); }
            set { Parameters.TryAddValue(ThawaniTemplate.PublishableKey, value.DefaultOrEmpty()); }
        }

        public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
        {
            if (string.IsNullOrWhiteSpace(SecretKey)
                || string.IsNullOrWhiteSpace(PublishableKey))
            {
                yield return new ValidationResult("Заполните обязательные поля");
            }

        }
    }
}