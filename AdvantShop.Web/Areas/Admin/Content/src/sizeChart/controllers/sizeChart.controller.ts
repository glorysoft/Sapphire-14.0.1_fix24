import { IToasterService } from 'ngtoaster';
import { IHttpService, type IQService, translate } from 'angular';
import addEditSizeChartTemplate from '../templates/addEditSizeChart.modal.template.html';
import { ISizeChartService } from '../sizeChart.service';
import { isResponseError, type Response } from '../../../../../../scripts/@types/http';

export interface ISizeChartCtrl {
    columnDefs: any;
    grid: any;
    gridOptions: any;

    gridOnInit(grid: any): void;

    delete(id: number): void;
}

export default class SizeChartController implements ISizeChartCtrl {
    columnDefs: any;
    grid: any;
    gridOptions: any;

    /* @ngInject */
    constructor(
        readonly sizeChartService: ISizeChartService,
        readonly uiGridConstants: any,
        readonly uiGridCustomConfig: any,
        readonly toaster: IToasterService,
        readonly SweetAlert: any,
        readonly $q: IQService,
        readonly $http: IHttpService,
        readonly $translate: translate.ITranslateService,
    ) {
        this.columnDefs = [
            {
                name: 'Name',
                displayName: $translate.instant('Admin.Js.SizeChart.Name'),
                enableCellEdit: true,
                filter: {
                    placeholder: $translate.instant('Admin.Js.SizeChart.Name'),
                    type: uiGridConstants.filter.INPUT,
                    name: 'Name',
                },
            },
            {
                name: 'LinkText',
                displayName: $translate.instant('Admin.Js.SizeChart.LinkText'),
                enableCellEdit: true,
                filter: {
                    placeholder: $translate.instant('Admin.Js.SizeChart.LinkText'),
                    type: uiGridConstants.filter.INPUT,
                    name: 'LinkText',
                },
            },
            {
                name: 'SortOrder',
                displayName: $translate.instant('Admin.Js.SizeChart.SortOrder'),
                width: 100,
                enableCellEdit: true,
            },
            {
                name: 'Enabled',
                displayName: $translate.instant('Admin.Js.SizeChart.Enabled'),
                enableCellEdit: false,
                cellTemplate: '<ui-grid-custom-switch row="row"></ui-grid-custom-switch>',
                width: 100,
                filter: {
                    placeholder: $translate.instant('Admin.Js.SizeChart.Enabled'),
                    type: uiGridConstants.filter.SELECT,
                    name: 'Enabled',
                    selectOptions: [
                        {
                            label: $translate.instant('Admin.Js.News.Yes'),
                            value: true,
                        },
                        {
                            label: $translate.instant('Admin.Js.News.No'),
                            value: false,
                        },
                    ],
                },
            },
            {
                name: '_serviceColumn',
                displayName: '',
                width: 80,
                useInSwipeBlock: true,
                cellTemplate: `<div data-ng-if="!grid.appScope.$ctrl.isMobile"
                          class="ui-grid-cell-contents">
                        <div>
                            <ui-modal-trigger data-controller="'ModalAddEditSizeChartCtrl'"
                                              controller-as="ctrl"
                                              size="xs-6"
                                              template-url="${addEditSizeChartTemplate}"
                                              data-resolve="{params: {id: row.entity.Id}}"
                                              data-on-close="grid.appScope.$ctrl.fetchData()">
                                <button type="button"
                                        class="btn-icon link-invert ui-grid-custom-service-icon fas fa-pencil-alt"
                                        aria-label="Редактировать">
                                </button>
                            </ui-modal-trigger>
                            <ui-grid-custom-delete url="sizeChart/delete"
                                                   params="{'id': row.entity.Id}"
                                                   confirm-text="Вы уверены что хотите удалить?"/>
                        </div>
                    </div>
                    <ui-grid-custom-delete ng-if="grid.appScope.$ctrl.isMobile"
                                           url="sizeChart/delete"
                                           params="{ 'id': row.entity.Id }"
                                           class="btn btn-sm btn-danger btn--as-swipe-line flex center-xs middle-xs">
                        Удалить
                    </ui-grid-custom-delete>`,
            },
            {
                name: '_noopColumnSourceType',
                visible: false,
                filter: {
                    placeholder: $translate.instant('Admin.Js.SizeChart.SourceType'),
                    type: uiGridConstants.filter.SELECT,
                    name: 'SourceType',
                    fetch: 'sizeChart/getSourceTypes',
                },
            },
        ];

        this.gridOptions = angular.extend({}, this.uiGridCustomConfig, {
            columnDefs: this.columnDefs,
            uiGridCustom: {
                selectionOptions: [
                    {
                        text: $translate.instant('Admin.Js.Colors.DeleteSelected'),
                        url: 'sizeChart/deleteSizeCharts',
                        field: 'Id',
                        before: () => SweetAlert.confirm($translate.instant('Admin.Js.AreYouSureDelete'), {
                                title: $translate.instant('Admin.Js.Deleting'),
                            }).then((result: any) => result === true || result.value ? $q.resolve('sweetAlertConfirm') : $q.reject('sweetAlertCancel')),
                    },
                ],
            },
        });
    }

    gridOnInit(grid: any) {
        this.grid = grid;
    };

    delete(id: number) {
        this.SweetAlert.confirm(this.$translate.instant('Admin.Js.AreYouSureDelete'), { title: this.$translate.instant('Admin.Js.Deleting') }).then(
            (result: any) => {
                if (result === true || result.value) {
                    this.sizeChartService
                        .delete(id)
                        .then((response: Response) => {
                            if (isResponseError(response)) {
                                response.errors.forEach((error: string) => {
                                    this.toaster.pop('error', '', error);
                                });
                            }
                        })
                        .catch((error: Error) => this.toaster.pop('error', '', error.message))
                        .finally(() => this.grid.fetchData());
                }
            },
        );
    };
}
