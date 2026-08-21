using AdvantShop.Payment;
using AdvantShop.Web.Infrastructure.Handlers;

namespace AdvantShop.Handlers.PaymentStatus
{
    public class ProcessNotificationHandler : ICommandHandler<string>
    {
        private readonly int _paymentId;

        public ProcessNotificationHandler(int paymentId)
        {
            _paymentId = paymentId;
        }

        public string Execute()
        {
            var method = PaymentService.GetPaymentMethod(_paymentId);

            if (method == null
                || (method.NotificationType & NotificationType.Handler) != NotificationType.Handler)
            {
                return "payment method #" + _paymentId + " not found";
            }

            var paymentResponse = method.ProcessResponse(System.Web.HttpContext.Current);

            return !string.IsNullOrWhiteSpace(paymentResponse) ? paymentResponse : null;
        }
    }
}