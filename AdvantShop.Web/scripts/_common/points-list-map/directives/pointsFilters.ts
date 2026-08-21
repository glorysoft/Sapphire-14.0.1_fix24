import { IDirective } from 'angular';
import pointsFiltersTemplate from '../templates/pointsFilters.html';

export default function PointsFiltersDirective(): IDirective {
    return {
        restrict: 'AE',
        scope: {
            filters: '<',
            change: '&',
        },
        controller: 'pointsFiltersCtrl',
        controllerAs: '$ctrl',
        bindToController: true,
        templateUrl: pointsFiltersTemplate,
    };
}
