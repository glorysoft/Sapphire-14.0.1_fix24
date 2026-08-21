import { ICheckoutAddress } from '../checkout/types';

export interface ICoordsObj {
    Longitude: string | number;
    Latitude: string | number;
}

export type ICoords = number[] | string[];

export type Address = string;

export interface IIpZone {
    CountryId: number;
    CountryName: string;
    RegionId: number;
    Region: string;
    CityId: number;
    City: string;
    District: string;
    Phone: string;
    MobilePhone: string;
    Zip: string;
}

export interface AddressData {
    Country: string;
    CountryName: string;
    Region: string;
    District: string;
    City: string;
    Zip: string;
    Street: string;
    House: string;
    Structure: string;
    CountryId?: number;
    RegionId?: number;
}

export interface AddressValue {
    Value: Address;
    Coords?: ICoordsObj;
    CheckoutAddress: ICheckoutAddress;
    AddressData: Readonly<AddressData>;
}

export interface ISuggestAddress extends ILocation {
    City: string;
    Street: string;
    House: string;
}

export enum EFullNamePart {
    None,
    FirstName,
    LastName,
    Patronymic,
}

export interface ILocation {
    CountryId: number;
    Country: string;
    RegionId: number;
    Region: string;
    CityId: number;
    Name: string;
    District: string;
    Phone: string;
    MobilePhone: string;
    Zip: string;
    ShowRegion: boolean;
    ShowDistrict: boolean;
    Longitude: string;
    Latitude: string;
}

export interface ISuggestAddressQuery extends ISuggestAddress {
    Q: string;
    Part: EFullNamePart;
    ByCity: boolean;
    InAdminPart: boolean;
}

export interface ICity {
    CityId: number;
    RegionId: number;
    Name: string;
    District: string;
    CitySort: number;
    DisplayInPopup: boolean;
    PhoneNumber: string;
    MobilePhoneNumber: string;
    Zip: string;
    AdditionalSettings?: CityAdditionalSettings;
}

export interface CityAdditionalSettings {
    CityId: number;
    ShippingZones: string;
    ShippingZonesIframe: string;
    CityAddressPoints: string;
    CityAddressPointsIframe: string;
    CityDescription: string;
    FiasId: string;
    KladrId: string;
}

export type GeometryType = Record<'POINT' | 'LINESTRING' | 'RECTANGLE' | 'POLYGON' | 'CIRCLE', string>;
