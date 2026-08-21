import { PubSub } from '../PubSub/PubSub';
import type { ICustomerContact } from '../../myaccount/types';
import { type cookies, type ILocationService, translate } from 'angular';
import type { GeoModeEventsObjType } from './geoMode.utils';
import type { AddressData, AddressValue, ICity } from '../../@types/location';
import type { IZoneMapService } from '../../_partials/zone/services/zoneMapService';
import type { FormType } from '../../_partials/address/types';
import type { IAbstractShippingOption, IBaseShippingOption, ISelectOptionResponse } from '../../_partials/shipping/types';
import type { IToasterService } from 'ngtoaster';

export type GeoModeUrlParamNameType = 'geoMode';

export interface ShippingPointModalScopeType {
    currentShippingPoint?: IAbstractShippingOption;
    showCityFilter?: boolean;
    showMapPickup?: boolean;
    onChangeShippingPoint?: (shippingPoint: IAbstractShippingOption, address: AddressValue, reloadPage: boolean, point?: IBaseShippingOption) => void;
}

export interface AddressModalPropsType {
    isShowMap?: boolean;
    currentCity?: ICity | string;
    isGeoMode?: boolean;
    contactId?: string;
}

export interface ShippingPointCookieType {
    shippingOptionId: IAbstractShippingOption['Id'];
    pointId?: IBaseShippingOption['Id'];
    shippingAddress?: AddressValue;
}
export interface IGeoModeService {
    subscribeChangeAddress(fn: (customerContact: ICustomerContact) => any): () => void;
    publishChangeAddress(customerContact: ICustomerContact): void;
    get geoModeUrlParam(): GeoModeUrlParamNameType;
    openAddNewAddressModal(modalProps?: AddressModalPropsType): void;
    openChangeAddressModal(modalProps?: AddressModalPropsType): void;
    setCourierDeliveryGeoMode(customerContact: ICustomerContact): Promise<ISelectOptionResponse | undefined>;
    getAddressData(customerContact: ICustomerContact): AddressData;
    get currentCustomerContact(): ICustomerContact | null;
    openChangeShippingPointModal(parentScope: ShippingPointModalScopeType): void;
    closeChangeShippingPointModal(): void;
    setShippingTypeCookie(type: string): void;
    getShippingTypeCookie(): string;
    removeShippingTypeCookie(): void;
    setShippingPointCookie(data: ShippingPointCookieType): void;
    getShippingPointCookie(): ShippingPointCookieType | undefined;
    removeShippingPointCookie(): void;
}

interface GeoModeState {
    customerContact: ICustomerContact | null;
}

export default class GeoModeService implements IGeoModeService {
    _geoModeState: GeoModeState = {
        customerContact: null,
    };
    private isRenderShippingPointsModal = false;
    private _shippingPointModalId = 'shippingsPoints';
    private readonly shippingTypeCookieName: string = 'advShippingType';
    private readonly shippingPointCookieName: string = 'geomode_point';

    /* @ngInject */
    constructor(
        private readonly $location: ILocationService,
        private readonly addressService: any,
        private readonly geoModeEvents: GeoModeEventsObjType,
        private readonly zoneMapService: IZoneMapService,
        private readonly modalService: any,
        private readonly $translate: translate.ITranslateService,
        private readonly $cookies: cookies.ICookiesService,
        private readonly toaster: IToasterService,
        private readonly warehousesService: any,
    ) {}

    get currentCustomerContact(): ICustomerContact | null {
        return this._geoModeState.customerContact;
    }

    get geoModeUrlParam() {
        return 'geoMode' as GeoModeUrlParamNameType;
    }

    subscribeChangeAddress = (fn: (customerContact: ICustomerContact) => unknown): (() => void) =>
        PubSub.subscribe(this.geoModeEvents.CHANGE_ADDRESS, fn);

    publishChangeAddress = async (customerContact: ICustomerContact) => {
        if (this._geoModeState.customerContact?.ContactId !== customerContact?.ContactId) {
            // перезагружаем страницу так как адрес можно поменять на странице оформления
            // и чтоб все пересчиталось и выбрался выбранный адрес в оформлении
            if (
                this._geoModeState.customerContact?.City !== customerContact.City &&
                this._geoModeState.customerContact?.RegionId !== customerContact?.RegionId
            ) {
                try {
                    await this.updateAddress(customerContact);
                    location.reload();
                } catch (error) {
                    this.toaster.pop('error', 'Js.GeoMode.Error');
                    throw error;
                }
            }
        }
    };

    /**
     * Установить режим отображения Курер для контакта {customerContact}
     * @param customerContact
     * @returns Вернется первая доставка для типа Курьер и нужно ли обновить страницу
     */
    async setCourierDeliveryGeoMode(customerContact: ICustomerContact): Promise<ISelectOptionResponse | undefined> {
        try {
            return await this.zoneMapService.setMainContact(customerContact?.ContactId);
        } catch (ex) {
            throw new Error(ex.message);
        }
    }

    /**
     *
     * @param customerContact
     */
    async updateAddress(customerContact: ICustomerContact): Promise<void> {
        try {
            if (!customerContact)
                return;

            let reloadPageByCityChanged = false;

            // если изменился город, то обновляем текущую зону (если у города есть склады, то они поставятся в куку)
            if (this._geoModeState.customerContact?.City != customerContact.City) {

                const addressData: AddressData = this.getAddressData(customerContact);
                const zone = await this.zoneMapService.setLocationZone(addressData);
                reloadPageByCityChanged = zone?.ReloadPage;

                // при смене города удаляем куку пункта выдачи
                this.removeShippingPointCookie();
            }

            // ставим главный контакт, обновляем доставку и склады
            const selectOptionResponse = await this.setCourierDeliveryGeoMode(customerContact);

            if (reloadPageByCityChanged || (selectOptionResponse && selectOptionResponse.reloadPage)) {
                location.reload();
            }
        } catch (ex) {
            console.error(ex.message || ex);
        }
    }

    clearGeoModeUrlParam = () => {
        this.$location.search(this.geoModeUrlParam, null);
    };

    openAddNewAddressModal = (modalProps: AddressModalPropsType) => {
        const modalData = {
            type: 'change',
            themeAlt: false,
            clearGeoModeUrlParam: this.clearGeoModeUrlParam,
            onAddEditAddress: (formData: FormType, contacts: ICustomerContact[], addressSelected: ICustomerContact, city) =>
                this.publishChangeAddress(addressSelected),
            ...modalProps,
        };

        this.addressService.dialogRender('addEditAddress.clearGeoModeUrlParam()', modalData);
    };

    openChangeAddressModal = (modalProps: AddressModalPropsType) => {
        const modalData = {
            onApply: this.publishChangeAddress,
            showFormAddressEmpty: true,
            clearGeoModeUrlParam: this.clearGeoModeUrlParam,
            ...modalProps,
        };
        const options = {
            callbackClose: 'addressList.clearGeoModeUrlParam()',
        };

        this.addressService.showAddressListModal(modalData, options);
    };

    getAddressData = (customerContact: ICustomerContact): AddressData => ({
        Country: customerContact.Country,
        CountryName: customerContact.Country,
        Region: customerContact.Region,
        District: customerContact.District,
        City: customerContact.City,
        Zip: customerContact.Zip,
        Street: customerContact.Street,
        House: customerContact.House,
        Structure: customerContact.Structure,
        CountryId: customerContact.CountryId,
        RegionId: customerContact.RegionId,
    });

    openChangeShippingPointModal = (parentScope: ShippingPointModalScopeType) => {
        const modalId = this._shippingPointModalId;
        const header = this.$translate.instant('Js.GeoMode.ShippingPoint');
        const content = `<shipping-points-list data-selected-shipping-point="currentShippingPoint"
                                               data-show-city-filter="showCityFilter"
                                               data-show-map-pickup="showMapPickup"
                                               data-on-change="onChangeShippingPoint(shippingMethod, shippingAddress, reloadPage, point)">
                        </shipping-points-list>`;
        const footer = null;
        const options = {
            destroyOnClose: true,
            isOpen: true,
            modalClass: `points-list-modal ${!parentScope.showMapPickup ? 'points-list-modal--without-map' : ''}`,
        };

        this.modalService.renderModal(modalId, header, content, footer, options, parentScope);
    };

    closeChangeShippingPointModal = () => {
        this.modalService.close(this._shippingPointModalId);
    };

    setShippingTypeCookie = (type: string): void => {
        this.$cookies.put(this.shippingTypeCookieName, type);
    };

    getShippingTypeCookie = (): string =>
        this.$cookies.get(this.shippingTypeCookieName);

    removeShippingTypeCookie = (): void => {
        this.$cookies.remove(this.shippingTypeCookieName);
    };

    setShippingPointCookie = (data: ShippingPointCookieType): void => {
        this.$cookies.putObject(this.shippingPointCookieName, data);
    };

    getShippingPointCookie = (): ShippingPointCookieType | undefined => {
        try {
            return this.$cookies.getObject(this.shippingPointCookieName);
        } catch (error) {
            this.removeShippingPointCookie();
        }
    };

    removeShippingPointCookie = (): void => {
        this.$cookies.remove(this.shippingPointCookieName);
    };
}
