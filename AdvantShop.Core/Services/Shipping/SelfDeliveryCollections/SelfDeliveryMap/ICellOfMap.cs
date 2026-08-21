using AdvantShop.Shipping;

namespace AdvantShop.Core.Services.Shipping.SelfDeliveryCollections.SelfDeliveryMap
{
    /// <summary>
    /// Ячейка сетки карты
    /// </summary>
    public interface ICellOfMap
    {
        /// <summary>
        /// Возвращает координаты области охватывающей ячейку.
        /// </summary>
        /// <param name="typeBound">Тип описания области</param>
        /// <returns>
        /// Возвращает объект <see cref="BoundedBy"/> описывающий область охватывающую ячейку,
        /// через координаты двух противоположных углов.
        /// </returns>
        BoundedBy GetBounds(TypeBound typeBound);
        
        /// <summary>
        /// Указывает, содержится ли указанная точка внутри этой ячейки
        /// </summary>
        /// <param name="point">Объект <see cref="Point"/>, определяющий проверяемую точку.</param>
        /// <returns>
        /// Этот метод возвращает значение true,
        /// если указанная точка содержится в данной ячейке,
        /// в противном случае возвращается значение false.
        /// </returns>
        bool IsVisible(Point point);

        /// <summary>
        /// Указывает, содержится ли указанная точка внутри этой ячейки
        /// </summary>
        /// <param name="latitude">Широта проверяемой точки.</param>
        /// <param name="longitude">Долгота проверяемой точки.</param>
        /// <returns>
        /// Этот метод возвращает значение true,
        /// если указанные координаты точки содержится в данной ячейке,
        /// в противном случае возвращается значение false.
        /// </returns>
        bool IsVisible(decimal latitude, decimal longitude);
    }
}