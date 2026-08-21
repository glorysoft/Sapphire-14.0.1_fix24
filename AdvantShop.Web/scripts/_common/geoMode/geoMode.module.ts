import './styles.scss';
import geoModeCtrl from './geoMode.ctrl';
import geoModeDirective, { GeoModeChangeAddressTriggerDirective } from './geoMode.directive';
import geoModeUtils from './geoMode.utils';
import zoneMapModule from '../../_partials/zone/zoneMap.module';
import zoneModule from '../../_partials/zone/zone.module';
import addressModule from '../../_partials/address/address.module.js';
import warehousesModule from '../../warehouses/warehouses.module.js';
import advCacheModule from '../cache/cache.module';

// используем и создаем новый сервис чтоб не было цикличной зависимости
// и не тянуть checkoutModule
import checkoutService from '../../checkout/services/checkoutService.js';

const moduleName = 'geoMode';

angular
    .module(moduleName, [zoneMapModule, zoneModule, addressModule, 'modal', warehousesModule, geoModeUtils, advCacheModule])
    .service('geoModeCheckoutService', checkoutService)
    .directive('geoMode', geoModeDirective)
    .directive('geoModeChangeAddressTrigger', GeoModeChangeAddressTriggerDirective)
    .controller('geoModeCtrl', geoModeCtrl);
export default moduleName;
