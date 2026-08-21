using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using AdvantShop.Core.Caching;
using AdvantShop.Core.Common;
using AdvantShop.Core.Scheduler;
using AdvantShop.Core.Services.Shipping.Rules;
using AdvantShop.Diagnostics;
using AdvantShop.Shipping;

namespace AdvantShop.Core.Services.Shipping.SelfDeliveryCollections.SelfDeliveryMap
{
    public class SelfDeliveryMapManager
    {
        protected const string CacheCellKey = "SelfDeliveryMap_Square_";
        protected BoundsServiceBySquareCell _serviceBySquareCell = new BoundsServiceBySquareCell();
        protected ShippingManagerForSelfDeliveryMap _shippingManager;

        private static readonly ConcurrentDictionary<int, ConcurrentDictionary<string, object>> DependencyMapShippingToCacheKeysOfCell =
            new ConcurrentDictionary<int, ConcurrentDictionary<string, object>>();

        public int? TimeLimitMilliseconds
        {
            get => _shippingManager.TimeLimitMilliseconds;
            set => _shippingManager.TimeLimitMilliseconds = value;
        }

        public SelfDeliveryMapManager(ShippingCalculationParameters calculationParameters)
        {
            _shippingManager = new ShippingManagerForSelfDeliveryMap(calculationParameters);
        }

        public SelfDeliveryMapManager(Func<IConfiguratorShippingCalculation, ShippingCalculationParameters> shippingCalculationConfiguration) 
            : this(shippingCalculationConfiguration(ShippingCalculationConfigurator.Configure()))
        { }

        public ShippingManager AddRule(IRule rule) =>
            _shippingManager.AddRule(rule);

        public ShippingManager AddRules(IEnumerable<IRule> rules) =>
            _shippingManager.AddRules(rules);

        public ShippingManager AddRules(params IRule[] rules) =>
            _shippingManager.AddRules(rules);

        public IReadOnlyCollection<ShippingPointsResult> GetShippingPoints(BoundedBy bounds, out IReadOnlyCollection<Square> cells)
        {
            if (_serviceBySquareCell.GetCountCellsByBounds(bounds) > 500)
                throw new ArgumentException("Слишком большой масштаб области просмотра.", nameof(bounds));

            bool cacheUsed = false;
            var boundsByCells = _serviceBySquareCell.AdjustBoundsUsingCellsOfMap(bounds);
            cells = _serviceBySquareCell.BoundsToCellOfMapCollection(boundsByCells);
            List<Square> toCallCells = null;
            var result = new Dictionary<int, List<BaseShippingPoint>>();
            foreach (var cell in cells)
            {
                if (!CacheManager.TryGetValue<IReadOnlyCollection<ShippingPointsResult>>(
                        GetCacheKey(cell), out var pointsResults))
                {
                    if (toCallCells is null)
                        toCallCells = new List<Square>();
                    
                    toCallCells.Add(cell);
                    continue;
                }

                cacheUsed = true;
                foreach (var pointsResult in pointsResults)
                {
                    if (!pointsResult.Points.Any())
                        continue;
                    
                    if (!result.ContainsKey(pointsResult.MethodId))
                        result.Add(pointsResult.MethodId, new List<BaseShippingPoint>());

                    result[pointsResult.MethodId].AddRange(pointsResult.Points);
                }
            }


            if (toCallCells != null
                && toCallCells.Count > 0)
            {
                // var boundsByCells = _serviceBySquareCell.AdjustBoundsUsingCellsOfMap(bounds);
                var boundsForCalc = new BoundedBy(
                    new Point(
                        toCallCells.Max(c => c.UpperCornerLatitude),
                        toCallCells.Min(c => c.UpperCornerLongitude)),
                    new Point(
                        toCallCells.Min(c => c.UpperCornerLatitude) - Square.Size,
                        toCallCells.Max(c => c.UpperCornerLongitude) + Square.Size),
                    TypeBound.TopToBottom);

                CalcShippingPoints(boundsForCalc,
                    pointsResult =>
                    {
                        if (!pointsResult.Points.Any())
                            return;

                        if (!result.ContainsKey(pointsResult.MethodId))
                            result.Add(pointsResult.MethodId, new List<BaseShippingPoint>());

                        result[pointsResult.MethodId].AddRange(pointsResult.Points);
                    });
            }
            
            // обновление кэша
            if (cacheUsed
                && new Random().NextDouble() <= 0.05)//5% запросов
                TaskManager.TaskManagerInstance().AddTask(() => CalcShippingPoints(boundsByCells, null));

            return result
                  .Select(pair =>
                       new ShippingPointsResult
                       {
                           MethodId = pair.Key,
                           Points = pair.Value
                       })
                  .ToList();
        }

        protected static string GetCacheKey(Square cell)
        {
            return CacheCellKey + cell.GetHashCode();
        }

        private bool CalcShippingPoints(BoundedBy bounds, Action<ShippingPointsResult> actionByResult)
        {
            try
            {
                var pointsResults = _shippingManager.GetShippingPoints(bounds, false);
                if (pointsResults is null)
                    return false;

                if (pointsResults.Count == 0)
                    return true;

                var listMethodIds = new HashSet<int>();
                var cells = _serviceBySquareCell.BoundsToCellOfMapCollection(bounds);
                foreach (var cell in cells)
                {
                    listMethodIds.Clear();
                    var cellResults = new List<ShippingPointsResult>();
                    foreach (var pointsResult in pointsResults)
                    {
                        var cellPoints =
                            pointsResult.Points
                                        .Where(p => p.Latitude.HasValue)
                                        .Where(p => p.Longitude.HasValue)
                                        .Where(p =>
                                             cell.IsVisible((decimal) p.Latitude.Value, (decimal) p.Longitude.Value))
                                        .ToList();
                        
                        if (cellPoints.Count == 0)
                            continue;
                        
                        cellResults.Add(new ShippingPointsResult()
                        {
                            MethodId = pointsResult.MethodId,
                            Points = cellPoints
                        });
                        listMethodIds.Add(pointsResult.MethodId);
                    }

                    var cacheKeyOfCell = GetCacheKey(cell);
                    CacheManager.Insert(
                        cacheKeyOfCell,
                        cellResults.AsReadOnly(),
                        30);
                    
                    foreach (var methodId in listMethodIds)
                    {
                        DependencyMapShippingToCacheKeysOfCell
                            .GetOrAdd(
                                methodId,
                                _ => new ConcurrentDictionary<string, object>())
                            .TryAdd(cacheKeyOfCell, null);
                    }
                }

                if (actionByResult != null)
                    pointsResults.ForEach(actionByResult);
                
                return true;
            }
            catch (Exception ex)
            {
                Debug.Log.Warn(ex);
                return false;
            }
        }

        internal static void ClearCacheCellsByShippingMethod(int methodId)
        {
            if (DependencyMapShippingToCacheKeysOfCell.TryRemove(methodId, out var listCacheKeys))
                foreach (var kv in listCacheKeys)
                    CacheManager.Remove(kv.Key);
        }
    }
}