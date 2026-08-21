import addressMapTmpl from '../templates/addressMap.html';
import type { IDirective } from 'angular';

export function AddressMapDirective(): IDirective {
    return {
        scope: {
            center: '<?',
            actionEnd: '&',
            onCheckDeliveryZone: '&',
            onAfterInitMap: '&',
            cityId: '<',
        },
        controller: 'AddressMapCtrl',
        controllerAs: 'addressMap',
        bindToController: true,
        templateUrl: addressMapTmpl,
        link (scope, element, attrs, parentCtrl) {},
    };
}
