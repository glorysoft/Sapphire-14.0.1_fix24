/* @ngInject */
export default function WarehousesMapCtrl(warehousesService, $location, WarehousesDisplayStatus, $scope, $translate) {
    const ZOOM_SELECTED_BALLOON = 17;
    const ctrl = this;
    const NATIVE_COMPACT_MODE_BALLOON_PANEL_OPTIONS = {
        panelMaxMapArea: Infinity,
        autoPan: false,
        panelMaxHeightRatio: 0.3,
    };
    const defaultFilterType = $translate.instant('Js.WarehousesMap.All');
    let warehousesMapDataListBackup;

    ctrl.$onInit = () => {
        ctrl.isLoadedMap = false;
        ctrl.isShowMap = false;
        ctrl.isShowList = true;
        ctrl.activeBalloon = null;
        ctrl.activePin = null;
        ctrl.mapControls = 'zoomControl';
        if (ctrl.compactMode) {
            ctrl.setWarehousesDisplayStatus();
        }

        warehousesService.getWarehousesInfo().then((data) => {
            if (data.result === true) {
                ctrl.warehousesList = data.obj;
                ctrl.filterTypes = warehousesService.getFilterTypes(ctrl.warehousesList);
                if (ctrl.filterTypes.length > 0) {
                    ctrl.filterTypes.unshift(defaultFilterType);
                    ctrl.warehouseFilterType = defaultFilterType;
                }
                warehousesMapDataListBackup = warehousesService.getWarehousesMapData(data.obj);
                ctrl.warehousesMapDataList = warehousesMapDataListBackup;
            } else {
                data.errors.forEach((error) => {
                    console.error(error);
                });
            }
        });

        ctrl.mapOptions = {
            suppressMapOpenBlock: true,
        };
        ctrl.zoom = 10;

        warehousesService.setOnChangeHashListener();

        warehousesService.addHashChangeCallback(() => {
            ctrl.setWarehousesDisplayStatus();
            $scope.$apply();
        });
    };

    ctrl.setWarehousesDisplayStatus = function () {
        const hash = $location.hash();
        if (hash === WarehousesDisplayStatus.map) {
            ctrl.showMapWarehouses();
        } else {
            ctrl.showListWarehouses();
        }
    };

    ctrl.getContentBalloon = function (data) {
        return `<div class="warehouses-list">
                    <div class="warehouses-list__item">
                        ${data.address ? `<address class="warehouses-list__shop-address">${data.address}</address>` : ``}
                        ${data.name ? `<strong class="warehouses-list__shop-name">${data.name}</strong>` : ``}
                        ${data.workTime ? `<div class="warehouses-list__work-time">${data.workTime}</div>` : ``}
                    </div>
                </div>`;
    };

    ctrl.showBalloonPlace = function ($event) {
        const objectId = $event.get('objectId');
        const object = this.collection?.objects.getById(objectId);

        if (ctrl._map && object) {
            const _objectId = object.id;
            if (ctrl.compactMode) {
                ctrl.openNativePanelBalloon(object);
            }
            ctrl.resetColorPins();
            ctrl.changeActivePinColor(_objectId);
            ctrl.setActiveBalloon(object);
            ctrl.setActivePin(object);
            ctrl._map.setCenter(ctrl.activePin.geometry.coordinates, ZOOM_SELECTED_BALLOON);
        }
    };

    ctrl.runBalloon = (balloon, index) => {
        if (balloon?.geometry?.coordinates[0] != null && balloon?.geometry?.coordinates[1] != null) {
            ctrl._map?.setCenter(balloon.geometry.coordinates, ZOOM_SELECTED_BALLOON);
        }

        if (ctrl.compactMode) {
            ctrl.openNativePanelBalloon(balloon);
        }

        const pin = ctrl.collection?.objects?.getAll()[index];
        ctrl.resetColorPins();

        if (pin) {
            ctrl.changeActivePinColor(pin.id);
            ctrl.setActivePin(pin);
        }
        ctrl.setActiveBalloon(balloon);
        ctrl.showMap();
        ctrl.hideList();
    };

    ctrl.openNativePanelBalloon = function (balloon) {
        ctrl._map?.balloon.open(balloon.geometry.coordinates, ctrl.getContentBalloon(balloon.store), NATIVE_COMPACT_MODE_BALLOON_PANEL_OPTIONS);
    };

    ctrl.setActivePin = (pin) => {
        ctrl.activePin = pin;
    };

    ctrl.setActiveBalloon = (balloon) => {
        ctrl.activeBalloon = balloon;
    };

    ctrl.resetActiveBalloon = () => {
        ctrl.activeBalloon = null;
    };

    ctrl.backToList = () => {
        ctrl.resetActiveBalloon();
    };

    ctrl.changeActivePinColor = (pinId) => {
        ctrl.collection?.objects.setObjectOptions(pinId, {
            preset: 'islands#redIcon',
        });
    };

    ctrl.resetColorPins = () => {
        ctrl.collection?.objects.options.set('preset', 'islands#blueIcon');
        ctrl.activePin &&
            ctrl.collection?.objects.setObjectOptions(ctrl.activePin.id, {
                preset: 'islands#blueIcon',
            });
    };

    ctrl.handleAfterInitMap = function ($target) {
        ctrl._map = $target;
        ctrl.isLoadedMap = true;
    };

    ctrl.setCollection = function (target) {
        ctrl.collection = target;
    };

    ctrl.showMap = function () {
        ctrl.isShowMap = true;
    };

    ctrl.hideMap = function () {
        ctrl.isShowMap = false;
    };

    ctrl.showList = function () {
        ctrl.isShowList = true;
    };

    ctrl.hideList = function () {
        ctrl.isShowList = false;
    };

    ctrl.resetActiveBalloon = function () {
        ctrl.activeBalloon = null;
    };

    ctrl.filterBy = function (type) {
        ctrl.resetActiveBalloon();
        if (type === defaultFilterType) {
            ctrl.warehousesMapDataList = warehousesMapDataListBackup;
        } else {
            ctrl.warehousesMapDataList = warehousesService.getWarehousesByType(type, warehousesMapDataListBackup);
        }
    };

    ctrl.showListWarehouses = function () {
        $location.hash(WarehousesDisplayStatus.list);
        ctrl.hideMap();
        ctrl.showList();
    };

    ctrl.showMapWarehouses = function () {
        $location.hash(WarehousesDisplayStatus.map);
        ctrl.hideList();
        ctrl.showMap();
    };
}
