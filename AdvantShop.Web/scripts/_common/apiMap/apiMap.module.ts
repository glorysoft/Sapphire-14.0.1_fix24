import apiMapService from './apiMap.service';
import { apiMapKeyDirective } from './apiMap.directives';

export default angular.module('apiMap', []).service('apiMapService', apiMapService).directive('apiMapKey', apiMapKeyDirective).name;
