import PointsListMapCtrl from './controllers/pointsListMap.ctrl';
import PointsMapCtrl from './controllers/pointsMap.ctrl';
import PointsListCtrl from './controllers/pointsList.ctrl';
import PointsFiltersCtrl from './controllers/pointsFilters.ctrl';

import PointsListDirective from './directives/pointsList.directive';
import PointsListMapDirective from './directives/pointsListMap.directive';
import PointsMapDirective from './directives/pointsMap.directive';
import PointsFiltersDirective from './directives/pointsFilters';

import './styles/pointsList.scss';
import './styles/pointsListMap.scss';
import './styles/pointsMap.scss';

import '../../_common/yandexMaps/ya-map-2.1.directive.js';
import '../../_common/yandexMaps/styles.scss';
import './styles/pointsFilters.scss';

export default angular
    .module('pointsListMap', ['yaMap'])
    .directive('pointsListMap', PointsListMapDirective)
    .directive('pointsFilters', PointsFiltersDirective)
    .directive('pointsList', PointsListDirective)
    .directive('pointsMap', PointsMapDirective)
    .controller('pointsListMapCtrl', PointsListMapCtrl)
    .controller('pointsFiltersCtrl', PointsFiltersCtrl)
    .controller('pointsListCtrl', PointsListCtrl)
    .controller('pointsMapCtrl', PointsMapCtrl)
    .constant('PointsDisplayStatus', {
        list: 'shops-list',
        map: 'shops-map',
    }).name;
