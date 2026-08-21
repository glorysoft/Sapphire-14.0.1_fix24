import { ISizeChartService } from '../sizeChart.service';
import { IModalAddSizeChartPropertyParams, IProperty, IPropertyValue, ISizeChartPropertyValueModel } from '../sizeChart.types';
import { IController } from 'angular';

export interface IModalAddSizeChartPropertyCtrl extends IController {
    propType: string;
    properties?: IProperty[];
    propertyValues?: IPropertyValue[];
    propertiesModified: boolean;
    property: IProperty | null;
    propertyValue: IPropertyValue | null;
    selectedPropertyValues?: ISizeChartPropertyValueModel[];

    close(): void;

    getProperties(): void;

    getPropertyValues(): void;

    changeProperty(): void;

    saveProperty(): void;

    addProperty(): void;

    deletePropertyValue(propertyValueId: number): void;
}

export default class ModalAddSizeChartPropertyCtrl implements IModalAddSizeChartPropertyCtrl {
    propType: string;
    properties?: IProperty[];
    propertyValues?: IPropertyValue[];
    propertiesModified: boolean;
    property: IProperty | null;
    propertyValue: IPropertyValue | null;
    selectedPropertyValues?: ISizeChartPropertyValueModel[];

    /* @ngInject */
    constructor(
        readonly $uibModalInstance: any,
        readonly sizeChartService: ISizeChartService,
        readonly params: IModalAddSizeChartPropertyParams,
    ) {
        this.selectedPropertyValues = params.selectedPropertyValues;
        this.propType = '0';
        this.propertiesModified = false;
        this.property = null;
        this.propertyValue = null;
    }

    $onInit() {
        this.getProperties();
    };

    close() {
        this.$uibModalInstance.dismiss('cancel');
    };

    getProperties() {
        this.sizeChartService.getProperties().then((properties: IProperty[]) => {
            this.properties = properties;
        });
    };

    getPropertyValues() {
        if (this.property == null) return;

        this.sizeChartService.getPropertyValues(this.property.PropertyId).then((propertyValues: IPropertyValue[]) => {
            this.propertyValues = propertyValues;

            if (this.propertyValues != null && this.propertyValues.length > 0) {
                this.propertyValue = this.propertyValues[0];
            }
        });
    };

    changeProperty() {
        this.getPropertyValues();
    };

    saveProperty() {
        this.$uibModalInstance.close(this.selectedPropertyValues);
    };

    addProperty() {
        if (!this.propertyValue || !this.propertyValue.PropertyValueId || !this.propertyValue.Value || !this.selectedPropertyValues) return;

        if (this.selectedPropertyValues.some((x) => x.PropertyValueId == this.propertyValue!.PropertyValueId)) return;

        this.selectedPropertyValues.push({
            PropertyValueId: this.propertyValue.PropertyValueId,
            PropertyName: this.property!.Name,
            PropertyValueName: this.propertyValue.Value,
        });
        this.propertiesModified = true;
        this.propertyValue = null;
    };

    deletePropertyValue (propertyValueId: number) {
        if (this.selectedPropertyValues !== undefined) {
            this.selectedPropertyValues = this.selectedPropertyValues.filter((x) => x.PropertyValueId != propertyValueId);
            this.propertiesModified = true;
        }
    };
}
