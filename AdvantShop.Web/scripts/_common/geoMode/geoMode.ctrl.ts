import type { ILocationService, IScope, translate } from 'angular';
import type { AddressData, AddressValue, ICity } from '../../@types/location';
import type { IAbstractShippingOption, IBaseShippingOption, IGeoModeDeliveries, ISelectOptionResponse } from '../../_partials/shipping/types';
import type { ICustomerContact } from '../../myaccount/types';
import type { AddressModalPropsType, IGeoModeService, ShippingPointCookieType, ShippingPointModalScopeType } from './geoMode.service';
import type { ICheckoutAddress } from '../../checkout/types';
import type { IZoneMapService } from '../../_partials/zone/services/zoneMapService';
import type { IIpZone } from '../../_partials/zone/types';
import { PubSub } from '../PubSub/PubSub';
import type { GeoModeEventsObjType } from './geoMode.utils';
import type { ICacheService } from '../cache/services/cache.service';

interface ShippingTypes {
    readonly delivery: 'courier';
    readonly selfDelivery: 'pickpoint';
}
type ShippingTypesValue = ShippingTypes[keyof ShippingTypes];
type ShippingType = ShippingTypesValue | undefined;

export default class GeoModeCtrl {
    isSetShippingPoint: boolean | null = null;
    isShowMap: boolean | undefined;
    currentAddress?: ICustomerContact;
    courierAddress?: ICustomerContact;
    private modeTypes: ShippingTypes = {
        delivery: 'courier',
        selfDelivery: 'pickpoint',
    };
    private readonly addressStringDefaultText: string = '';
    addressString = this.addressStringDefaultText;
    selectOption?: IAbstractShippingOption;
    isPointSelected = false;
    isFetching = false;
    private shippingType?: ShippingType;
    currentCity?: ICity | string;
    showCityFilterInSelfDelivery?: boolean;
    showMapPickup?: boolean;
    hasContacts = false;

    /* @ngInject */
    constructor(
        private readonly $scope: IScope,
        private readonly addressService: any,
        private readonly geoModeCheckoutService: any,
        private readonly warehousesService: any,
        private readonly $location: ILocationService,
        private readonly geoModeService: IGeoModeService,
        private readonly zoneMapService: IZoneMapService,
        private readonly geoModeEvents: GeoModeEventsObjType,
        private readonly zoneService: any,
        private readonly $translate: translate.ITranslateService,
        private readonly advCacheService: ICacheService,
    ) {
        this.addressStringDefaultText = this.$translate.instant('Js.GeoMode.AddressDefaultText');
        this.addressString = this.addressStringDefaultText;
    }

    $postLink = async () => {

        PubSub.subscribe(this.geoModeEvents.BEFORE_CHANGE_ADDRESS, this.onBeforeChangeAddress);

        const geoModeUrlParam = this.$location.search();
        this.subscribeToChangeAddress();
        this.setFetchState(true);
        this.showShippingPointText();
        this.setFetchState(false);

        if (geoModeUrlParam != null && geoModeUrlParam[this.geoModeService.geoModeUrlParam]) {
            const modalProps: AddressModalPropsType = {
                isShowMap: Boolean(this.isShowMap),
            };
            !this.currentAddress
                ? this.geoModeService.openAddNewAddressModal(modalProps)
                : this.geoModeService.openChangeAddressModal({
                      isShowMap: Boolean(this.isShowMap),
                  });
        }
    };

    async isCityInCurrentZone(address: ICustomerContact | ICheckoutAddress): Promise<boolean> {
        const currentZone: IIpZone = await this.zoneService.getCurrentZone();
        return currentZone?.City?.toLowerCase() === address?.City?.toLowerCase();
    }

    private async syncCityWithCheckoutAddress(shippingAddress: ICustomerContact) {
        const addressData: AddressData = this.getAddressData(shippingAddress);
        await this.setLocationZone(addressData);
    }

    subscribeToChangeAddress = () => {
        const removeCb = this.geoModeService.subscribeChangeAddress(this.updateAddress);
        this.$scope.$on('$destroy', () => {
            removeCb();
        });
    };

    setShippingType = (shippingType: ShippingType) => {
        this.shippingType = shippingType || this.modeTypes.delivery;
    };

    /**
     * Получает пункт самовывоза и ставит куку с ним, если нужно обновляет страницу
     */
    setShippingPoint = async () => {
        try {
            const response = await this.getShippingPoints();
            if (response && response.selectedOption) {
                this.selectOption = response.selectedOption;

                this.geoModeService.setShippingPointCookie({
                    shippingOptionId: this.selectOption.Id,
                    pointId: this.selectOption.SelectedPoint?.Id,
                    shippingAddress: undefined, //shippingPointFromCookie?.shippingAddress, // TODO: зачем нужен адрес?
                });
            } else {
                this.selectOption = undefined;
                this.geoModeService.removeShippingPointCookie();
            }

            if (response && response.reloadPage) {
                location.reload();
            }
        } catch (error) {
            console.error(error);
        }
    };

    async getShippingPoints(): Promise<IGeoModeDeliveries> {
        return await this.geoModeCheckoutService.getGeoModeDeliveries('self-delivery');
    }

    /**
     * Выбрали режим отображения Курьер
     */
    private handleDeliveryMode = async (): Promise<void> => {
        if (!this.courierAddress) {
            await this.setCalculationVariants(this.modeTypes.delivery);
            return;
        }
        const addressData: AddressData = this.getAddressData(this.courierAddress);

        await this.setLocationZone(addressData);

        const selectOptionResponse = await this.geoModeService.setCourierDeliveryGeoMode(this.courierAddress);

        this.resetCache();

        if (selectOptionResponse && selectOptionResponse.reloadPage) {
            location.reload();
        }
    };

    /**
     * Выбрали режим отображения Самовывоз
     */
    private handleSelfDeliveryMode = async (): Promise<void> => {
        try {
            if (this.isPointSelected) {
                await this.setShippingPoint();
            } else {
                await this.setCalculationVariants(this.modeTypes.selfDelivery);
            }
        } catch (error) {
            console.error(error);
        }
    };

    /**
     * Изменить режим отображения (Курьер, Самовывоз)
     * @param type
     */
    async changeMode(type: ShippingTypesValue): Promise<void> {
        if (this.shippingType === type) return;

        this.setFetchState(true);
        this.geoModeService.setShippingTypeCookie(type);
        this.setShippingType(type);

        if (this.shippingType === this.modeTypes.delivery) {
            await this.handleDeliveryMode();
        }

        if (this.shippingType === this.modeTypes.selfDelivery) {
            await this.handleSelfDeliveryMode();
        }

        this.resetCache();
        this.setFetchState(false);
    }

    showShippingPointText(): void {
        this.isSetShippingPoint = true;
    }

    hideShippingPointText(): void {
        this.isSetShippingPoint = false;
    }

    updateAddress = (customerContact: ICustomerContact): void => {
        try {
            if (customerContact) {
                const addressData = this.geoModeService.getAddressData(customerContact);
                this.addressString = this.addressStringify(addressData);
                this.currentAddress = customerContact;
            }

            this.setFetchState(false);
            this.$scope.$digest();
        } catch (error) {
            console.error(error.message || error);
        }
    };

    addressStringify = (addressData: AddressData) => this.addressService.addressStringify(addressData, true);

    /**
     * Ставим куку выбранного пункта самовывоза
     */
    selectShippingPoint = (shippingMethod: IAbstractShippingOption, shippingAddress: AddressValue, point?: IBaseShippingOption) => {
        this.selectOption = shippingMethod;

        if (this.selectOption) {
            this.geoModeService.setShippingPointCookie({
                shippingOptionId: this.selectOption.Id,
                shippingAddress,
                pointId: point?.Id,
            });
        } else {
            this.geoModeService.removeShippingPointCookie();
        }
    };

    /**
     * Изменили пункт пункта самовывоза
     */
    onChangeShippingPoint = (
        shippingMethod: IAbstractShippingOption,
        shippingAddress: AddressValue,
        reloadPage: boolean,
        point?: IBaseShippingOption,
    ): void => {
        if (shippingMethod) {
            // ставим куку
            this.selectShippingPoint(shippingMethod, shippingAddress, point);

            this.geoModeService.closeChangeShippingPointModal();

            if (reloadPage) {
                location.reload();
            }
            this.$scope.$apply();
        }
    };

    changeShippingPoint = (): void => {
        const modalScope: ShippingPointModalScopeType = {
            currentShippingPoint: this.selectOption,
            onChangeShippingPoint: this.onChangeShippingPoint,
            showCityFilter: this.showCityFilterInSelfDelivery,
            showMapPickup: this.showMapPickup,
        };
        this.geoModeService.openChangeShippingPointModal(modalScope);
    };

    getWarehouseIds(shippingPoint: IAbstractShippingOption | undefined): number[] | undefined {
        return this.warehousesService.getWarehouseIds(shippingPoint);
    }

    setLocationZone = (addressData: AddressData): Promise<IIpZone> => this.zoneMapService.setLocationZone(addressData);

    changeLocationZone = async (addressData: AddressData): Promise<void> => {
        await this.setLocationZone(addressData);
    };

    setFetchState = (state: boolean): void => {
        this.isFetching = state;
    };

    onBeforeChangeAddress = (): void => {
        this.setFetchState(true);
    };

    onZoneChangeCity = (data: IIpZone): void => {
        this.addressString = this.addressStringDefaultText;
    };

    setCalculationVariants = (typeCalculationVariants: ShippingTypes['delivery'] | ShippingTypes['selfDelivery']): Promise<boolean> =>
        this.geoModeCheckoutService.setCalculationVariants(typeCalculationVariants);

    getAddressData(address: ICustomerContact | ICheckoutAddress): AddressData {
        return {
            Country: address.Country,
            CountryName: address.Country,
            Region: address?.Region,
            District: address?.District,
            City: address?.City,
            Zip: address?.Zip,
            Street: address?.Street,
            House: address?.House,
            Structure: address?.Structure,
        };
    }

    resetCache() {
        this.advCacheService.resetLastModified();
    }
}
