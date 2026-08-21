import type { IHttpService, cookies, translate, IPromise, IRequestShortcutConfig } from 'angular';
import type { ICoords, AddressValue, AddressData, ICoordsObj } from '../../../@types/location';
import { IResponseData, isResponseError, type Response } from '../../../@types/http';
import type { IHttpPromise } from 'angular';
import { PubSub } from '../../../_common/PubSub/PubSub.js';
import type { ZoneEventName } from '../types';
import type { Guid } from '../../../@types/shared';
import type { IIpZone } from '../types';
import type { IModalOptions } from '../../../_common/modal/constant/modalConstant';
import type { ModalArgumentParentScope } from '../../../_common/modal/services/modalService';
import type { ISelectOptionResponse } from '@/scripts/_partials/shipping/types';

export interface IZoneMapService {
    showSuggestionModal(parentScope: ModalArgumentParentScope, options?: IModalOptions): void;
    hideLocationModal(): void;
    hideSuggestionModal(): void;
    getAddressByCoords(coords: ICoordsObj): IPromise<AddressValue | undefined>;
    getCoordsByAddress(address: string, yaApiKey: string, options?: IRequestShortcutConfig): IHttpPromise<Response<ICoordsObj>>;
    setNotShowGeoCookie(): void;
    getNotShowGeoCookie(): any;
    setLocationZone(zoneData: AddressData): Promise<IIpZone>;
    getLocationCurrentZone(): Promise<IIpZone>;
    setMainContact(contactId?: Guid): Promise<ISelectOptionResponse | undefined>;
    setGeoPositionCookie(coords: ICoordsObj): void;
    getGeoPositionCookie(): ICoords | null;
    removeGeoPositionCookie(): void;
    subscribeEvent<T>(eventName: ZoneEventName, cb: (data: T) => void): void;
    publishEvent<T>(eventName: ZoneEventName, data: T): void;
}

export default class ZoneMapService implements IZoneMapService {
    private isRenderLocationModal = false;
    private isRenderAddressListModal = false;
    private locationModalId = 'locationModal';
    private addressListModalId = 'addressListModal';
    private suggestionModalId = 'suggestionModal';
    private geoPositionCookieName = 'advposition';
    /* @ngInject */
    constructor(
        private modalService: any,
        private $http: IHttpService,
        private $cookies: cookies.ICookiesService,
        private zoneService: any,
        // private checkoutService: any,
        private $translate: translate.ITranslateService,
    ) {}

    // showLocationModal = (parentScope: ModalArgumentParentScope) => {
    //     // if (isRenderLocationModal === false) {
    //     const mapApiKey = this.apiMapService.getMapApiKey();
    //     this.modalService.renderModal(
    //         this.locationModalId,
    //         'Укажите адрес',
    //         `<div data-zone-map="" data-center="center" data-map-api-key="${mapApiKey}" data-on-apply-address="onApplyAddress(address)" data-address="currentAddress"></div>`,
    //         null,
    //         {
    //             destroyOnClose: true,
    //             isOpen: true,
    //             modalClass: 'geo-location-modal',
    //         },
    //         parentScope,
    //     );
    //     this.isRenderLocationModal = true;
    //     // } else {
    //     //     modalService.open(locationModalId);
    //     // }
    // };

    showSuggestionModal = (parentScope: ModalArgumentParentScope, options?: IModalOptions) => {
        const modalOptions = {
            destroyOnClose: true,
            isOpen: true,
            modalClass: 'suggestion-modal',
            ...options,
        };
        this.modalService.renderModal(
            this.suggestionModalId,
            null,
            `<div class="suggestion-modal__content"><div class="suggestion-modal__question">${this.$translate.instant('Js.Suggestion.Title')}</div><div class="suggestion-modal__address" data-ng-bind="address"></div></div>`,
            `<div><button type="button" class="btn btn-middle btn-action btn--xs" data-ng-click="disagree()">${this.$translate.instant('Js.Suggestion.Unconfirmed')}</button> <button type="button" data-ng-click="agree()" class="btn btn-middle btn-submit btn--xs">${this.$translate.instant('Js.Suggestion.Confirm')}</button></div>`,
            modalOptions,
            parentScope,
        );
    };

    hideLocationModal = () => {
        this.modalService.close(this.locationModalId);
    };

    hideSuggestionModal = () => {
        this.modalService.close(this.suggestionModalId);
    };

    getAddressByCoords = ({ Latitude, Longitude }: ICoordsObj): IPromise<AddressValue | undefined> => this.$http
            .post<Response<AddressValue>>('location/GetAddressByCoords', {
                latitude: Latitude,
                longitude: Longitude,
            })
            .then((res) => {
                if (!isResponseError(res.data)) {
                    return res.data.obj;
                }
                throw new Error(res.data.errors.join('\n'));
            })
            .catch((err: Error) => {
                throw new Error(err.message);
            });

    getCoordsByAddress = (address: string, yaApiKey: string, options?: IRequestShortcutConfig): IHttpPromise<Response<ICoordsObj>> => {
        if (!yaApiKey) {
            throw new Error('apikey required for map');
        }
        return this.$http.post(
            'location/GetCoordsByAddress',
            {
                address,
                yaApiKey,
            },
            options,
        );
    };

    setNotShowGeoCookie = () => {
        this.$cookies.putObject('advShowGeoSuggestionModal', {
            showLocationModal: false,
        });
    };

    getNotShowGeoCookie = (): any =>
        this.$cookies.getObject('advShowGeoSuggestionModal');

    // setCheckoutAddress = async (checkoutAddress: ICheckoutAddress): Promise<boolean> => await this.checkoutService.saveContact(checkoutAddress);

    setLocationZone = async (zoneData: AddressData): Promise<IIpZone> =>
        await this.zoneService.setCurrentZone(
            zoneData.City,
            zoneData,
            zoneData.CountryId,
            zoneData.Region,
            zoneData.CountryName || zoneData.Country,
            zoneData.Zip,
            zoneData.District,
        );

    getLocationCurrentZone = async (): Promise<IIpZone> => await this.zoneService.getCurrentZone();

    /**
     * Установить главным контактом contactId, тип Курьер
     * @param contactId
     * @returns Вернется первая доставка для типа Курьер и нужно ли обновить страницу
     */
    async setMainContact(contactId: Guid): Promise<ISelectOptionResponse | undefined> {
        return this.$http
            .post<Response<ISelectOptionResponse>>('checkout/setCourierDeliveryGeoMode', { contactId })
            .then((response) => {
                if (response.data && !isResponseError(response.data)) {
                    return response.data.obj;
                }
                throw new Error(response.data.errors.join(' '));
            })
            .catch((err: Error) => {
                throw new Error(err.message);
            });
    }

    setGeoPositionCookie = (coords: ICoordsObj) => {
        this.$cookies.putObject(this.geoPositionCookieName, {
            Longitude: coords?.Longitude,
            Latitude: coords?.Latitude,
        });
    };

    getGeoPositionCookie = (): any => this.$cookies.getObject(this.geoPositionCookieName);

    removeGeoPositionCookie = (): void => {
        this.$cookies.remove(this.geoPositionCookieName);
    };

    subscribeEvent = <T>(eventName: ZoneEventName, cb: (data: T) => void) => {
        PubSub.subscribe(eventName, cb);
    };

    publishEvent = <T>(eventName: ZoneEventName, data?: T) => {
        PubSub.publish(eventName, data);
    };
}
