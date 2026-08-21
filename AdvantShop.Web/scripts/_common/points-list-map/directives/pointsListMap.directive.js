import pointsListMapTemplate from '../templates/pointsListMap.html';

export default function PointsListMapDirective() {
    return {
        scope: {
            mapData: '<?',
            mapOptions: '<?',
            onInit: '&',
            asyncInit: '<?' /* onInit должен вернуть promise, если нужно подождать данные*/,
            showDetailsPoint: '<?',
            displayMap: '<?',
            center: '<?',
            polygon: '<?',
            points: '<',
            filters: '<?',
            isSelect: '<?',
            onSelect: '&',
            zoom: '<?',
            showOnlyPointsListByBounds: '<?',
            showAll: '<?',
            collectionOptions: '<?',
            yaGeoObjectPolygonsAfterInit: '&',
        },
        controller: 'pointsListMapCtrl',
        controllerAs: 'pointsListMap',
        bindToController: true,
        templateUrl: pointsListMapTemplate,
    };
}
