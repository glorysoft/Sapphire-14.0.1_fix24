export interface IProperty {
    PropertyId: number;
    Name: string;
}

export interface IPropertyValue {
    PropertyValueId: number;
    Value: string;
}

export interface ISizeChartModel {
    Id: number;
    Name: string | null;
    ModalHeader: string | null;
    LinkText: string | null;
    Text: string | null;
    SourceType: number;
    SortOrder: number;
    Enabled: boolean;
    ProductIds: number[];
    CategoryIds: number[];
    BrandIds: number[];
    PropertyValues: ISizeChartPropertyValueModel[] | null;
}

export interface ISizeChartPropertyValueModel {
    PropertyValueId: number;
    PropertyValueName: string;
    PropertyName: string;
}

export interface IBrand {
    BrandId: number;
}

export interface IModalAddEditSizeChartParams {
    id?: number;
}

export interface IModalAddSizeChartPropertyParams {
    selectedPropertyValues?: ISizeChartPropertyValueModel[];
}
