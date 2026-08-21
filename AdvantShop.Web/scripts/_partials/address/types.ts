import type { ICountry } from '../zone/types';
import { ICustomerContact } from '../../myaccount/types';
import { ICity } from '../../@types/location';

export interface CustomerContactsFieldsType {
    IsShowCountry: boolean;
    IsRequiredCountry: boolean;
    IsShowState: boolean;
    IsRequiredState: boolean;
    IsShowCity: boolean;
    IsRequiredCity: boolean;
    IsShowDistrict: boolean;
    IsRequiredDistrict: boolean;
    IsShowAddress: boolean;
    IsRequiredAddress: boolean;
    IsShowZip: boolean;
    IsRequiredZip: boolean;
    IsShowFullAddress: boolean;
    UseAddressSuggestions: boolean;
    SuggestAddressUrl?: string;
    IsShowFirstName: boolean;
    CustomerFirstNameField: string;
    IsShowLastName: boolean;
    IsRequiredLastName: boolean;
    IsShowPatronymic: boolean;
    IsRequiredPatronymic: boolean;
}

export interface AddressListConfigType {
    autocompleteAlt: boolean;
    themeAlt: boolean;
    compactMode: boolean;
    overrideFields: OverrideFieldsType;
    requiredValidationEnabled: boolean;
}

export interface OverrideFieldsType {
    visible: (keyof CustomerContactsFieldsType)[];
}

export type ContactId = FormType['contactId'];

export type FormType =
    | {
          house?: string | null;
          apartment?: string | null;
          structure?: string | null;
          entrance?: string | null;
          floor?: string | null;
          countries?: ICountry[];
          countryId?: number;
          country?: ICountry;
          region?: string;
          district?: string;
          zip?: string;
          byCity?: boolean;
          contactId?: string;
          fio?: string;
          firstName?: string;
          lastName?: string;
          patronymic?: string;
          city?: string;
          street?: string;
          cityStreetHouse?: string;
      }
    | Record<PropertyKey, never>;

export interface OnAddEditAddressCallbackDataType {
    formData: FormType;
    contacts: ICustomerContact[];
    addressSelected: ICustomerContact;
    city?: ICity;
}

export interface LocationAddressType {
    Name: string;
    CityId: number;
    District: string;
    RegionId: number;
    Region: string;
    CountryId: number;
    Country: string;
    Zip: string;
    ShowRegion: boolean;
    ShowDistrict: boolean;
    Longitude?: string;
    Latitude?: string;
}
