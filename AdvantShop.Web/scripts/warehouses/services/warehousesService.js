/* @ngInject */
function warehousesService($http, $window, urlHelper) {
    // eslint-disable-next-line no-invalid-this
    const service = this;
    const isUseHashListener = false;
    const hashChangeCallbacks = new Set();

    service.getCartStockInWarehouses = function (warehousesId) {
        return $http
            .post(urlHelper.getAbsUrl('warehouse/getCartStockInWarehouses', true), { warehousesId, rnd: Math.random() })
            .then((response) => response.data);
    };

    service.getWarehousesInfo = function () {
        return $http.get(urlHelper.getAbsUrl('warehouse/getwarehousesinfo', true)).then((response) => response.data);
    };

    service.getWarehousesCities = function () {
        return $http.get(urlHelper.getAbsUrl('warehouse/getwarehousescities', true)).then((response) => response.data);
    };

    service.getOfferWarehousesCities = function (offerId) {
        return $http.get(urlHelper.getAbsUrl('warehouse/getOfferWarehousesCities', true), { params: { offerId } }).then((response) => response.data);
    };

    service.getWarehousesMapData = function (warehouses) {
        return warehouses.map((it, index) => ({
            id: index,
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: [it.Latitude, it.Longitude],
            },
            properties: {},
            store: {
                address: it.Address,
                name: it.Name,
                addressComment: it.AddressComment,
                stockColor: it.StockColor,
                stock: it.Stock,
                workTime: it.TimeOfWorkList,
                type: it.Type,
            },
        }));
    };

    service.getFilterTypes = function (warehousesList) {
        const filterType = new Set();
        warehousesList.forEach((it) => {
            it.Type ? filterType.add(it.Type) : null;
        });
        return Array.from(filterType);
    };

    service.getWarehousesByType = function (type, list) {
        return list.filter((it) => it.store.type === type);
    };

    service.setOnChangeHashListener = function () {
        if (!isUseHashListener) {
            $window.addEventListener('hashchange', (event) => {
                for (const cb of hashChangeCallbacks) {
                    cb(event);
                }
            });
        }
    };

    service.addHashChangeCallback = function (cb) {
        hashChangeCallbacks.add(cb);
    };

    service.removeHashChangeCallback = function (cb) {
        hashChangeCallbacks.delete(cb);
    };
}

export default warehousesService;
