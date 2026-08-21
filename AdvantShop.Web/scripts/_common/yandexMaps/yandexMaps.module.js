import yandexMapsService from './yandexMapsService.js';
import './ya-map-2.1.directive.js';

const moduleName = 'yandexMaps';

angular.module(moduleName, ['yaMap']).service('yandexMapsService', yandexMapsService);

export default moduleName;
