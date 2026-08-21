import { IScope, IParseService, IAttributes, IDirective } from 'angular';
import type GeoModeCtrl from './geoMode.ctrl';
import type { AddressModalPropsType, IGeoModeService } from './geoMode.service';
import { ICustomerContact } from '../../myaccount/types';

/* @ngInject */
export default function geoModeDirective($parse: IParseService, addressService: any): IDirective<IScope, JQLite, IAttributes, GeoModeCtrl> {
    return {
        scope: true,
        controller: 'geoModeCtrl',
        controllerAs: 'geoMode',
        bindToController: true,
        link(scope, _element, attrs, ctrl) {
            if (ctrl !== undefined) {
                ctrl.hideShippingPointText();
                ctrl.currentAddress = $parse(attrs.currentAddress)(scope);
                ctrl.courierAddress = $parse(attrs.courierAddress)(scope);
                ctrl.currentCity = $parse(attrs.currentCity)(scope);
                // ctrl.shippingsPoints = $parse(attrs.shippingsPoints)(scope);
                ctrl.isPointSelected = $parse(attrs.isPointSelected)(scope);
                ctrl.showCityFilterInSelfDelivery = $parse(attrs.showCityFilterInSelfDelivery)(scope);
                ctrl.showMapPickup = $parse(attrs.showMapPickup)(scope);
                ctrl.isShowMap = $parse(attrs.isShowMap)(scope);
                ctrl.selectOption = $parse(attrs.selectOption)(scope);
                ctrl.hasContacts = $parse(attrs.hasContacts)(scope);

                ctrl.setShippingType(attrs.shippingType);
                // если нет адреса у пользователя
                // в currentAddress может хранится адрес с пустым guid
                if (ctrl.currentAddress && ctrl.hasContacts) {
                    ctrl.addressString = addressService.addressStringify(ctrl.currentAddress, true);
                }
            }
        },
    };
}

/* @ngInject */
export function GeoModeChangeAddressTriggerDirective(
    $parse: IParseService,
    geoModeService: IGeoModeService,
): IDirective<IScope, JQLite, IAttributes, GeoModeCtrl> {
    return {
        scope: true,
        controller() {},
        controllerAs: 'geoModeChangeAddressTrigger',
        bindToController: true,
        link(scope, element, attrs, ctrl) {
            if (ctrl) {
                const currentAddress = $parse(attrs.geoModeChangeAddressTrigger)(scope);
                ctrl.currentCity = $parse(attrs.currentCity)(scope);
                const isShowMap = $parse(attrs.isShowMap)(scope);
                const hasContacts = $parse(attrs.hasContacts)(scope);
                ctrl.currentAddress = currentAddress;
                // const currentCustomerContactFromState: ICustomerContact | null = geoModeService.currentCustomerContact;
                // if (currentAddress && !currentCustomerContactFromState) {
                //     geoModeService.initGeoModeState(currentAddress);
                // }
                const removeCb = geoModeService.subscribeChangeAddress((customerContact: ICustomerContact) => {
                    ctrl.currentAddress = customerContact;
                    ctrl.currentCity = customerContact?.City;
                    scope.$apply();
                });
                const modalProps: AddressModalPropsType = {
                    isShowMap,
                    currentCity: ctrl.currentCity,
                    isGeoMode: true,
                    contactId: ctrl.currentAddress?.ContactId,
                };

                const changeAddressHandler = (event: Event) => {
                    event.stopPropagation();
                    if (hasContacts || geoModeService.currentCustomerContact) {
                        geoModeService.openChangeAddressModal(modalProps);
                    } else {
                        geoModeService.openAddNewAddressModal(modalProps);
                    }
                    scope.$apply();
                };
                element[0].addEventListener('click', changeAddressHandler);

                scope.$on('$destroy', () => {
                    removeCb();
                    element[0].removeEventListener('click', changeAddressHandler);
                });
            }
        },
    };
}
