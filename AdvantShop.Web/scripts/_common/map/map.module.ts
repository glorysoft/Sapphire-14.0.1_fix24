import { MapService } from './map.service';

const moduleName = `mapModule`;

angular.module(moduleName, []).service('mapService', MapService);

export default moduleName;
