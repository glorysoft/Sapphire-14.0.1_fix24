import './styles/address.scss';

import AddressListCtrl from './controllers/addressListController.js';
import { AddEditAddressFormController } from './controllers/addEditAddressFormController.ts';
import { addressListDirective, addressListTransclude, addEditAddressFormDirective } from './directives/addressDirectives.js';
import addressService from './services/addressService.js';
import '../zone/zone.js';
import zone from '../zone/zone.module.ts';
import AddressMapController from './controllers/addressMapController.ts';
import { AddressMapDirective } from './directives/addressMapDirective.js';
import apiMapModule from '../../_common/apiMap/apiMap.module.ts';
import '../../_common/yandexMaps/yandexMaps.module.js';
import shippingModule from '../../_partials/shipping/shipping.module.js';
import zoneMapModule from '../../_partials/zone/zoneMap.module.ts';

const moduleName = 'address';

angular
    .module(moduleName, [zone, apiMapModule, 'yandexMaps', shippingModule, zoneMapModule])
    .constant('addressListConfig', {
        autocompleteAlt: false,
        themeAlt: false,
        compactMode: false,
        overrideFields: {},
        requiredValidationEnabled: true,
    })
    .service('addressService', addressService)
    .controller('AddressListCtrl', AddressListCtrl)
    .controller('AddEditAddressFormCtrl', AddEditAddressFormController)
    .controller('AddressMapCtrl', AddressMapController)
    .directive('addressList', addressListDirective)
    .directive('addEditAddressForm', addEditAddressFormDirective)
    .directive('addressListTransclude', addressListTransclude)
    .directive('addressMap', AddressMapDirective);

export default moduleName;
