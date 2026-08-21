using AdvantShop.Core;
using AdvantShop.Payment;
using AdvantShop.Web.Infrastructure.Handlers;

namespace AdvantShop.Web.Admin.Handlers.Orders.Receipt
{
    public class CloseReceiptHandler : AbstractCommandHandler<bool>
    {
        private readonly int _orderId;

        public CloseReceiptHandler(int orderId)
        {
            _orderId = orderId;
        }

        protected override bool Handle()
        {
            var closeReceiptResult = ClosingReceiptService.CloseReceipt(_orderId);
            if (closeReceiptResult?.Success is true)
                return true;

            throw new BlException(closeReceiptResult?.Message);
        }
    }
}