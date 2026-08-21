import pointsMapTemplate from '../templates/pointsMap.html';
import { IDirective } from 'angular';

export default function PointsMapDirective(): IDirective {
    return {
        scope: {
            yaAfterInit: '&',
            yaMapKey: '<',
            yaZoom: '<?',
            mapOptions: '<?',
            yaControls: '<?',
            yaCollectionAfterInit: '&',
            yaClusterCollectionAfterInit: '&',
            yaCollectionOption: '<?',
            yaClasterOption: '<?',
            yaGeoObjectEventClick: '&',
            yaGeoObjectPolygonsAfterInit: '&',
            points: '<',
            polygon: '<?',
            clusterize: '<',
            yaCenter: '<?',
            showAll: '<?',
        },
        controller: 'pointsMapCtrl',
        controllerAs: 'pointsMap',
        bindToController: true,
        templateUrl: pointsMapTemplate,
    };
}
