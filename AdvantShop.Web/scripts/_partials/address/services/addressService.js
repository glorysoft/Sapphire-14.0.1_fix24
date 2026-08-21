import addressModalTemplate from '../templates/addressModal.html';
import addressModalFooterTemplate from '../templates/addressModalFooter.html';

/* @ngInject */
function addressService($http, $q, modalService, $translate, urlHelper) {
    let service = this,
        fields;

    service.dialogRender = function (callbackClose, parentScope) {
        const options = {
            modalClass: parentScope.themeAlt ? 'address-dialog address-dialog--admin-mode' : 'address-dialog',
            modalOverlayClass: 'address-dialog-overlay',
            callbackClose,
            isOpen: true,
            destroyOnClose: true,
        };

        modalService.renderModal(
            'modalAddress',
            $translate.instant(parentScope.formData ? 'Js.Address.EditTitle' : 'Js.Address.AddTitle'),
            `<div>
                <div class="add-edit-address"
                    data-current-city="addEditAddress.currentCity"
                    data-is-show-map="addEditAddress.isShowMap"
                    data-add-edit-address-form=""
                    data-type="{{addEditAddress.type}}"
                    data-theme-alt="addEditAddress.themeAlt"
                    data-customer-id="addEditAddress.customerId"
                    data-form-data="addEditAddress.formData"
                    data-address-selected="addEditAddress.addressSelected"
                    data-on-add-edit-address="addEditAddress.onAddEditAddress(formData, contacts, addressSelected, city)"
                    data-autocomplete-alt="addEditAddress.autocompleteAlt"
                    data-zone-update-on-add="addEditAddress.zoneUpdateOnAdd"
                    data-contact-id="addEditAddress.contactId"
                    data-is-show-name="addEditAddress.isShowName"></div>
            </div>`,
            null,
            options,
            { addEditAddress: parentScope },
        );
    };
    service.dialogOpen = function () {
        modalService.open('modalAddress');
    };

    service.dialogClose = function () {
        modalService.close('modalAddress');
    };

    service.getDialogScope = function () {
        return modalService.getModal('modalAddress').then((dialog) => dialog.modalScope);
    };

    service.removeAddress = function (contactId, customerId) {
        return $http
            .post(customerId == null ? urlHelper.getAbsUrl('MyAccount/DeleteCustomerContact', true) : 'Customers/DeleteCustomerContact', {
                customerId,
                contactId,
                rnd: Math.random(),
            })
            .then((response) => response.data);
    };

    service.getAddresses = function (customerId, currentCity = null, isGeoMode = null) {
        return $http
            .get(customerId == null ? urlHelper.getAbsUrl('MyAccount/GetCustomerContacts', true) : 'Customers/GetCustomerContacts', {
                params: { customerId, isGeoMode, rnd: Math.random() },
            })
            .then((response) => response.data);
    };

    service.getFields = function (isShowName, customerId) {
        return fields != null
            ? $q.when(fields)
            : $http
                  .get(
                      customerId == null
                          ? urlHelper.getAbsUrl('MyAccount/GetFieldsForCustomerContacts', true)
                          : 'Customers/GetFieldsForCustomerContacts',
                      { params: { customerId, isShowName } },
                  )
                  .then((response) => (fields = response.data));
    };

    service.processAddress = function (address, customerId) {
        return $http
            .post(customerId == null ? urlHelper.getAbsUrl('MyAccount/processAddress', true) : 'Customers/processAddress', { customerId, address })
            .then((response) => response.data);
    };

    service.addUpdateCustomerContact = function (account, customerId) {
        return $http
            .post(customerId == null ? urlHelper.getAbsUrl('MyAccount/AddUpdateCustomerContact', true) : 'Customers/AddUpdateCustomerContact', {
                customerId,
                account,
                rnd: Math.random(),
            })
            .then((response) => response.data);
    };

    service.addressStringify = function (address, short = false) {
        const array = [];
        const addressLowerKey = {};
        const keys = Object.keys(address);
        keys.forEach((k) => {
            const newKey = k.toLowerCase();
            Object.defineProperty(addressLowerKey, newKey, {
                value: address[k],
            });
        });
        if (addressLowerKey.zip != null && addressLowerKey.zip.length > 0 && addressLowerKey.zip !== '-' && !short) {
            array.push(addressLowerKey.zip);
        }

        if (addressLowerKey.country != null && addressLowerKey.country.length > 0 && !short) {
            array.push(addressLowerKey.country);
        }

        if (addressLowerKey.region != null && addressLowerKey.region.length > 0 && addressLowerKey.region !== '-' && !short) {
            array.push(addressLowerKey.region);
        }

        if (addressLowerKey.city != null && addressLowerKey.city.length > 0) {
            array.push(addressLowerKey.city);
        }

        if (addressLowerKey.street != null && addressLowerKey.street.length > 0) {
            array.push(addressLowerKey.street);
        }

        if (addressLowerKey.house != null && addressLowerKey.house.length > 0) {
            array.push(addressLowerKey.house);
        }

        if (addressLowerKey.structure != null && addressLowerKey.structure.length > 0) {
            array.push(`${$translate.instant('Js.CustomerView.Struct')} ${addressLowerKey.structure}`);
        }

        return array.join(', ');
    };

    service.showAddressListModal = (parentScope, options) => {
        const modalId = 'addressListModal';
        const modalOptions = {
            destroyOnClose: true,
            isOpen: true,
            modalClass: 'address-list-modal',
            ...options,
        };

        let selectedAddress = null;

        const onCloseModalCb = {
            initAddressFn: (address) => {
                selectedAddress = address;
            },
            changeAddressFn: (address) => {
                selectedAddress = address;
            },
            saveAddressFn: (address) => {
                selectedAddress = address;
            },
            deleteAddressFn: (items, itemRemoved, addressSelected, isItemSeletedRemoved) => {
                selectedAddress = addressSelected;
                parentScope.onApply(selectedAddress, modalId);
            },
            onApply: () => {
                parentScope.onApply(selectedAddress, modalId);
                modalService.close(modalId);
            },
            clearGeoModeUrlParam: () => {
                parentScope.clearGeoModeUrlParam();
            },
        };

        modalService.renderModal(
            modalId,
            $translate.instant('Js.Address.SelectAddress'),
            `<div data-address-list
                  data-type="change"
                  data-is-show-map="addressList.isShowMap"
                  data-is-show-name="false"
                  data-current-city="addressList.currentCity"
                  data-is-geo-mode="false"
                  data-contact-id="addressList.contactId"
                  data-zone-update-on-add="true"
                  data-init-address-fn="addressList.initAddressFn(address)"
                  data-delete-address-fn="addressList.deleteAddressFn(items, itemRemoved, addressSelected, isItemSeletedRemoved)"
                  data-save-address-fn="addressList.saveAddressFn(address)"
                  data-change-address-fn="addressList.changeAddressFn(address)"
                  data-apply-address-fn="addressList.onApply(address)">
                    <address-list-footer>
                      <div class="address-list-modal__footer address-list__footer">
<!--                            data-ng-disabled="!addressList.addressSelected.isAllow"-->
                            <button data-ng-click="addressList.applyAddressFn(addressList.addressSelected)" class="btn btn-middle btn-submit" type="button">Ок</button>
                        </div>
                    </address-list-footer>
                </div>`,
            null,
            modalOptions,
            { addressList: { ...parentScope, ...onCloseModalCb } },
        );
    };

    service.findItemForSelect = function (items, contactId) {
        let result = null;

        if (contactId != null && items != null && items.length > 0) {
            result = items.find((x) => x.ContactId == contactId);
        }

        if (result == null) {
            result = items.find((x) => x.IsMain);
        }

        // if (result == null) {
        //     result = items[0];
        // }

        return result;
    };
}

export default addressService;
