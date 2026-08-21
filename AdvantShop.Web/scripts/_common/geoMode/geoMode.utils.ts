import GeoModeService from './geoMode.service';

const moduleName = 'geoModeUtils';

type GeoModeEventsType = 'changeAddress' | 'beforeChangeAddress';

export type GeoModeEventsObjType = Record<string, GeoModeEventsType>;

const geoModeEvents: GeoModeEventsObjType = {
    CHANGE_ADDRESS: 'changeAddress',
    BEFORE_CHANGE_ADDRESS: 'beforeChangeAddress',
};

angular.module(moduleName, []).service('geoModeService', GeoModeService).constant('geoModeEvents', geoModeEvents);

export default moduleName;
