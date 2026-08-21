import { IController, ILocaleService, translate } from 'angular';
import { IToasterService } from 'ngtoaster';
import { ISizeChartModel, IBrand, IModalAddEditSizeChartParams } from '../sizeChart.types';
import { ISizeChartService } from '../sizeChart.service';
import { isResponseError, type Response } from '../../../../../../scripts/@types/http';

const enExampleTable = `
<table style="min-width: 800px; width: 100%; padding: 0; margin: 0; table-layout: fixed; border: 0;">
    <thead style="background-color: #f6f6f9;">
        <tr>
            <th style="padding: 1.5625rem 0.625rem 1.5625rem 1.5625rem; border-width: 0 0 0.0625rem 0; box-sizing: border-box; border-bottom: 0;"><span style="font-size: 16px;">Mens</span></th>
            <th style="padding: 1.5625rem 0.625rem 1.5625rem 1.5625rem; border-width: 0 0 0.0625rem 0; box-sizing: border-box; border-bottom: 0;"><span style="font-size: 16px;">Small</span></th>
            <th style="padding: 1.5625rem 0.625rem 1.5625rem 1.5625rem; border-width: 0 0 0.0625rem 0; box-sizing: border-box; border-bottom: 0;"><span style="font-size: 16px;">Medium</span></th>
            <th style="padding: 1.5625rem 0.625rem 1.5625rem 1.5625rem; border-width: 0 0 0.0625rem 0; box-sizing: border-box; border-bottom: 0;"><span style="font-size: 16px;">Large</span></th>
            <th style="padding: 1.5625rem 0.625rem 1.5625rem 1.5625rem; border-width: 0 0 0.0625rem 0; box-sizing: border-box; border-bottom: 0;"><span style="font-size: 16px;">X-Large</span></th>
            <th style="padding: 1.5625rem 0.625rem 1.5625rem 1.5625rem; border-width: 0 0 0.0625rem 0; box-sizing: border-box; border-bottom: 0;"><span style="font-size: 16px;">XX-Large</span></th>
        </tr>
    </thead>
    <tbody style="">
        <tr>
            <td style="padding: 1.5625rem 0 1.5625rem 1.5625rem; border-width: 0 0 0.0625rem 0; border-bottom: 0.0625rem #e2e3e4 solid; box-sizing: border-box;"><span style="font-size: 16px;">Neck</span></td>
            <td style="padding: 1.5625rem 0 1.5625rem 1.5625rem; border-width: 0 0 0.0625rem 0; border-bottom: 0.0625rem #e2e3e4 solid; box-sizing: border-box;"><span style="font-size: 16px;">14-14.5</span></td>
            <td style="padding: 1.5625rem 0 1.5625rem 1.5625rem; border-width: 0 0 0.0625rem 0; border-bottom: 0.0625rem #e2e3e4 solid; box-sizing: border-box;"><span style="font-size: 16px;">15-15.5</span></td>
            <td style="padding: 1.5625rem 0 1.5625rem 1.5625rem; border-width: 0 0 0.0625rem 0; border-bottom: 0.0625rem #e2e3e4 solid; box-sizing: border-box;"><span style="font-size: 16px;">16-16.5</span></td>
            <td style="padding: 1.5625rem 0 1.5625rem 1.5625rem; border-width: 0 0 0.0625rem 0; border-bottom: 0.0625rem #e2e3e4 solid; box-sizing: border-box;"><span style="font-size: 16px;">17-17.5</span></td>
            <td style="padding: 1.5625rem 0 1.5625rem 1.5625rem; border-width: 0 0 0.0625rem 0; border-bottom: 0.0625rem #e2e3e4 solid; box-sizing: border-box;"><span style="font-size: 16px;">18-18.5</span></td>
        </tr>
        <tr>
            <td style="padding: 1.5625rem 0 1.5625rem 1.5625rem; border-width: 0 0 0.0625rem 0; border-bottom: 0.0625rem #e2e3e4 solid; box-sizing: border-box;"><span style="font-size: 16px;">Chest</span></td>
            <td style="padding: 1.5625rem 0 1.5625rem 1.5625rem; border-width: 0 0 0.0625rem 0; border-bottom: 0.0625rem #e2e3e4 solid; box-sizing: border-box;"><span style="font-size: 16px;">35-37</span></td>
            <td style="padding: 1.5625rem 0 1.5625rem 1.5625rem; border-width: 0 0 0.0625rem 0; border-bottom: 0.0625rem #e2e3e4 solid; box-sizing: border-box;"><span style="font-size: 16px;">38-40</span></td>
            <td style="padding: 1.5625rem 0 1.5625rem 1.5625rem; border-width: 0 0 0.0625rem 0; border-bottom: 0.0625rem #e2e3e4 solid; box-sizing: border-box;"><span style="font-size: 16px;">41-43</span></td>
            <td style="padding: 1.5625rem 0 1.5625rem 1.5625rem; border-width: 0 0 0.0625rem 0; border-bottom: 0.0625rem #e2e3e4 solid; box-sizing: border-box;"><span style="font-size: 16px;">44-46</span></td>
            <td style="padding: 1.5625rem 0 1.5625rem 1.5625rem; border-width: 0 0 0.0625rem 0; border-bottom: 0.0625rem #e2e3e4 solid; box-sizing: border-box;"><span style="font-size: 16px;">47-49</span></td>
        </tr>
        <tr>
            <td style="padding: 1.5625rem 0 1.5625rem 1.5625rem; border-width: 0 0 0.0625rem 0; border-bottom: 0.0625rem #e2e3e4 solid; box-sizing: border-box;"><span style="font-size: 16px;">Sleeve</span></td>
            <td style="padding: 1.5625rem 0 1.5625rem 1.5625rem; border-width: 0 0 0.0625rem 0; border-bottom: 0.0625rem #e2e3e4 solid; box-sizing: border-box;"><span style="font-size: 16px;">32-33</span></td>
            <td style="padding: 1.5625rem 0 1.5625rem 1.5625rem; border-width: 0 0 0.0625rem 0; border-bottom: 0.0625rem #e2e3e4 solid; box-sizing: border-box;"><span style="font-size: 16px;">33-34</span></td>
            <td style="padding: 1.5625rem 0 1.5625rem 1.5625rem; border-width: 0 0 0.0625rem 0; border-bottom: 0.0625rem #e2e3e4 solid; box-sizing: border-box;"><span style="font-size: 16px;">34-35</span></td>
            <td style="padding: 1.5625rem 0 1.5625rem 1.5625rem; border-width: 0 0 0.0625rem 0; border-bottom: 0.0625rem #e2e3e4 solid; box-sizing: border-box;"><span style="font-size: 16px;">35-36</span></td>
            <td style="padding: 1.5625rem 0 1.5625rem 1.5625rem; border-width: 0 0 0.0625rem 0; border-bottom: 0.0625rem #e2e3e4 solid; box-sizing: border-box;"><span style="font-size: 16px;">36-36.5</span></td>
        </tr>
        <tr>
            <td style="padding: 1.5625rem 0 1.5625rem 1.5625rem; border-width: 0 0 0.0625rem 0; border-bottom: 0.0625rem #e2e3e4 solid; box-sizing: border-box;"><span style="font-size: 16px;">Waist</span></td>
            <td style="padding: 1.5625rem 0 1.5625rem 1.5625rem; border-width: 0 0 0.0625rem 0; border-bottom: 0.0625rem #e2e3e4 solid; box-sizing: border-box;"><span style="font-size: 16px;">29-31</span></td>
            <td style="padding: 1.5625rem 0 1.5625rem 1.5625rem; border-width: 0 0 0.0625rem 0; border-bottom: 0.0625rem #e2e3e4 solid; box-sizing: border-box;"><span style="font-size: 16px;">32-34</span></td>
            <td style="padding: 1.5625rem 0 1.5625rem 1.5625rem; border-width: 0 0 0.0625rem 0; border-bottom: 0.0625rem #e2e3e4 solid; box-sizing: border-box;"><span style="font-size: 16px;">35-37</span></td>
            <td style="padding: 1.5625rem 0 1.5625rem 1.5625rem; border-width: 0 0 0.0625rem 0; border-bottom: 0.0625rem #e2e3e4 solid; box-sizing: border-box;"><span style="font-size: 16px;">38-40</span></td>
            <td style="padding: 1.5625rem 0 1.5625rem 1.5625rem; border-width: 0 0 0.0625rem 0; border-bottom: 0.0625rem #e2e3e4 solid; box-sizing: border-box;"><span style="font-size: 16px;">41-43</span></td>
        </tr>
    </tbody>
</table>
`;
const ruExampleTable = `
<table style="min-width: 800px; width: 100%; padding: 0; margin: 0; table-layout: fixed; border: 0;">
    <thead style="background-color: #f6f6f9;">
        <tr>
            <th style="padding: 1.5625rem 0.625rem 1.5625rem 1.5625rem; border-width: 0 0 0.0625rem 0; box-sizing: border-box; border-bottom: 0;"><span style="font-size: 16px;">Российский размер</span></th>
            <th style="padding: 1.5625rem 0.625rem 1.5625rem 1.5625rem; border-width: 0 0 0.0625rem 0; box-sizing: border-box; border-bottom: 0;"><span style="font-size: 16px;">Размер производителя</span></th>
            <th style="padding: 1.5625rem 0.625rem 1.5625rem 1.5625rem; border-width: 0 0 0.0625rem 0; box-sizing: border-box; border-bottom: 0;"><span style="font-size: 16px;">Обхват бедер, в см</span></th>
            <th style="padding: 1.5625rem 0.625rem 1.5625rem 1.5625rem; border-width: 0 0 0.0625rem 0; box-sizing: border-box; border-bottom: 0;"><span style="font-size: 16px;">Обхват груди, в см</span></th>
            <th style="padding: 1.5625rem 0.625rem 1.5625rem 1.5625rem; border-width: 0 0 0.0625rem 0; box-sizing: border-box; border-bottom: 0;"><span style="font-size: 16px;">Обхват талии, в см</span></th>
        </tr>
    </thead>
    <tbody style="">
        <tr>
            <td style="padding: 1.5625rem 0 1.5625rem 1.5625rem; border-width: 0 0 0.0625rem 0; border-bottom: 0.0625rem #e2e3e4 solid; box-sizing: border-box;"><span style="font-size: 16px;">42</span></td>
            <td style="padding: 1.5625rem 0 1.5625rem 1.5625rem; border-width: 0 0 0.0625rem 0; border-bottom: 0.0625rem #e2e3e4 solid; box-sizing: border-box;"><span style="font-size: 16px;">42</span></td>
            <td style="padding: 1.5625rem 0 1.5625rem 1.5625rem; border-width: 0 0 0.0625rem 0; border-bottom: 0.0625rem #e2e3e4 solid; box-sizing: border-box;"><span style="font-size: 16px;">90-94</span></td>
            <td style="padding: 1.5625rem 0 1.5625rem 1.5625rem; border-width: 0 0 0.0625rem 0; border-bottom: 0.0625rem #e2e3e4 solid; box-sizing: border-box;"><span style="font-size: 16px;">82-86</span></td>
            <td style="padding: 1.5625rem 0 1.5625rem 1.5625rem; border-width: 0 0 0.0625rem 0; border-bottom: 0.0625rem #e2e3e4 solid; box-sizing: border-box;"><span style="font-size: 16px;">62-66</span></td>
        </tr>
        <tr>
            <td style="padding: 1.5625rem 0 1.5625rem 1.5625rem; border-width: 0 0 0.0625rem 0; border-bottom: 0.0625rem #e2e3e4 solid; box-sizing: border-box;"><span style="font-size: 16px;">44</span></td>
            <td style="padding: 1.5625rem 0 1.5625rem 1.5625rem; border-width: 0 0 0.0625rem 0; border-bottom: 0.0625rem #e2e3e4 solid; box-sizing: border-box;"><span style="font-size: 16px;">44</span></td>
            <td style="padding: 1.5625rem 0 1.5625rem 1.5625rem; border-width: 0 0 0.0625rem 0; border-bottom: 0.0625rem #e2e3e4 solid; box-sizing: border-box;"><span style="font-size: 16px;">94-98</span></td>
            <td style="padding: 1.5625rem 0 1.5625rem 1.5625rem; border-width: 0 0 0.0625rem 0; border-bottom: 0.0625rem #e2e3e4 solid; box-sizing: border-box;"><span style="font-size: 16px;">86-90</span></td>
            <td style="padding: 1.5625rem 0 1.5625rem 1.5625rem; border-width: 0 0 0.0625rem 0; border-bottom: 0.0625rem #e2e3e4 solid; box-sizing: border-box;"><span style="font-size: 16px;">66-70</span></td>
        </tr>
        <tr>
            <td style="padding: 1.5625rem 0 1.5625rem 1.5625rem; border-width: 0 0 0.0625rem 0; border-bottom: 0.0625rem #e2e3e4 solid; box-sizing: border-box;"><span style="font-size: 16px;">46</span></td>
            <td style="padding: 1.5625rem 0 1.5625rem 1.5625rem; border-width: 0 0 0.0625rem 0; border-bottom: 0.0625rem #e2e3e4 solid; box-sizing: border-box;"><span style="font-size: 16px;">46</span></td>
            <td style="padding: 1.5625rem 0 1.5625rem 1.5625rem; border-width: 0 0 0.0625rem 0; border-bottom: 0.0625rem #e2e3e4 solid; box-sizing: border-box;"><span style="font-size: 16px;">98-102</span></td>
            <td style="padding: 1.5625rem 0 1.5625rem 1.5625rem; border-width: 0 0 0.0625rem 0; border-bottom: 0.0625rem #e2e3e4 solid; box-sizing: border-box;"><span style="font-size: 16px;">90-94</span></td>
            <td style="padding: 1.5625rem 0 1.5625rem 1.5625rem; border-width: 0 0 0.0625rem 0; border-bottom: 0.0625rem #e2e3e4 solid; box-sizing: border-box;"><span style="font-size: 16px;">70-74</span></td>
        </tr>
        <tr>
            <td style="padding: 1.5625rem 0 1.5625rem 1.5625rem; border-width: 0 0 0.0625rem 0; border-bottom: 0.0625rem #e2e3e4 solid; box-sizing: border-box;"><span style="font-size: 16px;">48</span></td>
            <td style="padding: 1.5625rem 0 1.5625rem 1.5625rem; border-width: 0 0 0.0625rem 0; border-bottom: 0.0625rem #e2e3e4 solid; box-sizing: border-box;"><span style="font-size: 16px;">48</span></td>
            <td style="padding: 1.5625rem 0 1.5625rem 1.5625rem; border-width: 0 0 0.0625rem 0; border-bottom: 0.0625rem #e2e3e4 solid; box-sizing: border-box;"><span style="font-size: 16px;">102-106</span></td>
            <td style="padding: 1.5625rem 0 1.5625rem 1.5625rem; border-width: 0 0 0.0625rem 0; border-bottom: 0.0625rem #e2e3e4 solid; box-sizing: border-box;"><span style="font-size: 16px;">94-98</span></td>
            <td style="padding: 1.5625rem 0 1.5625rem 1.5625rem; border-width: 0 0 0.0625rem 0; border-bottom: 0.0625rem #e2e3e4 solid; box-sizing: border-box;"><span style="font-size: 16px;">74-78</span></td>
        </tr>
    </tbody>
</table>
`;

export interface IModalAddEditSizeChartCtrl extends IController {
    textBySourceType: object;
    id?: number;
    mode?: 'edit' | 'add';
    data?: ISizeChartModel;
    selectedBrandsList?: IBrand[];
    sizeChartForm: any;
    saveLoading: boolean;

    init(form: any): void;

    close(): void;

    getSizeChart(id: number): void;

    save(): void;

    selectProducts(result: any): void;

    resetProducts(): void;

    selectCategories(result: any): void;

    resetCategories(): void;

    checkSelectedItem(rowEntity: any): boolean;

    insertExample(): void;

    changeBrand(result: any): void;

    resetBrands(): void;

    addProperty(result: any): void;

    resetProperties(): void;

    resetPropertyValues(): void;
}

export default class ModalAddEditSizeChartCtrl implements IModalAddEditSizeChartCtrl {
    textBySourceType: object;
    id?: number;
    mode?: 'edit' | 'add';
    data?: ISizeChartModel;
    selectedBrandsList?: IBrand[];
    sizeChartForm: any;
    saveLoading: boolean;

    /* @ngInject */
    constructor(
        readonly sizeChartService: ISizeChartService,
        readonly $uibModalInstance: any,
        readonly toaster: IToasterService,
        readonly $translate: translate.ITranslateService,
        readonly $locale: ILocaleService,
        readonly params?: IModalAddEditSizeChartParams,
    ) {
        this.id = params?.id;
        this.textBySourceType = { 0: '', 1: '' };
        this.saveLoading = false;
    }

    $onInit() {
        this.id = this.id != null ? this.id : 0;
        this.mode = this.id != 0 ? 'edit' : 'add';

        if (this.mode == 'edit') {
            if (this.id !== undefined) {
                this.getSizeChart(this.id);
            }
        } else {
            this.data = {
                Id: 0,
                Name: null,
                ModalHeader: null,
                Text: null,
                SortOrder: 0,
                Enabled: true,
                SourceType: 0,
                LinkText: this.$translate.instant('Admin.Js.SizeChart.DefaultLinkText'),
                BrandIds: [],
                ProductIds: [],
                CategoryIds: [],
                PropertyValues: [],
            };

            this.selectedBrandsList = [];
        }
    };

    init(form: any) {
        this.sizeChartForm = form;
    };

    close() {
        this.$uibModalInstance.dismiss('cancel');
    };

    getSizeChart(id: number) {
        this.sizeChartService.getSizeChart(id).then((data: ISizeChartModel) => {
            this.data = data;
            this.selectedBrandsList = this.data.BrandIds.map((x) => ({ BrandId: x }));
            this.textBySourceType[this.data.SourceType] = this.data.Text;
            this.sizeChartForm.$setPristine();
            return data;
        });
    };

    save() {
        if (this.data !== undefined && this.selectedBrandsList !== undefined) {
            this.saveLoading = true;
            this.data.Text = this.textBySourceType[this.data.SourceType];

            if (this.data.BrandIds) {
                this.data.BrandIds = this.selectedBrandsList.map((x) => x.BrandId);
            }

            (this.mode === 'add' ? this.sizeChartService.add(this.data) : this.sizeChartService.update(this.data)).then((response: Response) => {
                if (!isResponseError(response)) {
                    this.toaster.pop('success', '', this.$translate.instant('Admin.Js.ChangesSaved'));
                    this.$uibModalInstance.close();
                } else {
                    response.errors.forEach((error) => {
                        this.toaster.pop('error', '', error);
                    });
                }

                this.saveLoading = false;
            });
        }
    };

    selectProducts(result: any) {
        if (this.data !== undefined) {
            this.data.ProductIds = result.ids;
            this.sizeChartForm.modified = true;
        }
    };

    resetProducts() {
        if (this.data !== undefined) {
            this.data.ProductIds = [];
            this.sizeChartForm.modified = true;
        }
    };

    selectCategories(result: any) {
        if (this.data !== undefined) {
            this.data.CategoryIds = result.categoryIds;
            this.sizeChartForm.modified = true;
        }
    };

    resetCategories() {
        if (this.data !== undefined) {
            this.data.CategoryIds = [];
            this.data.PropertyValues = [];
            this.resetBrands();
            this.sizeChartForm.modified = true;
        }
    };

    checkSelectedItem(rowEntity: any) {
        return this.data != null && this.data.ProductIds.indexOf(rowEntity.ProductId) !== -1;
    };

    insertExample() {
        this.textBySourceType[0] = this.$locale.id !== 'ru-ru'
            ? enExampleTable
            : ruExampleTable;
    };

    changeBrand(result: any) {
        this.selectedBrandsList = result;
        this.sizeChartForm.modified = true;
    };

    resetBrands() {
        this.selectedBrandsList = [];
        this.sizeChartForm.modified = true;
    };

    addProperty(result: any) {
        if (this.data !== undefined) {
            this.data.PropertyValues = result;
            this.sizeChartForm.modified = true;
        }
    };

    resetProperties() {
        if (this.data !== undefined && this.data.PropertyValues && this.data.PropertyValues.length > 0) {
            this.data.PropertyValues = null;
            this.sizeChartForm.modified = true;
        }
    };

    resetPropertyValues() {
        if (this.data !== undefined) {
            this.data.PropertyValues = [];
            this.sizeChartForm.modified = true;
        }
    };
}
