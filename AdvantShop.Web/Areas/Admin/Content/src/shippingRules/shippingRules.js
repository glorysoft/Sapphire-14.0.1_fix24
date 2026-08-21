import addEditShippingRuleTemplate from './modal/shippingRules/shippingRules.html';
(function (ng) {
    

    const ShippingRulesCtrl = function (uiGridConstants, uiGridCustomConfig, $q, SweetAlert, $http, toaster, $translate) {
        const ctrl = this,
            columnDefs = [
                {
                    name: 'Name',
                    displayName: $translate.instant('Admin.Js.ShippingRules.Name'),
                    enableCellEdit: true,
                    cellClass: 'word-break',
                    // filter: {
                    //     placeholder: $translate.instant('Admin.Js.ShippingRules.Name'),
                    //     type: uiGridConstants.filter.INPUT,
                    //     name: 'Name',
                    // },
                },
                {
                    name: 'Enabled',
                    displayName: $translate.instant('Admin.Js.ShippingRules.Enabled'),
                    cellTemplate: '<ui-grid-custom-switch row="row"></ui-grid-custom-switch>',
                    width: 100,
                    filter: {
                        name: 'Enabled',
                        placeholder: $translate.instant('Admin.Js.ShippingRules.Enabled'),
                        type: uiGridConstants.filter.SELECT,
                        selectOptions: [
                            { label: $translate.instant('Admin.Js.ShippingRules.Enable'), value: true },
                            { label: $translate.instant('Admin.Js.ShippingRules.Disable'), value: false },
                        ],
                    },
                },
                {
                    name: 'SortOrder',
                    displayName: $translate.instant('Admin.Js.ShippingRules.SortOrder'),
                    enableCellEdit: true,
                    width: 100,
                    type: 'number',
                },
                {
                    name: '_serviceColumn',
                    displayName: '',
                    width: 80,
                    enableSorting: false,
                    useInSwipeBlock: true,
                    cellTemplate:
                        `<div ng-if="!grid.appScope.$ctrl.isMobile" class="ui-grid-cell-contents"><div>` +
                        `<ui-modal-trigger data-controller="'ModalShippingRulesCtrl'" controller-as="ctrl" size="middle" ` +
                        `template-url="${ 
                        addEditShippingRuleTemplate 
                        }" ` +
                        `data-resolve="{'id': row.entity.Id}" ` +
                        `data-on-close="grid.appScope.$ctrl.fetchData()"> ` +
                        `<button type="button" class="btn-icon link-invert ui-grid-custom-service-icon fas fa-pencil-alt" aria-label="Редактировать"></button> ` +
                        `</ui-modal-trigger>` +
                        `<ui-grid-custom-delete url="shippingMethods/deleteRule" params="{'id': row.entity.Id}"></ui-grid-custom-delete>` +
                        `</div></div>` +
                        `<ui-grid-custom-delete ng-if="grid.appScope.$ctrl.isMobile" url="shippingMethods/deleteRule" params="{'id': row.entity.Id}" class="btn btn-sm btn-danger btn--as-swipe-line flex center-xs middle-xs">{{'Admin.Js.Delete'|translate}}</ui-grid-custom-delete>`,
                },
            ];
        ctrl.gridInited = false;

        ctrl.gridOptions = ng.extend({}, uiGridCustomConfig, {
            columnDefs,
            uiGridCustom: {
                selectionOptions: [
                    {
                        text: $translate.instant('Admin.Js.ShippingRules.DeleteSelected'),
                        url: 'shippingMethods/deleteRules',
                        field: 'Id',
                        before () {
                            return SweetAlert.confirm($translate.instant('Admin.Js.AreYouSureDelete'), {
                                title: $translate.instant('Admin.Js.Deleting'),
                            }).then((result) => result === true || result.value ? $q.resolve('sweetAlertConfirm') : $q.reject('sweetAlertCancel'));
                        },
                    },
                    {
                        text: $translate.instant('Admin.Js.ShippingRules.MakeActive'),
                        url: 'shippingMethods/activateRules',
                        field: 'Id',
                    },
                    {
                        text: $translate.instant('Admin.Js.ShippingRules.MakeInactive'),
                        url: 'shippingMethods/disableRules',
                        field: 'Id',
                    },
                ],
            },
        });

        ctrl.gridOnInit = function (grid) {
            ctrl.grid = grid;
            ctrl.gridInited = true;
        };
    };

    ShippingRulesCtrl.$inject = ['uiGridConstants', 'uiGridCustomConfig', '$q', 'SweetAlert', '$http', 'toaster', '$translate'];

    ng.module('shippingRules', ['uiGridCustom', 'urlHelper']).controller('ShippingRulesCtrl', ShippingRulesCtrl);
})(window.angular);
