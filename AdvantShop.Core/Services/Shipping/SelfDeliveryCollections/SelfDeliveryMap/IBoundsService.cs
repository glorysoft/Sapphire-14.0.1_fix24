using System.Collections.Generic;

namespace AdvantShop.Core.Services.Shipping.SelfDeliveryCollections.SelfDeliveryMap
{
    public interface IBoundsService<out T>
        where T: ICellOfMap
    {
        /// <summary>
        /// Получение коллекции ячеек карты в которые входит область карты.
        /// </summary>
        /// <param name="bounds">Область карты</param>
        /// <returns>Возвращает коллекцию ячеек <see cref="ICellOfMap"/> в которые входит область карты.</returns>
        IReadOnlyCollection<T> BoundsToCellOfMapCollection(BoundedBy bounds);
        
        /// <summary>
        /// Расчет кол-ва ячеек карты в которые входит область карты.
        /// </summary>
        /// <param name="bounds">Область карты</param>
        /// <returns>Возвращает кол-во ячеек в которые входит область карты.</returns>
        int GetCountCellsByBounds(BoundedBy bounds);

        /// <summary>
        /// Получение ячейки карты в которую входит точка.
        /// </summary>
        /// <param name="point">Точка на карте.</param>
        /// <returns>Возвращает ячейку карты в которую входит точка.</returns>
        T GetCellOfMapByPoint(Point point);
        
        /// <summary>
        /// Получение ячейки карты в которую входит координаты точки.
        /// </summary>
        /// <param name="latitude">Широта проверяемой точки.</param>
        /// <param name="longitude">Долгота проверяемой точки.</param>
        /// <returns>Возвращает ячейку карты в которую входят координаты точки.</returns>
        T GetCellOfMapByPoint(decimal latitude, decimal longitude);

        /// <summary>
        /// Получение области карты скорректированной по областям крайних ячеек карты, в которые входят крайние точки переданной области.
        /// </summary>
        /// <param name="bounds">Область карты</param>
        /// <returns>Возвращает скорректированную область.</returns>
        BoundedBy AdjustBoundsUsingCellsOfMap(BoundedBy bounds);
    }
}