const eventReady = `shippingTemplateReady`;
const dataSet = new Set();
class ShippingService {
    static cacheCityCoords = new Map();

    /* @ngInject */
    constructor(GEOMETRY_TYPES, urlHelper, $http) {
        this.GEOMETRY_TYPES = GEOMETRY_TYPES;
        this.urlHelper = urlHelper;
        this.$http = $http;
    }
    whenTemplateReady(scope, fn) {
        scope.$on(eventReady, (event) => {
            fn(event);
        });
    }

    fireTemplateReady(scope, value) {
        scope.$emit(eventReady, value);
    }

    saveTemplateState(templateUrl) {
        dataSet.add(templateUrl);
    }

    isTemplateReady(templateUrl) {
        return dataSet.has(templateUrl);
    }
    // map
    getUndrawnPointsMap(shippingPointsMap, renderedShippingPointsMap) {
        return shippingPointsMap.filter(
            (item) => !renderedShippingPointsMap.has(item.original.point.Id) && renderedShippingPointsMap.add(item.original.point.Id),
        );
    }

    getUniquePointsMap(shippingPointsMap) {
        const seenIds = new Set();
        return shippingPointsMap.filter((item) => {
            if (item.id == null || seenIds.has(item.id)) {
                return false;
            }
            seenIds.add(item.id);
            return true;
        });
    }

    getShippingPointMapGeoObj(shippingPoints) {
        return shippingPoints.flatMap((method, i) =>
            method.Points.map((point) => ({
                id: point.Id,
                type: this.GEOMETRY_TYPES.POINT,
                properties: {
                    balloonContent: `<div class="m-b-xs"><b>${point.Name || ''}</b></div>
                                            <div>${point.Description || ''}</div>`,
                },
                store: {
                    address: point.Address || '',
                    addressComment: point.AddressComment || point.Description || '',
                    name: point.Name || point.Address,
                    workTime: point.TimeWorkStr ? [point.TimeWorkStr] : undefined,
                },
                geometry:
                    point.Longitude != null && point.Latitude != null
                        ? {
                              type: this.GEOMETRY_TYPES.POINT,
                              coordinates: [point.Latitude, point.Longitude],
                          }
                        : undefined,
                original: { point, shippingMethod: method },
            })),
        );
    }

    getNewCornerCells = (currentCornerCellsArray, newCornerCellsArray) =>
        newCornerCellsArray.filter((cornerCells) => this.isNewCornerCell(cornerCells, currentCornerCellsArray));

    isNewCornerCell = (newCornerCell, currentCornerCellsArray) =>
        !currentCornerCellsArray.some(
            (cell) =>
                cell.LowerCornerLatitude === newCornerCell.LowerCornerLatitude &&
                cell.UpperCornerLatitude === newCornerCell.UpperCornerLatitude &&
                cell.LowerCornerLongitude === newCornerCell.LowerCornerLongitude &&
                cell.UpperCornerLongitude === newCornerCell.UpperCornerLongitude,
        );

    setCacheCityMapCoords = (cityMapData) => {
        if (!ShippingService.cacheCityCoords.has(cityMapData.id)) {
            ShippingService.cacheCityCoords.set(cityMapData.id, cityMapData);
        }
    };

    getCacheCityMapCoords = (id) => ShippingService.cacheCityCoords.get(id);

    getDeliveryZones = (cityId) =>
        this.$http.post(this.urlHelper.getAbsUrl('/location/getDeliveryZones', true), { cityId }).then((response) => response.data);

    getGeoObjectsDeliveryZones = (deliveryZones) => {
        const geoObjects = [];
        deliveryZones.forEach((it) => {
            geoObjects.push(...it.FeatureCollection.features);
        });
        return geoObjects;
    };
}

export default ShippingService;
