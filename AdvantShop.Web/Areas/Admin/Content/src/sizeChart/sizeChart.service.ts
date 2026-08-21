import { IHttpService, IPromise, translate } from 'angular';
import { isResponseError, type Response } from '../../../../../scripts/@types/http';
import { ISizeChartModel, IProperty, IPropertyValue } from './sizeChart.types';

export interface ISizeChartService {
    delete(id: number): IPromise<Response>;

    getSizeChart(id: number): IPromise<ISizeChartModel>;

    add(data: ISizeChartModel): IPromise<Response>;

    update(data: ISizeChartModel): IPromise<Response>;

    getProperties(): IPromise<IProperty[]>;

    getPropertyValues(propertyId: number): IPromise<IPropertyValue[]>;
}

export default class SizeChartService implements ISizeChartService {
    /* @ngInject */
    constructor(
        readonly $http: IHttpService,
        readonly $translate: translate.ITranslateService,
    ) {
    }

    delete(id: number) {
        return this.$http.post<Response>('sizeChart/delete', { Id: id })
            .then((response) => {
                if (response.status === 200) {
                    return response.data;
                }
                throw new Error(this.$translate.instant('Js.DeletingError'));
            });
    };

    getSizeChart(id: number) {
        return this.$http.get<Response<ISizeChartModel>>('sizeChart/get', { params: { id } })
            .then((response) => {
                if (response.status === 200 && !isResponseError(response.data) && response.data.obj !== undefined) {
                    return response.data.obj;
                }
                throw new Error(this.$translate.instant('Admin.Js.SizeChart.DataError'));
            });
    };

    add(data: ISizeChartModel) {
        return this.$http.post<Response>('sizeChart/add', { model: data })
            .then((response) => {
                if (response.status === 200) {
                    return response.data;
                }
                throw new Error(this.$translate.instant('Admin.Js.SizeChart.AddError'));
            });
    };

    update(data: ISizeChartModel) {
        return this.$http.post<Response>('sizeChart/update', { model: data })
            .then((response) => {
                if (response.status === 200) {
                    return response.data;
                }
                throw new Error(this.$translate.instant('Admin.Js.SizeChart.UpdateError'));
            });
    };

    getProperties() {
        return this.$http.get<IProperty[]>('sizeChart/getProperties')
            .then((response) => {
                if (response.status === 200) {
                    return response.data;
                }
                throw new Error(this.$translate.instant('Admin.Js.SizeChart.DataError'));
            });
    };

    getPropertyValues(propertyId: number) {
        return this.$http
            .get<IPropertyValue[]>('sizeChart/getPropertyValues', {
                params: {
                    propertyId,
                },
            })
            .then((response) => {
                if (response.status === 200) {
                    return response.data;
                }
                throw new Error(this.$translate.instant('Admin.Js.SizeChart.DataError'));
            });
    };
}
