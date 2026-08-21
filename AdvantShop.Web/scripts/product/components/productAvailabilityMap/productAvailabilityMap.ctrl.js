/* @ngInject */
export default function ProductAvailabilityMapCtrl(productService, warehousesService, apiMapService, $translate, $q, zoneService) {
    const ctrl = this;

    ctrl.$onInit = () => {
        ctrl.isLoadingData = true;
        ctrl.mapApiKey = apiMapService.getMapApiKey();
        ctrl.defaultFilterType = $translate.instant('Js.WarehousesMap.All');
        ctrl.warehouseFilters = [];
        ctrl.zoom = ctrl.mobileMode ? 13 : 10;
        ctrl.getCurrentCity().then((city) => {
            this.currentCity = city;
            ctrl.getOfferWarehousesCities(ctrl.offerId)
                .then((cities) => {
                    ctrl.initOfferWarehousesCities(cities);
                    return cities;
                })
                .then((cities) => {
                    const city = cities.find((c) => c.CityId === this.currentCity.CityId);
                    ctrl.getOfferStocks(ctrl.offerId, city?.CityId);
                })
                .catch((e) => {
                    console.error(e);
                })
                .finally(() => {
                    ctrl.isLoadingData = false;
                });
        });
    };

    ctrl.initOfferWarehousesCities = (cities) => {
        const filterValues = cities?.map((it) => ({
                name: it.City,
                value: it.CityId,
            }));

        const cityFromList = filterValues.find((it) => it.CityId === this.currentCity.CityId);

        const currentCityValue = cityFromList ? cityFromList : ctrl.defaultFilterType;

        ctrl.warehouseFilters.push({
            value: currentCityValue,
            callback: ctrl.onChangeCity,
            formControl: {
                name: 'warehousesCity',
                type: 'select',
                label: `${$translate.instant('Js.Warehouses.Filter.City')  }:`,
                values: [
                    {
                        name: ctrl.defaultFilterType,
                        value: undefined,
                    },
                    ...filterValues,
                ],
            },
        });
    };

    ctrl.getOfferWarehousesCities = (offerId) => warehousesService.getOfferWarehousesCities(offerId).then((res) => {
            if (res.result) {
                return (ctrl.warehousesCity = res.obj);
            }
            throw new Error(res.errors.join(' '));
        });

    ctrl.getOfferStocks = (offerId, cityId) => productService.getOfferStocks(offerId, cityId).then((res) => {
            if (res.result === true) {
                return (ctrl.stockListData = warehousesService.getWarehousesMapData(res.obj.Stocks));
            }
            throw new Error(res.errors.join(' '));
        });

    ctrl.onChangeCity = async (city) => await ctrl.getOfferStocks(ctrl.offerId, city?.value);

    ctrl.getCurrentCity = () => zoneService
            .getCurrentCity()
            .then((res) => {
                if (res.result) {
                    return res.obj;
                }
                throw new Error('Сould not determine the city');
            })
            .catch((error) => {
                console.error(error);
            });
}
