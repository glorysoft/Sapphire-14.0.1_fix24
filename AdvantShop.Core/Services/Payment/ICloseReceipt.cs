using System;
using AdvantShop.Orders;

namespace AdvantShop.Payment
{
    /// <summary>
    /// Поддержка формирования закрывающих чеков
    /// <para>Для объектов реализующих <see cref="PaymentMethod"/> (<see cref="IPayment"/>)</para>
    /// </summary>
    public interface ICloseReceipt
    {
        /// <summary>
        /// Формирование закрывающего чека в платежной системе
        /// </summary>
        /// <param name="order">Заказ, по которому нужно сформировать закрывающий чек</param>
        CloseReceiptResult CloseReceipt(Order order);
    }

    public class CloseReceiptResult
    {
        private CloseReceiptResult()
        {
        }

        public static CloseReceiptResult CreateSuccessResult(string message = null)
        {
            return new CloseReceiptResult
            {
                Success = true,
                Message = message,
            };
        }

        public static CloseReceiptResult CreateFailedResult(string message, string errorCode = null, bool needMarking = false)
        {
            message = message ?? throw new ArgumentNullException(nameof(message));
            
            return new CloseReceiptResult
            {
                Success = false,
                Message = message,
                ErrorCode = errorCode,
                NeedMarking = needMarking
            };
        }

        /// <summary>
        /// Флаг формирования чека
        /// <value>true - чек успешно сформирован, <para>false - не удалось сформировать чек</para></value>
        /// </summary>
        public bool Success { get; private set; }
        
        /// <summary>
        /// Сопровождающее сообщение
        /// <para>Как для удачного, так и неудачного формирования чека</para>
        /// </summary>
        public string Message { get; private set; }
        
        /// <summary>
        /// Код идентифицирующий тип ошибки, при формировании чека
        /// <remarks>Для внутреннего использования оплатами</remarks>
        /// </summary>
        public string ErrorCode { get; private set; }

        /// <summary>
        /// Флаг необходимости указания маркировки
        /// <value>true - в заказе не хватает маркировки, <para>false - с маркировкой все в порядке</para></value>
        /// </summary>
        public bool NeedMarking { get; set; }
    }
}