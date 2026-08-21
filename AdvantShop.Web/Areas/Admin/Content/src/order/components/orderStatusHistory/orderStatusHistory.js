import orderStatusHistoryTemplate from './orderStatusHistory.html';
(function (ng) {
    

    const OrderStatusHistoryCtrl = function ($http, uiGridCustomConfig, $translate) {
        const ctrl = this;
        ctrl.$onInit = function () {
            if (ctrl.onInit != null) {
                ctrl.onInit({
                    orderStatusHistory: ctrl,
                });
            }
        };
        ctrl.gridOptions = ng.extend({}, uiGridCustomConfig, {
            columnDefs: [
                {
                    name: 'Date',
                    displayName: $translate.instant('Admin.Js.Order.Date'),
                    enableCellEdit: false,
                    enableSorting: false,
                },
                {
                    name: 'PreviousStatus',
                    displayName: $translate.instant('Admin.Js.Order.PreviousStatus'),
                    enableCellEdit: false,
                    enableSorting: false,
                },
                {
                    name: 'NewStatus',
                    displayName: $translate.instant('Admin.Js.Order.NewStatus'),
                    enableCellEdit: false,
                    enableSorting: false,
                },
                {
                    name: 'CustomerName',
                    displayName: $translate.instant('Admin.Js.Order.UserChangedStatus'),
                    enableCellEdit: false,
                    enableSorting: false,
                },
                {
                    name: 'Basis',
                    displayName: $translate.instant('Admin.Js.Order.Base'),
                    enableCellEdit: false,
                    enableSorting: false,
                },
            ],
        });
        ctrl.gridOnInit = function (grid) {
            ctrl.statuses = grid;
        };
        ctrl.update = function () {
            ctrl.statuses.fetchData();
        };
    };
    OrderStatusHistoryCtrl.$inject = ['$http', 'uiGridCustomConfig', '$translate'];
    ng.module('orderStatusHistory', ['uiGridCustom'])
        .controller('OrderStatusHistoryCtrl', OrderStatusHistoryCtrl)
        .component('orderStatusHistory', {
            templateUrl: orderStatusHistoryTemplate,
            controller: OrderStatusHistoryCtrl,
            bindings: {
                orderId: '<?',
                onInit: '&',
            },
        });
})(window.angular);
