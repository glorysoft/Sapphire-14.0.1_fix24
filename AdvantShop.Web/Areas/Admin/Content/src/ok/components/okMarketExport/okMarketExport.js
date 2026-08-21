import okMarketExportTemplate from './okMarketExport.html';
import modalAddEditOkCatalogTemplate from './modals/modalAddEditOkCatalog/modalAddEditOkCatalog.html';
(function (ng) {
    

    const okMarketExportCtrl = function ($http, toaster, uiGridCustomConfig, SweetAlert, $q, $uibModal, $translate, okMarketService) {
        const ctrl = this,
            columnDefs = [
                {
                    name: 'Name',
                    displayName: $translate.instant('Admin.Js.okMarketExport.Grid.Name'),
                    enableSorting: false,
                },
                {
                    name: 'Categories',
                    displayName: $translate.instant('Admin.Js.okMarketExport.Grid.Categories'),
                    enableSorting: false,
                },
                {
                    name: '_serviceColumn',
                    displayName: '',
                    width: 80,
                    enableSorting: false,
                    useInSwipeBlock: true,
                    cellTemplate:
                        '<div ng-if="!grid.appScope.$ctrl.isMobile" class="ui-grid-cell-contents"><div>' +
                        '<button type="button" aria-label="Редактировать" class="btn-icon link-invert ui-grid-custom-service-icon fa fa-pencil-alt" ng-click="grid.appScope.$ctrl.gridExtendCtrl.openModal(row.entity.Id)"></button> ' +
                        '<button type="button" ng-click="grid.appScope.$ctrl.gridExtendCtrl.delete(row.entity.Id, row.entity.OkCatalogId)" class="ui-grid-custom-service-icon fa fa-times link-invert" aria-label="Удалить"></button> ' +
                        '</div></div>' +
                        '<ui-grid-custom-delete ng-if="grid.appScope.$ctrl.isMobile" url="okMarket/deleteCatalog" params="{\'Id\': row.entity.Id,\'OkCatalogId\': row.entity.OkCatalogId}" class="btn btn-sm btn-danger btn--as-swipe-line flex center-xs middle-xs">Удалить</ui-grid-custom-delete>',
                },
            ];
        ctrl.$onInit = function () {
            ctrl.getExportReports();
            ctrl.IsExportRun = false;
            ctrl.getExportState();
            ctrl.isDeleting = false;
            ctrl.getDeleteState();
            if (ctrl.onInit != null) {
                ctrl.onInit({
                    okMarketExport: ctrl,
                });
            }
        };
        ctrl.refresh = function () {
            ctrl.grid.fetchData();
        };
        ctrl.gridOptions = ng.extend({}, uiGridCustomConfig, {
            columnDefs,
            uiGridCustom: {
                rowClick ($event, row) {
                    ctrl.openModal(row.entity.Id);
                },
                selectionOptions: [
                    {
                        text: 'Удалить выделенные',
                        url: 'okMarket/deleteCatalogs',
                        field: 'Id',
                        before () {
                            return SweetAlert.confirm('Вы уверены, что хотите удалить? Каталоги и товары в них будут удалены из OK тоже.', {
                                title: 'Удаление',
                            }).then((result) => {
                                if (result === true || result.value) {
                                    ctrl.isDeleting = true;
                                    setTimeout(() => {
                                        ctrl.getDeleteState();
                                    }, 500);
                                }
                                return result === true || result.value === true ? $q.resolve('sweetAlertConfirm') : $q.reject('sweetAlertCancel');
                            });
                        },
                    },
                ],
            },
        });
        ctrl.gridOnInit = function (grid) {
            ctrl.grid = grid;
        };
        ctrl.openModal = function (id) {
            $uibModal
                .open({
                    bindToController: true,
                    controller: 'ModalAddEditOkCatalogCtrl',
                    controllerAs: 'ctrl',
                    templateUrl: modalAddEditOkCatalogTemplate,
                    resolve: {
                        id () {
                            return id;
                        },
                    },
                })
                .result.then(
                    (result) => {
                        ctrl.grid.fetchData();
                        return result;
                    },
                    (result) => {
                        ctrl.grid.fetchData();
                        return result;
                    },
                );
        };
        ctrl.delete = function (id, OkCatalogId) {
            SweetAlert.confirm('Вы уверены, что хотите удалить? При удалении каталога удалится каталог в ОК и товары в нем.', {
                title: 'Удаление',
            }).then((result) => {
                if (result === true || result.value) {
                    toaster.pop('success', '', 'Удаление каталога и товаров началось');
                    ctrl.grid.isProcessing = true;
                    ctrl.isDeleting = true;
                    setTimeout(() => {
                        ctrl.getDeleteState();
                    }, 500);
                    $http
                        .post('okMarket/deleteCatalog', {
                            Id: id,
                            OkCatalogId,
                        })
                        .then((response) => {
                            if (response.data.result) {
                                ctrl.grid.fetchData();
                                ctrl.grid.isProcessing = false;
                            } else if (response.data.errors) {
                                    response.data.errors.forEach((error) => {
                                        toaster.pop('error', error);
                                    });
                                } else {
                                    toaster.pop('error', '', 'Ошибка при удалении');
                                }
                        });
                }
            });
        };
        ctrl.export = function () {
            okMarketService.export().then((data) => {
                if (data.result === true) {
                    toaster.pop('success', '', $translate.instant('Admin.Js.OkChannel.ExportStarted'));
                    ctrl.IsExportRun = true;
                    ctrl.grid.isProcessing = true;
                    ctrl.getExportProgress();
                    ctrl.getExportReportsTimeout();
                } else {
                    data.errors.forEach((e) => {
                        toaster.pop('error', '', e);
                    });
                }
            });
        };
        ctrl.getExportProgress = function () {
            return okMarketService.getExportProgress().then((data) => {
                ctrl.Total = data.Total;
                ctrl.Current = data.Current;
                ctrl.Percent = ctrl.Total > 0 ? parseInt((100 / ctrl.Total) * ctrl.Current) : 0;
                ctrl.IsExportRun = data.IsRun;
                if (ctrl.grid != null) {
                    ctrl.grid.isProcessing = data.IsRun;
                }
                if (!ctrl.IsExportRun && ctrl.Total > 0) {
                    toaster.pop('success', '', 'Экспорт закончен');
                } else {
                    setTimeout(() => {
                        ctrl.getExportProgress();
                    }, 500);
                }
            });
        };
        ctrl.getExportState = function () {
            okMarketService.getExportState().then((data) => {
                ctrl.IsExportRun = data.isRun;
                if (ctrl.IsExportRun) ctrl.getExportProgress();
            });
        };
        ctrl.getExportReportsTimeout = function () {
            setTimeout(() => {
                ctrl.getExportReports().then(() => {
                    if (ctrl.Percent != 100) {
                        ctrl.getExportReportsTimeout();
                    }
                });
            }, 3000);
        };
        ctrl.getExportReports = function () {
            return okMarketService.getExportReports().then((data) => {
                ctrl.ExportReports = data.reports;
            });
        };
        ctrl.getDeleteState = function () {
            return okMarketService.getDeleteState().then((data) => {
                ctrl.isDeleting = data.isRun;
                if (ctrl.grid != null) {
                    ctrl.grid.isProcessing = data.isRun;
                }
                if (ctrl.isDeleting) {
                    setTimeout(() => {
                        ctrl.getDeleteState();
                    }, 500);
                } else if (ctrl.grid != null) {
                    ctrl.grid.fetchData();
                }
            });
        };
    };
    okMarketExportCtrl.$inject = ['$http', 'toaster', 'uiGridCustomConfig', 'SweetAlert', '$q', '$uibModal', '$translate', 'okMarketService'];
    ng.module('okMarketExport', ['uiGridCustom'])
        .controller('okMarketExportCtrl', okMarketExportCtrl)
        .component('okMarketExport', {
            templateUrl: okMarketExportTemplate,
            controller: 'okMarketExportCtrl',
            bindings: {
                onInit: '&',
            },
        });
})(window.angular);
