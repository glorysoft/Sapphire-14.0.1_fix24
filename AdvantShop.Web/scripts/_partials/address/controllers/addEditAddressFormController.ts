import { IController, IFormController, IHttpService, IPromise, IQService, IScope, ITimeoutService, IWindowService, translate } from 'angular';
import {
    AddressListConfigType,
    ContactId,
    CustomerContactsFieldsType,
    FormType,
    LocationAddressType,
    OnAddEditAddressCallbackDataType,
} from '../types';
import type { ICustomerContact } from '../../../myaccount/types';
import type { ICountry, IIpZone } from '../../zone/types';
import { CityAdditionalSettings, ICity } from '../../../@types/location';
import { isResponseError, type Response } from '../../../@types/http';
import { AddressValue, ICoords, ICoordsObj, ILocation, ISuggestAddressQuery } from '../../../@types/location';
import type { ICheckoutAddress } from '../../../checkout/types';
import type { IToasterService } from 'ngtoaster';
import type { geolocation, Map } from 'yandex-maps';
import { IGeoObjectPolygon } from '../../../_common/points-list-map/types';
import { IZoneMapService } from '../../zone/services/zoneMapService';
import { IApiMapService } from '../../../_common/apiMap/apiMap.service';

export type ProcessAddressKeyTypes = 'CITY' | 'ADDRESS' | 'COUNTRY' | 'STREET_HOUSE';
export type ProcessAddressTypes = Record<ProcessAddressKeyTypes, string>;
export type ProcessAddressValueTypes = ProcessAddressTypes[ProcessAddressKeyTypes];
export class AddEditAddressFormController implements IController {
    private isShowName = false;
    private customerId: number | null = null;
    // timerChange,
    private processContactTimer: IPromise<any> | null = null;
    fields: CustomerContactsFieldsType | undefined = undefined;
    form: FormType = {};
    addressListMaxHeight = 0;
    citiesListMaxHeight = 0;
    requiredValidationEnabled = false;
    autocompleteAlt = false;
    onAddEditAddress: ((data: OnAddEditAddressCallbackDataType) => void) | undefined = undefined;
    addEditAddressHtmlForm: IFormController | null = null;
    formData: FormType | undefined = undefined;
    addressSelected: ICustomerContact | undefined = undefined;
    zoneUpdateOnAdd: boolean | undefined = undefined;
    contactId: ContactId = undefined;
    center: ICoords | null = null;
    disabledAddAddress = false;
    private skipAction = false;
    processAddressTypes: ProcessAddressTypes = {
        CITY: 'city',
        ADDRESS: 'address',
        COUNTRY: 'country',
        STREET_HOUSE: 'street-house',
    };
    isShowMap = false;
    currentCityId?: number;
    currentCity?: ICity;
    isLoadData = false;
    map?: Map;
    yaApiKey?: string;

    /* @ngInject */
    constructor(
        private readonly addressService: any,
        private readonly addressListConfig: AddressListConfigType,
        private readonly $q: IQService,
        private readonly $http: IHttpService,
        private readonly urlHelper: any,
        private readonly $timeout: ITimeoutService,
        private readonly modalService: any,
        private readonly zoneService: any,
        private readonly zoneMapService: IZoneMapService,
        private readonly $scope: IScope,
        private readonly toaster: IToasterService,
        private readonly $translate: translate.ITranslateService,
        private readonly yandexMapsService: any,
        private readonly apiMapService: IApiMapService,
        private readonly $window: IWindowService,
    ) {}

    $onInit() {
        this.yaApiKey = this.apiMapService.getMapApiKey();
        this.requiredValidationEnabled = this.addressListConfig.requiredValidationEnabled;
        this.autocompleteAlt = this.autocompleteAlt != null ? this.autocompleteAlt : this.addressListConfig.autocompleteAlt;
        this.clearFormData();
        if (this.formData) {
            this.form = this.formData;
        }

        return (
            this.addressService
                .getFields(this.isShowName, this.customerId)
                .then((response: CustomerContactsFieldsType) => (this.fields = this.fields || this.checkFieldsVisible(response)))
                .then((fields: CustomerContactsFieldsType) => {
                    if (!fields.IsShowFullAddress) {
                        this.clearFullAddressData();
                    }
                    this.initListsMaxHeight();

                    if (fields.IsShowCountry) {
                        return this.getCountries();
                    }
                })
                .then((countries: ICountry[] | undefined) => {
                    if (countries != null) {
                        return this.getSelectedCountry(countries);
                    }
                })
                .then(() => {
                    if (this.formData == null) {
                        if (this.currentCity) {
                            this.form.city = this.currentCity?.Name;
                            this.currentCityId = this.currentCity?.CityId;
                        } else {
                            return this.zoneService.getCurrentZone().then((zone: IIpZone) => {
                                this.form.city = zone?.City;
                                this.form.region = zone?.Region;
                                this.currentCityId = zone?.CityId;
                            });
                        }
                    }
                })
                .then(() => {
                    if (!this.form.city) {
                        return this.zoneService.getCurrentCity().then((res: ICity) => {
                            this.form.city = res?.Name;
                            this.currentCityId = res?.CityId;
                        });
                    }
                })
                // .then(() => {
                //     if (this.isShowMap && this.form.city) {
                //         const addressString: string = this.addressService.addressStringify(this.form);
                //         if (this.yaApiKey) {
                //             return this.zoneMapService.getCoordsByAddress(addressString, this.yaApiKey).then((res) => {
                //                 if (!isResponseError(res.data) && res.data.obj) {
                //                     const { Latitude, Longitude } = res.data.obj;
                //                     this.setCenterMap([Latitude.toString(), Longitude.toString()]);
                //                 }
                //             });
                //         }
                //         throw new Error('apikey yandex map required');
                //     }
                // })
                // .finally(() => {
                //     this.isLoadData = true;
                // })
                .catch((error: unknown) => {
                    console.error(error);
                })
        );
    }

    $postLink() {
        if (this.fields?.IsShowFullAddress) {
            this.clearFullAddressData();
        }
    }

    checkFieldsVisible(fields: CustomerContactsFieldsType) {
        if (this.addressListConfig.overrideFields.visible) {
            if (Array.isArray(this.addressListConfig.overrideFields.visible)) {
                for (const value of this.addressListConfig.overrideFields.visible) {
                    if (fields[value] != null) {
                        this.overrideFieldsForm(fields, value, true);
                    }
                }
            } else {
                throw new Error('AddressList: field "visible" should be like array of strings');
            }
        }
        return fields;
    }

    overrideFieldsForm<K extends keyof CustomerContactsFieldsType, V extends CustomerContactsFieldsType[K]>(
        fields: CustomerContactsFieldsType,
        key: K,
        value: V,
    ) {
        fields[key] = value;
    }

    clearFullAddressData = () => {
        this.form.house = null;
        this.form.apartment = null;
        this.form.structure = null;
        this.form.entrance = null;
        this.form.floor = null;
    };

    initListsMaxHeight = () => {
        if (this.fields) {
            this.addressListMaxHeight =
                50 *
                    ((this.fields.IsShowCity ? 1 : 0) +
                        (this.fields.IsShowDistrict ? 1 : 0) +
                        (this.fields.IsShowState ? 1 : 0) +
                        (this.fields.IsShowCountry ? 1 : 0) +
                        (this.fields.IsShowZip ? 1 : 0)) || 50;
            // if (!this.fields?.IsShowFullAddress) {
            this.citiesListMaxHeight =
                50 *
                    ((this.fields.IsShowState ? 1 : 0) +
                        (this.fields.IsShowCountry ? 1 : 0) +
                        (this.fields.IsShowZip ? 1 : 0) +
                        2 * (this.fields.IsShowAddress ? 1 : 0)) || 50;
            // }
        }
    };

    getCountries = async (): Promise<ICountry[] | undefined> => {
        if (this.form.countries != null) {
            return this.form.countries;
        }
        try {
            const { data } = await this.$http.get<ICountry[]>(this.urlHelper.getAbsUrl('location/GetCountries', true));
            this.form.countries = data;
            return data;
        } catch (e) {
            console.error(e);
        }
    };

    getSelectedCountry = (countries: ICountry[]) =>
        this.$q
            .when(this.form.countryId != null && this.form.countryId !== 0 ? { CountryId: this.form.countryId } : this.zoneService.getCurrentZone())
            .then((zone) => {
                let country;

                for (let i = countries.length - 1; i >= 0; i--) {
                    if (countries[i].CountryId === zone.CountryId) {
                        country = countries[i];
                        break;
                    }
                }

                return (this.form.country = country);
            });

    processCity = (zone?: ILocation, timeout?: number) => {
        if (this.processContactTimer != null) {
            this.$timeout.cancel(this.processContactTimer);
        }

        return (this.processContactTimer = this.$timeout(
            () => {
                if (zone != null) {
                    this.form.region = zone.Region;
                    this.form.district = zone.District;
                    this.form.countryId = zone.CountryId;
                    this.form.zip = zone.Zip;
                }
                this.form.byCity = zone == null;
                this.skipAction = true;
                this.addressService.processAddress(this.form, this.customerId).then((res: Response<ISuggestAddressQuery>) => {
                    if (!isResponseError<ISuggestAddressQuery>(res) && res.result) {
                        const data = res.obj;
                        if (data) {
                            this.currentCity = {
                                CityId: data.CityId,
                                RegionId: data.RegionId,
                                Name: data.CityId.toString(),
                                District: data.District,
                                CitySort: 0,
                                DisplayInPopup: false,
                                PhoneNumber: '',
                                MobilePhoneNumber: '',
                                Zip: data.Zip,
                            };

                            this.form.countryId = data?.CountryId;
                            this.form.region = data?.Region;
                            this.form.district = data?.District;
                            this.form.zip = data?.Zip;
                            if (this.form.countries) {
                                this.getSelectedCountry(this.form.countries);
                            }

                            // if (data?.City != null && this.isShowMap) {
                            //     this.getCoordsFromAddress(data.City);
                            // }
                            // if (data?.Latitude != null && data?.Longitude != null) {
                            //     const coords = [data.Longitude, data.Latitude] as ICoords;
                            //     this.setCenterMap(coords);
                            // }
                        }
                    }
                });
            },
            timeout != null ? timeout : 700,
        ));
    };

    processAddress = (data?: ILocation, timeout?: number) => {
        if (this.fields != null && !this.fields.UseAddressSuggestions) {
            return;
        }

        if (this.processContactTimer != null) {
            this.$timeout.cancel(this.processContactTimer);
        }
        this.skipAction = true;
        return (this.processContactTimer = this.$timeout(
            () => {
                this.form.byCity = false;
                if (data != null && data.Zip) {
                    this.form.zip = data.Zip;
                } else {
                    this.addressService.processAddress(this.form, this.customerId).then((res: Response<ISuggestAddressQuery>) => {
                        if (!isResponseError<ISuggestAddressQuery>(res) && res.result) {
                            const data = res.obj;
                            this.form.zip = data?.Zip;
                            if (data?.Latitude != null && data?.Longitude != null) {
                                const coords = [data.Latitude, data.Longitude] as ICoords;
                                this.setCenterMap(coords);
                            }
                        }
                    });
                }
            },
            timeout != null ? timeout : 700,
        ));
    };

    processCountry = () => {
        this.form.countryId = this.form.country?.CountryId;
        this.skipAction = true;
    };

    processStreet = (data?: IIpZone, timeout?: number) => {
        if (this.fields != null && !this.fields.UseAddressSuggestions) {
            return;
        }

        if (this.processContactTimer != null) {
            this.$timeout.cancel(this.processContactTimer);
        }
        this.skipAction = true;
        return (this.processContactTimer = this.$timeout(
            () => {
                this.form.byCity = false;
                if (data != null && data.Zip) {
                    this.form.zip = data.Zip;
                } else {
                    this.addressService.processAddress(this.form, this.customerId).then((res: Response<LocationAddressType>) => {
                        if (!isResponseError<LocationAddressType>(res) && res.result) {
                            const data = res.obj;
                            this.form.zip = data?.Zip;
                            if (data?.Latitude != null && data?.Longitude != null) {
                                this.setCenterMap([data.Latitude, data.Longitude]);
                            }
                        }
                    });
                }
            },
            timeout != null ? timeout : 700,
        ));
    };

    cancelAdding = (modalId: string) => {
        this.modalService.close(modalId);
        if (this.fields?.IsShowFullAddress) {
            this.clearFullAddressData();
        }
        this.clearFormData();
    };

    save = () => {
        const obj = this.getObjectForUpdate(this.form);

        this.addressService.addUpdateCustomerContact(obj, this.customerId).then((response: ICustomerContact) => {
            if (response !== null) {
                if (this.zoneUpdateOnAdd === true) {
                    this.zoneService
                        .setCurrentZone(
                            response.City,
                            response.CityId,
                            response.CountryId,
                            response.Region,
                            response.Country,
                            response.Zip,
                            response.District,
                        )
                        .then((data) => {
                            if (data.ReloadPage) {
                                if (data.ReloadUrl) {
                                    this.$window.location.href = this.$window.location.href.replace(this.$window.location.origin, data.ReloadUrl);
                                } else {
                                    this.$window.location.reload();
                                }
                            }
                        });
                }

                this.contactId = response.ContactId;

                this.addressService.getAddresses(this.customerId).then((response: ICustomerContact[]) => {
                    const addressSelected = this.addressService.findItemForSelect(response, this.contactId);
                    if (this.onAddEditAddress) {
                        this.onAddEditAddress({ formData: this.form, contacts: response, addressSelected, city: this.currentCity });
                    }
                    this.close();
                });
            }
        });
    };

    close = () => {
        this.modalService.close('modalAddress');
        if (this.fields?.IsShowFullAddress) {
            this.clearFullAddressData();
        }
        this.clearFormData();
    };

    clearFormData = () => {
        this.form.contactId = undefined;
        this.form.fio = undefined;
        this.form.firstName = undefined;
        this.form.lastName = undefined;
        this.form.patronymic = undefined;
        this.form.countryId = undefined;
        this.form.country = undefined;
        this.form.region = undefined;
        this.form.city = undefined;
        this.form.district = undefined;
        this.form.street = undefined;
        this.form.zip = undefined;
        if (this.addEditAddressHtmlForm != null) {
            this.addEditAddressHtmlForm.$setPristine();
        }
    };

    getObjectForUpdate = (form: FormType) => {
        const account: ICustomerContact | Record<PropertyKey, any> = {};

        if (form.contactId) {
            account.ContactId = form.contactId;
        }

        if (form.fio) {
            account.Fio = form.fio;
        }

        if (form.firstName) {
            account.FirstName = form.firstName;
        }
        if (form.lastName) {
            account.LastName = form.lastName;
        }
        if (form.patronymic) {
            account.Patronymic = form.patronymic;
        }

        if (form.country) {
            account.CountryId = form.country.CountryId;
            account.Country = form.country.Name;
        }

        if (form.region) {
            account.Region = form.region;
        }

        if (form.district) {
            account.District = form.district;
        }

        if (form.city) {
            account.City = form.city;
        }

        if (form.zip) {
            account.Zip = form.zip;
        }

        account.Street = form.street;
        account.House = form.house;
        account.Apartment = form.apartment;
        account.Structure = form.structure;
        account.Entrance = form.entrance;
        account.Floor = form.floor;

        account.IsShowName = this.isShowName;
        account.IsMain = this.addressSelected != null ? form.contactId === this.addressSelected.ContactId : false;

        return account;
    };

    setCenterMap = (coords: ICoords) => {
        this.center = coords;
    };

    unblockEnterAddress = () => {
        this.disabledAddAddress = false;
    };

    blockEnterAddress = () => {
        this.disabledAddAddress = true;
    };

    onActionEndMap = async (center: ICoords | undefined) => {
        if (center && !this.skipAction) {
            this.blockEnterAddress();
            const coords: ICoordsObj = {
                Latitude: center[0],
                Longitude: center[1],
            };

            try {
                const addressValue = await this.zoneMapService.getAddressByCoords(coords);
                addressValue?.CheckoutAddress && this.setAddressInForm(addressValue.CheckoutAddress, this.form);
            } catch (e) {
                this.unblockEnterAddress();
                console.error(e.message);
            }

            this.$scope.$digest();
        }
        this.skipAction = false;
    };

    changeAddress = (type: ProcessAddressValueTypes, obj?: ILocation, timeout?: number) => {
        switch (type) {
            case this.processAddressTypes.CITY:
                this.processCity(obj, timeout);
                break;
            case this.processAddressTypes.ADDRESS:
                this.processAddress(obj, timeout);
                break;
            case this.processAddressTypes.COUNTRY:
                this.processCountry();
                break;
            case this.processAddressTypes.STREET_HOUSE:
                this.processStreet();
                break;
        }
    };

    setAddressInForm = (address: ICheckoutAddress, form: FormType) => {
        form.contactId = address.ContactId;
        form.country = (address.Country && this.getCountryObjFromName(address.Country)) || undefined;
        form.region = address.Region;
        form.district = address.District;
        form.city = address.City;
        form.zip = address.Zip;
        form.street = address.Street;
        form.house = address.House;
        form.apartment = address.Apartment;
        form.structure = address.Structure;
        form.entrance = address.Entrance;
        form.floor = address.Floor;
    };

    getCountryObjFromName = (countryName: string): ICountry | undefined => this.form.countries?.find((it) => it.Name === countryName);

    getCoordsFromAddress = async (address: string) => {
        try {
            if (this.yaApiKey) {
                const { data } = await this.zoneMapService.getCoordsByAddress(address, this.yaApiKey);
                if (!isResponseError<ICoordsObj>(data) && data.obj) {
                    const { Latitude, Longitude } = data.obj;
                    this.setCenterMap([Latitude.toString(), Longitude.toString()]);
                    this.$scope.$digest();
                }
            }
        } catch (e) {
            console.error(e.message);
        }
    };
    locate = () => {
        this.blockEnterAddress();
        navigator.geolocation.getCurrentPosition(
            async (position: GeolocationPosition) => {
                const lat = position.coords.latitude.toString();
                const long = position.coords.longitude.toString();

                try {
                    const addressValue = await this.zoneMapService.getAddressByCoords({
                        Latitude: lat,
                        Longitude: long,
                    });

                    this.setCenterMap([lat, long]);
                    addressValue?.CheckoutAddress && this.setAddressInForm(addressValue.CheckoutAddress, this.form);
                    this.$scope.$digest();
                } catch (e) {
                    throw new Error(e);
                }
                this.unblockEnterAddress();
            },
            () => {
                this.getLocationFromMap()
                    .then((position) => {
                        this.setCenterMap(position);
                    })
                    .catch((err) => {
                        this.toaster.error(this.$translate.instant('Js.Location.DetermineError'));
                        console.error(err);
                    })
                    .finally(() => {
                        this.unblockEnterAddress();
                        this.$scope.$apply();
                    });
            },
            {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 1000,
            },
        );
    };

    getLocationFromMap = async (): Promise<number[]> => {
        const result: geolocation.IGeolocationResult = await this.yandexMapsService.getLocation();
        /* @ts-ignore*/
        return result.geoObjects.position;
    };

    onCheckDeliveryZone = (isContain: boolean, polygon?: IGeoObjectPolygon) => {
        isContain ? this.unblockEnterAddress() : this.blockEnterAddress();
    };

    onInitMap = (map: Map) => {
        this.map = map;
    };
}
