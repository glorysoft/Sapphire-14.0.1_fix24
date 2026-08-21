import addEditPhotoCategoryTemplate from './modal/addEditPhotoCategory/addEditPhotoCategory.html';
(function (ng) {
    

    const PhotoCategoryCtrl = function (uiGridConstants, uiGridCustomConfig, toaster, SweetAlert, $http, $q, $translate) {
        const ctrl = this,
            columnDefs = [
                {
                    name: 'Name',
                    displayName: $translate.instant('Admin.Js.PhotoCategory.Grid.Name'),
                    enableCellEdit: true,
                    filter: {
                        placeholder: $translate.instant('Admin.Js.PhotoCategory.Grid.Name'),
                        type: uiGridConstants.filter.INPUT,
                        name: 'Name',
                    },
                },
                {
                    name: 'SortOrder',
                    displayName: $translate.instant('Admin.Js.PhotoCategory.Grid.Order'),
                    width: 100,
                    enableCellEdit: true,
                },
                {
                    name: 'Enabled',
                    displayName: $translate.instant('Admin.Js.PhotoCategory.Grid.Activity'),
                    enableCellEdit: false,
                    cellTemplate: '<ui-grid-custom-switch row="row"></ui-grid-custom-switch>',
                    width: 100,
                    filter: {
                        placeholder: $translate.instant('Admin.Js.PhotoCategory.Grid.Activity'),
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
                    cellTemplate:
                        `<div ng-if="!grid.appScope.$ctrl.isMobile" class="ui-grid-cell-contents"><div>` +
                        `<ui-modal-trigger data-controller="'ModalAddEditPhotoCategoryCtrl'" controller-as="ctrl" ` +
                        `template-url="${ 
                        addEditPhotoCategoryTemplate 
                        }" ` +
                        `data-resolve="{'Id': row.entity.Id}" ` +
                        `data-on-close="grid.appScope.$ctrl.fetchData()"> ` +
                        `<button type="button" class="btn-icon link-invert ui-grid-custom-service-icon fas fa-pencil-alt" aria-label="Редактировать"></button> ` +
                        `</ui-modal-trigger>` +
                        `<ui-grid-custom-delete url="photoCategory/delete" params="{'id': row.entity.Id}" ` +
                        `confirm-text="${ 
                        $translate.instant('Admin.Js.PhotoCategory.Grid.SureWantDelete') 
                        }"></ui-grid-custom-delete>` +
                        `</div></div>` +
                        `<ui-grid-custom-delete ng-if="grid.appScope.$ctrl.isMobile" url="photoCategory/delete" params="{'id': row.entity.Id}" class="btn btn-sm btn-danger btn--as-swipe-line flex center-xs middle-xs">{{'Admin.Js.AddEdit.Delete'|translate}}</ui-grid-custom-delete>`,
                },
            ];

        ctrl.gridOptions = ng.extend({}, uiGridCustomConfig, {
            columnDefs,
            uiGridCustom: {
                selectionOptions: [
                    {
                        text: $translate.instant('Admin.Js.Colors.DeleteSelected'),
                        url: 'photoCategory/deletephotoCategories',
                        field: 'Id',
                        before () {
                            return SweetAlert.confirm($translate.instant('Admin.Js.AreYouSureDelete'), {
                                title: $translate.instant('Admin.Js.News.Deleting'),
                                cancelButtonText: $translate.instant('Admin.Js.Cancel'),
                            }).then((result) => result === true || result.value ? $q.resolve('sweetAlertConfirm') : $q.reject('sweetAlertCancel'));
                        },
                    },
                ],
            },
        });

        ctrl.gridOnInit = function (grid) {
            ctrl.grid = grid;
        };

        ctrl.delete = function (id) {
            SweetAlert.confirm($translate.instant('Admin.Js.AreYouSureDelete'), {
                title: $translate.instant('Admin.Js.Deleting'),
            }).then((result) => {
                if (result === true || result.value) {
                    $http.post('photoCategory/delete', { Id: id }).then((response) => {
                        ctrl.grid.fetchData();
                    });
                }
            });
        };
    };

    PhotoCategoryCtrl.$inject = ['uiGridConstants', 'uiGridCustomConfig', 'toaster', 'SweetAlert', '$http', '$q', '$translate'];

    ng.module('photoCategory', ['uiGridCustom', 'urlHelper']).controller('PhotoCategoryCtrl', PhotoCategoryCtrl);
})(window.angular);
