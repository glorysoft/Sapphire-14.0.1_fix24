import addEditTemplateTemplate from './modal/addEditTemplate/addEditTemplate.html';
(function (ng) {
    

    const SettingsTemplatesDocxCtrl = function ($uibModal, $http, $q, uiGridConstants, uiGridCustomConfig, SweetAlert, $translate, toaster) {
        const ctrl = this;
        ctrl.gridTemplatesInited = false;
        const columnDefsTemplates = [
            {
                name: 'Name',
                displayName: $translate.instant('Admin.Js.SettingsTemplatesDocx.SettingsTemplatesDocx.Name'),
                cellTemplate: '<div class="ui-grid-cell-contents"><span class="link">{{COL_FIELD}}</span></div>',
                enableCellEdit: true,
            },
            {
                name: 'TaxTypeFormatted',
                displayName: $translate.instant('Admin.Js.SettingsTemplatesDocx.SettingsTemplatesDocx.Type'),
                enableCellEdit: false,
                width: 200,
                filter: {
                    placeholder: $translate.instant('Admin.Js.SettingsTemplatesDocx.SettingsTemplatesDocx.Type'),
                    type: uiGridConstants.filter.SELECT,
                    name: 'Type',
                    fetch: 'settingsTemplatesDocx/getTemplateTypes',
                },
            },
            {
                name: 'SortOrder',
                displayName: $translate.instant('Admin.Js.SettingsTemplatesDocx.SettingsTemplatesDocx.Sort'),
                enableCellEdit: true,
            },
            {
                name: 'FileSizeFormatted',
                displayName: $translate.instant('Admin.Js.SettingsTemplatesDocx.SettingsTemplatesDocx.FileSize'),
                enableCellEdit: false,
                width: 200,
            },
            {
                name: 'DateModifiedFormatted',
                displayName: $translate.instant('Admin.Js.SettingsTemplatesDocx.SettingsTemplatesDocx.DateModified'),
                width: 150,
            },
            {
                name: 'Файл',
                displayName: $translate.instant('Admin.Js.SettingsTemplatesDocx.SettingsTemplatesDocx.FileSize'),
                cellTemplate:
                    '<div class="ui-grid-cell-contents">' +
                    '<a href="" ng-href="{{row.entity.PathAdmin}}">{{\'Admin.Js.SettingsTemplatesDocx.SettingsTemplatesDocx.DownloadFile\'|translate}}</a>' +
                    '</div>',
                enableCellEdit: false,
                enableSorting: false,
                width: 100,
            },
            {
                name: '_serviceColumn',
                displayName: '',
                enableSorting: false,
                useInSwipeBlock: true,
                width: 80,
                cellTemplate:
                    '<div ng-if="!grid.appScope.$ctrl.isMobile" class="ui-grid-cell-contents js-grid-not-clicked"><div>' +
                    '<button type="button" class="btn-icon link-invert ui-grid-custom-service-icon fas fa-pencil-alt" ng-click="grid.appScope.$ctrl.gridExtendCtrl.loadTemplate(row.entity.Id)"></button> ' +
                    '<button type="button" ng-click="grid.appScope.$ctrl.gridExtendCtrl.deleteTemplate(row.entity.Id)" class="btn-icon ui-grid-custom-service-icon fa fa-times link-invert" aria-label="Удалить"></button> ' +
                    '</div></div>' +
                    '<ui-grid-custom-delete ng-if="grid.appScope.$ctrl.isMobile" url="settingsTemplatesDocx/deleteTemplate" params="{\'id\': row.entity.Id}" class="btn btn-sm btn-danger btn--as-swipe-line flex center-xs middle-xs">{{\'Admin.Js.Delete\'|translate}}</ui-grid-custom-delete>',
            },
        ];
        ctrl.gridTemplatesOptions = ng.extend({}, uiGridCustomConfig, {
            columnDefs: columnDefsTemplates,
            uiGridCustom: {
                rowClick ($event, row) {
                    ctrl.loadTemplate(row.entity.Id);
                },
                selectionOptions: [
                    {
                        text: $translate.instant('Admin.Js.SettingsTemplatesDocx.SettingsTemplatesDocx.DeleteSelected'),
                        url: 'settingsTemplatesDocx/deleteTemplates',
                        field: 'Id',
                        before () {
                            return SweetAlert.confirm($translate.instant('Admin.Js.AreYouSureDelete'), {
                                title: $translate.instant('Admin.Js.Deleting'),
                            }).then((result) => {
                                if (result === true || result.value === true) {
                                    return $q.resolve('sweetAlertConfirm');
                                } 
                                    $q.reject('sweetAlertCancel');
                                
                            });
                        },
                    },
                ],
            },
        });
        ctrl.gridTemplatesOnInit = function (grid) {
            ctrl.gridTemplates = grid;
            ctrl.gridTemplatesInited = true;
        };
        ctrl.gridTemplatesUpdate = function () {
            ctrl.gridTemplates.fetchData();
        };
        ctrl.loadTemplate = function (id) {
            $uibModal
                .open({
                    bindToController: true,
                    controller: 'ModalAddEditTemplateCtrl',
                    controllerAs: 'ctrl',
                    templateUrl: addEditTemplateTemplate,
                    resolve: {
                        params: {
                            id,
                        },
                    },
                })
                .result.then(
                    (result) => {
                        ctrl.gridTemplates.fetchData();
                        return result;
                    },
                    (result) => result,
                );
        };
        ctrl.deleteTemplate = function (id) {
            SweetAlert.confirm('Вы уверены, что хотите удалить?', {
                title: 'Удаление',
            }).then((result) => {
                if (result === true || result.value === true) {
                    $http
                        .post('settingsTemplatesDocx/deleteTemplate', {
                            id,
                        })
                        .then((response) => {
                            ctrl.gridTemplates.fetchData();
                        });
                }
            });
        };
    };
    SettingsTemplatesDocxCtrl.$inject = ['$uibModal', '$http', '$q', 'uiGridConstants', 'uiGridCustomConfig', 'SweetAlert', '$translate', 'toaster'];
    ng.module('settingsTemplatesDocx', ['uiGridCustom', 'fileUploader', 'ngFileUpload']).controller(
        'SettingsTemplatesDocxCtrl',
        SettingsTemplatesDocxCtrl,
    );
})(window.angular);
