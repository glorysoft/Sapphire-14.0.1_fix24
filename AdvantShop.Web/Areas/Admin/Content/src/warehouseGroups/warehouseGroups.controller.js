/* @ngInject */
export default function WarehouseGroupsListCtrl(
    $q,
    uiGridConstants,
    uiGridCustomConfig,
    uiGridCustomParamsConfig,
    uiGridCustomService,
    SweetAlert,
    $translate,
) {
    const ctrl = this;

    ctrl.gridOptions = angular.extend({}, uiGridCustomConfig, {
        columnDefs: [
            {
                name: 'Name',
                displayName: $translate.instant('Admin.Js.WarehouseGroups.Name'),
                enableCellEdit: false,
                cellTemplate: '<div class="ui-grid-cell-contents"><a ng-href="warehouseGroups/edit/{{row.entity.Id}}">{{COL_FIELD}}</a></div>',
                filter: {
                    placeholder: $translate.instant('Admin.Js.WarehouseGroups.Name'),
                    type: uiGridConstants.filter.INPUT,
                    name: 'Name',
                },
            },
            {
                name: 'Warehouses',
                displayName: $translate.instant('Admin.Js.WarehouseGroups.Warehouses'),
                enableCellEdit: false,
                cellTemplate: '<div class="ui-grid-cell-contents"><div>{{COL_FIELD}}</div></div>',
            },
            {
                name: 'Enabled',
                displayName: $translate.instant('Admin.Js.WarehouseGroups.Enabled'),
                enableCellEdit: false,
                cellTemplate: '<ui-grid-custom-switch row="row"></ui-grid-custom-switch>',
                width: 100,
            },
            {
                name: 'SortOrder',
                displayName: $translate.instant('Admin.Js.WarehouseGroups.SortOrder'),
                type: 'number',
                width: 100,
                enableCellEdit: true,
            },
            {
                name: '_serviceColumn',
                displayName: '',
                width: 75,
                enableSorting: false,
                useInSwipeBlock: true,
                cellTemplate:
                    '<div ng-if="!grid.appScope.$ctrl.isMobile" class="ui-grid-cell-contents"><div class="js-grid-not-clicked">' +
                    '<a ng-href="warehouseGroups/edit/{{row.entity.Id}}" class="ui-grid-custom-service-icon fas fa-pencil-alt" aria-label="{{\'Admin.Js.WarehousesList.Edit\' | translate}}"></a>' +
                    '<ui-grid-custom-delete url="warehouseGroups/deleteWarehouseGroup" params="{\'Id\': row.entity.Id}"></ui-grid-custom-delete>' +
                    '</div></div>' +
                    '<ui-grid-custom-delete ng-if="grid.appScope.$ctrl.isMobile" url="warehouseGroups/deleteWarehouseGroup" params="{\'Id\': row.entity.Id}" class="btn btn-sm btn-danger btn--as-swipe-line flex center-xs middle-xs">{{\'Admin.Js.WarehousesList.Delete\' | translate}}</ui-grid-custom-delete>',
            },
        ],
        uiGridCustom: {
            selectionOptions: [
                {
                    text: $translate.instant('Admin.Js.WarehouseGroups.DeleteSelected'),
                    url: 'warehouseGroups/deleteWarehouseGroups',
                    field: 'Id',
                    before () {
                        return SweetAlert.confirm($translate.instant('Admin.Js.GridCustomComponent.AreYouSureDelete'), {
                            title: $translate.instant('Admin.Js.GridCustomComponent.Deleting'),
                            confirmButtonText: $translate.instant('Admin.Js.GridCustomComponent.Confirm'),
                            cancelButtonText: $translate.instant('Admin.Js.GridCustomComponent.Cancel'),
                        }).then((result) => result === true || result.value ? $q.resolve('sweetAlertConfirm') : $q.reject('sweetAlertCancel'));
                    },
                },
            ],
        },
    });

    ctrl.gridOnInit = function (grid) {
        ctrl.grid = grid;
    };
}
