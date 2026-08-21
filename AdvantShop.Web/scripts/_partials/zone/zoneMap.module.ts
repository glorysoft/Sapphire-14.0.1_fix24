import { zoneMapDirective } from './directives/zoneMapDirectives';
import YaMapModule from '../../_common/yandexMaps/yandexMaps.module.js';
import autocompleterModule from '../../_common/autocompleter/autocompleter.module.js';
// import addressModule from '../../_partials/address/address.module.js';
// import checkoutModule from '../../../scripts/checkout/checkout.module.js';
// import apiMapModule from '../../_common/apiMap/apiMap.module';
import zoneMapCtrl from './controllers/zoneMapController';
import zoneMapService from './services/zoneMapService';
import './styles/zoneMap.scss';
import './styles/zoneSuggestionPopover.scss';

const moduleName = 'zoneMap';

angular
    .module(moduleName, [YaMapModule, autocompleterModule, 'modal'])
    .service('zoneMapService', zoneMapService)
    .controller('zoneMapCtrl', zoneMapCtrl)
    .directive('zoneMap', zoneMapDirective);
// .directive('zoneSuggestionModal', zoneSuggestionModalDirective);

export default moduleName;
