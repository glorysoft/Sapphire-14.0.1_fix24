function isPromise(value) {
    return value !== null && typeof value === 'object' && typeof value.then === 'function';
}

/* @ngInject */
export default function PointsListMapCtrl($location, PointsDisplayStatus, $scope, apiMapService, $q) {
    const ZOOM_SELECTED_BALLOON = 17;
    const ctrl = this;
    const NATIVE_COMPACT_MODE_BALLOON_PANEL_OPTIONS = {
        panelMaxMapArea: Infinity,
        autoPan: false,
        panelMaxHeightRatio: 0.3,
    };
    const isInitPointsListPromise = $q.defer();
    const isInitPointsMapPromise = $q.defer();
    const asyncInitPromise = $q.defer();
    let _prevZoom;

    ctrl.$onInit = () => {
        ctrl.isLoadedMap = false;
        ctrl.isShowList = true;
        ctrl.activeBalloon = null;
        ctrl.activePin = null;
        ctrl.mapControls = 'zoomControl';
        ctrl.apiKeyMap = apiMapService.getMapApiKey();
        ctrl.displayMap = ctrl.displayMap != null ? ctrl.displayMap : true;
        ctrl.showOnlyPointsListByBounds = ctrl.showOnlyPointsListByBounds != null ? ctrl.showOnlyPointsListByBounds : true;
        ctrl.mapApiKey = apiMapService.getMapApiKey();
        ctrl.mapOptions = {
            suppressMapOpenBlock: true,
            ...ctrl.mapOptions,
        };
        ctrl.zoom = 14;
        ctrl.collectionOptions = {
            clusterize: false,
            gridSize: 64,
            ...ctrl.collectionOptions,
        };

        // фильтруем так как может не быть координаты и будет неверно работать карта
        $scope.$watch('pointsListMap.points', (newValue) => {
            if (newValue) {
                const bounds = ctrl._map?.getBounds();
                const [pointsWithCoordsMap, visiblePointsByBounds] = ctrl.getPointsWithCoordsMap(newValue, bounds);
                ctrl.pointsListData = ctrl.showOnlyPointsListByBounds && ctrl.displayMap ? visiblePointsByBounds : pointsWithCoordsMap;
                ctrl.pointsMapData = pointsWithCoordsMap;
            }
        });

        if (!ctrl.displayMap) {
            // если нет карты то резолвим промис карты сразу
            isInitPointsMapPromise.resolve();
        }

        Promise.allSettled([isInitPointsListPromise.promise, isInitPointsMapPromise.promise]).then(() => {
            const promise = this.onInit && this.onInit({ pointsListMapCtrl: ctrl });
            if (isPromise(promise)) {
                promise.then(() => {
                    asyncInitPromise.resolve();
                });
            }
        });
    };

    ctrl.getPointsWithCoordsMap = (points, bounds) => {
        const pointsWithCoordsMap = [];
        const visiblePointsByBounds = [];

        points.forEach((it) => {
            if (it.geometry?.coordinates && it.geometry?.coordinates[0] != null && it.geometry?.coordinates[1] != null) {
                pointsWithCoordsMap.push(it);
                if (bounds) {
                    const coords = it.geometry.coordinates;
                    if (coords[0] >= bounds[0][0] && coords[0] <= bounds[1][0] && coords[1] >= bounds[0][1] && coords[1] <= bounds[1][1]) {
                        visiblePointsByBounds.push(it);
                    }
                }
            }
        });

        return [pointsWithCoordsMap, visiblePointsByBounds];
    };

    ctrl.getContentBalloon = function (data) {
        return `<div class="points-list">
                    <div class="points-list__item">
                        ${data.address ? `<address class="points-list__shop-address">${data.address}</address>` : ``}
                        ${data.addressComment ? `<div class="points-list__address-comment">${data.addressComment}</div>` : ``}
                        ${data.name ? `<strong class="points-list__shop-name">${data.name}</strong>` : ``}
                        ${data.workTime ? `<div class="points-list__work-time">${data.workTime}</div>` : ``}
                        <div ${data.stockColor != null ? `style="color: #${data.stockColor}" ` : ``} class="points-list__availability-count">Доступно: ${data.stock}</div>
                    </div>
                </div>`;
    };

    ctrl.showBalloonPlace = function (balloon, fromCluster = false) {
        if (ctrl._map && balloon) {
            _prevZoom = ctrl._map.getZoom();

            const objectId = balloon.id;
            if (!fromCluster) {
                // если вызванно не из кастомного балуна кластера (когда несколько точек на 1 координате)
                this._map?.balloon.close();
            }
            ctrl.resetColorPins();
            ctrl.changeActivePinColor(objectId);
            ctrl.setActiveBalloon(balloon);
            ctrl.setActivePin(balloon);
            ctrl._map.setCenter(ctrl.activePin.geometry.coordinates, ZOOM_SELECTED_BALLOON);
        }
    };

    ctrl.runBalloon = (point, index) => {
        if (point?.geometry?.coordinates[0] != null && point?.geometry?.coordinates[1] != null) {
            ctrl._map?.setCenter(point.geometry.coordinates, ZOOM_SELECTED_BALLOON);
        }
        const pin = ctrl.collection?.objects?.getAll()[index];
        ctrl.resetColorPins();

        if (pin) {
            ctrl.changeActivePinColor(pin.id);
            ctrl.setActivePin(pin);
        }
        ctrl.setActiveBalloon(point);
        ctrl.showMap();
        ctrl.hideList();
    };

    ctrl.openNativePanelBalloon = function (balloon) {
        ctrl._map?.balloon.open(balloon.geometry.coordinates, ctrl.getContentBalloon(balloon.store), NATIVE_COMPACT_MODE_BALLOON_PANEL_OPTIONS);
    };

    ctrl.setActivePin = (pin) => {
        ctrl.activePin = pin;
    };

    ctrl.changeActivePinColor = (pinId) => {
        ctrl.collection?.objects.setObjectOptions(pinId, {
            preset: 'islands#redIcon',
        });
    };

    ctrl.resetColorPins = () => {
        ctrl.collection?.objects.options.set('preset', ctrl.collectionOptions.preset || 'islands#blueIcon');
        ctrl.activePin &&
            ctrl.collection?.objects.setObjectOptions(ctrl.activePin.id, {
                preset: ctrl.collectionOptions.preset || 'islands#blueIcon',
            });
    };

    ctrl.setActiveBalloon = (balloon) => {
        ctrl.activeBalloon = balloon;
    };

    ctrl.getActivePin = () => ctrl.activePin;

    ctrl.resetActiveBalloon = () => {
        ctrl.activeBalloon = null;
    };

    ctrl.backToList = () => {
        ctrl._map?.balloon.close();
        ctrl.resetColorPins();
        ctrl.resetActiveBalloon();
    };

    ctrl.handleAfterInitMap = ($target) => {
        ctrl._map = $target;
        ctrl.isLoadedMap = true;
        isInitPointsMapPromise.resolve();
    };

    ctrl.setCollection = function (target) {
        ctrl.collection = target;
    };

    ctrl.setClusterCollection = function (target) {
        ctrl.clusterCollection = target;
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

    ctrl.showListPoints = function () {
        $location.hash(PointsDisplayStatus.list);
        ctrl.hideMap();
        ctrl.showList();
    };

    ctrl.showMapPoints = function () {
        $location.hash(PointsDisplayStatus.map);
        ctrl.hideList();
        ctrl.showMap();
    };

    ctrl.resetPointsMap = function () {
        ctrl.backToList();
        ctrl.resetActiveBalloon();

        ctrl._map?.setZoom(_prevZoom || ZOOM_SELECTED_BALLOON);
        $scope.$apply();
        // const bounds = ctrl.clusterize ? ctrl.clusterCollection.getBounds() : ctrl.collection?.getBounds();
        // ctrl._map &&
        //     bounds &&
        //     ctrl._map
        //         .setBounds(bounds, {
        //             checkZoomRange: true,
        //             zoomMargin: 9,
        //         })
        //         .then(() => {
        //             if (ctrl._map.getZoom() > ZOOM_SELECTED_BALLOON) ctrl._map.setZoom(ZOOM_SELECTED_BALLOON);
        //             $scope.$digest();
        //         });
    };

    ctrl.handleSelect = (point) => {
        ctrl.onSelect({ point });
    };

    ctrl.showPointsListPlug = () => {
        ctrl.pointsListCtrl?.showPlug();
    };

    ctrl.hidePointsListPlug = () => {
        ctrl.pointsListCtrl?.hidePlug();
    };

    ctrl.onInitPointsList = (pointsListCtrl) => {
        ctrl.pointsListCtrl = pointsListCtrl;
        isInitPointsListPromise.resolve();
        return asyncInitPromise.promise;
    };
}
