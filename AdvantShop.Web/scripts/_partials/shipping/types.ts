import { TaxType, Currency, IPhoto } from '../../@types/shared';
import { PaymentMethodType, PaymentSubjectType } from '../payment/types';
import { TypeOfDelivery } from '../../checkout/types';
import { IGeoObjectFeature } from 'yandex-maps';
import { MakeAllRequired, WithRequiredField } from '../../@types/generics';
import { IGeometry, IPointMap, IStore } from '../../_common/points-list-map/types';
import { ICoords } from '../../@types/location';

interface Params {
    ShowDeliveryInterval: string;
    DeliveryIntervals: string;
    TimezoneId: string;
    CountVisibleDeliveryDay: string;
    CountHiddenDeliveryDay: string;
    MinDeliveryTime: string;
    ShowSoonest: string;
}

interface TimeWork {
    Label: string;
    From: string;
    To: string;
}

export interface IBaseShippingOption {
    Id: string;
    Code: string;
    Name: string;
    Address: string;
    AddressComment: string;
    Description: string;
    Latitude?: number;
    Longitude?: number;
    AvailableCashOnDelivery?: boolean;
    AvailableCardOnDelivery?: boolean;
    Phones: string[];
    TimeWorkStr: string;
    TimeWork: TimeWork[];
    StoragePeriodInDay?: number;
    DeliveryPeriodInDay?: number;
    MaxWeightInGrams?: number;
    DimensionSumInMillimeters?: number;
    DimensionVolumeInCentimeters?: number;
    MaxHeightInMillimeters?: number;
    MaxWidthInMillimeters?: number;
    MaxLengthInMillimeters?: number;
    MaxCost?: number;
    WarehouseId?: number;
}

export interface IAbstractShippingOption {
    Id: string;
    DeliveryId: number;
    MethodId: number;
    Name: string;
    Hint: string;
    Desc: string;
    DisplayCustomFields: boolean;
    DisplayIndex: boolean;
    IconName: string;

    ShowInDetails: boolean;
    ZeroPriceMessage: string;
    TaxId?: number;
    PaymentMethodType: PaymentMethodType;
    PaymentSubjectType: PaymentSubjectType;
    ShippingType: string;

    NameRate: string;
    HideAddressBlock: boolean;
    Rate: number;
    ManualRate: number;
    UseExtracharge: boolean;
    ExtrachargeInNumbers: number;
    ExtrachargeInPercents: number;
    ExtrachargeFromOrder: boolean;
    PreCost: number;
    ShippingCurrency: Currency;
    ShippingPoints: IBaseShippingOption[];
    CurrentCurrency: Currency;
    FinalRate: number;
    FormatRate: string;
    DeliveryTime: string;
    ExtraDeliveryTime: number;
    ModelType: string;
    UseDeliveryInterval: boolean;
    ShowSoonest: boolean;
    TypeOfDelivery?: TypeOfDelivery;
    DeliveryIntervalsStr: string;
    DateOfDeliveryStr: string;
    MinDate: string;
    MaxDate: string;
    StartDateTime: Date;
    TimeZoneOffset?: number;
    Warehouses: number[];
    Template: string;
    TemplateName: string;
    ErrorMessage: string;
    ApplyPay: boolean;
    IsAvailablePaymentCashOnDelivery: boolean;
    IsAvailablePaymentPickPoint: boolean;
    SelectedPoint?: IBaseShippingOption;
    DateOfDelivery: Date;
    TimeOfDelivery: string;
    Asap?: boolean;
    AvailablePayment: boolean;
}

export interface IGeoModeDeliveries {
    options: IAbstractShippingOption[];
    selectedOption: IAbstractShippingOption;
    reloadPage: boolean;
}

export interface IFeatureGeometry {
    type: string;
    coordinates: ICoords[];
}

export interface IFeature {
    id: number;
    properties: Record<string, any>;
    geometry: IFeatureGeometry;
}

export interface IFeatureCollection {
    features: IFeature[];
    metadata: {
        creator: string;
        name: string;
    };
    type: 'FeatureCollection';
}

export interface IDeliveryZone {
    FeatureCollection: IFeatureCollection;
    ShippingMethodId: number;
}

export interface IFeatureGeometry {
    type: string;
    coordinates: ICoords[];
}

export interface IFeature {
    id: number;
    properties: Record<string, any>;
    geometry: IFeatureGeometry;
}

export interface IFeatureCollection {
    features: IFeature[];
    metadata: {
        creator: string;
        name: string;
    };
    type: 'FeatureCollection';
}

export interface IDeliveryZone {
    FeatureCollection: IFeatureCollection;
}

export interface ICornerMapCells {
    LowerCornerLatitude: number;
    LowerCornerLongitude: number;
    UpperCornerLatitude: number;
    UpperCornerLongitude: number;
}

export interface IShippingsMethodPointsMap {
    Cells: ICornerMapCells[];
    ShippingsPoints: IShippingsMethod[];
}

export interface IShippingsPointMap {
    Id: string;
    Code: string;
    Name: string;
    Address: string;
    AddressComment: string;
    Description: string;
    Latitude: number;
    Longitude: number;
    Phones: string[];
    TimeWorkStr: string;
    TimeWork: TimeWork[];
    WarehouseId?: number;
}

export interface IShippingsMethod {
    MethodId: number;
    Points: IShippingsPointMap[];
}

export interface IShippingPointData {
    shippingMethod: IShippingsMethod;
    point: IShippingsPointMap;
}

export interface ICityMapData {
    id: number;
    name: string;
    bounds: number[][];
    coords: number[];
}

export interface ISelectOptionResponse {
    selectedOption?: IBaseShippingOption;
    reloadPage: boolean;
}
