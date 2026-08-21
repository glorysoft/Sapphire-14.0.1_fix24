using System.Linq;
using AdvantShop.Core.Services.Bonuses;
using AdvantShop.Core.Services.Orders;
using AdvantShop.Customers;
using AdvantShop.Orders;
using AdvantShop.Web.Infrastructure.Handlers;

namespace AdvantShop.Web.Admin.Handlers.Orders
{
    public class UpdateOrderTotal : AbstractCommandHandler<bool>
    {
        private readonly float? _useBonusesAmount;
        private readonly Order _order;
        private readonly bool _resetOrderCargoParams;

        public UpdateOrderTotal(Order order, bool resetOrderCargoParams = false)
        {
            _order = order;
            _resetOrderCargoParams = resetOrderCargoParams;
        }

        public UpdateOrderTotal(Order order, float? useBonusesAmount, bool resetOrderCargoParams = false)
        {
            _order = order;
            _useBonusesAmount = useBonusesAmount;
            _resetOrderCargoParams = resetOrderCargoParams;
        }

        public UpdateOrderTotal(int orderId, float? useBonusesAmount, bool resetOrderCargoParams = false)
        {
            _order = OrderService.GetOrder(orderId);
            _useBonusesAmount = useBonusesAmount;
            _resetOrderCargoParams = resetOrderCargoParams;
        }

        protected override bool Handle()
        {
            if (_order == null || _order.Payed)
                return false;

            var callBonusOnChangePurchase = false;
            if (!_order.OrderStatus.IsCanceled && (!_order.IsDraft || _useBonusesAmount.HasValue))
            {
                if (_useBonusesAmount != null && BonusSystem.CanChangeApplyBonuses(_order))
                {
                    _order.BonusCost = BonusSystem.GetApplyBonuses(_order, _useBonusesAmount);
                }

                callBonusOnChangePurchase = true;
            }

            if (_resetOrderCargoParams)
            {
                _order.TotalWeight = null;
                _order.TotalHeight = null;
                _order.TotalLength = null;
                _order.TotalWidth = null;
            }

            // пересчет наценки метода оплаты
            if (_order.PaymentMethod != null)
            {
                var payments = new GetPayments(_order).Execute();
                if (payments != null && payments.Count > 0)
                {
                    var payment = payments.FirstOrDefault(x => x.Id == _order.PaymentMethodId);
                    if (payment != null)
                        _order.PaymentCost = payment.Rate;
                }
            }

            var trackChanges = !_order.IsDraft;
            var changedBy = new OrderChangedBy(CustomerContext.CurrentCustomer);

            OrderService.UpdateOrderMain(_order, changedBy: changedBy, trackChanges: trackChanges);
            OrderService.RefreshTotal(_order, changedBy: changedBy, ignoreHistory: !trackChanges);
            if (callBonusOnChangePurchase)
                BonusSystem.OnChangePurchase(_order);
            
            return true;
        }
    }
}
