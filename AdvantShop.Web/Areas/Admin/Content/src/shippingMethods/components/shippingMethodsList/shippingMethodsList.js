import shippingMethodsListTemplate from './templates/shippingMethodsList.html';
(function (ng) {
    

    const ShippingMethodsListCtrl = function ($http, toaster, SweetAlert, $translate) {
        const ctrl = this;
        ctrl.$onInit = function () {
            ctrl.fetch();
            if (ctrl.onInit != null) {
                ctrl.onInit({
                    methods: ctrl,
                });
            }
        };
        ctrl.fetch = function () {
            $http.get('ShippingMethods/getShippingMethods').then((response) => {
                ctrl.methods = response.data;
            });
        };
        ctrl.sortableOptions = {
            orderChanged (event) {
                const methodId = event.source.itemScope.item.ShippingMethodId,
                    prev = ctrl.methods[event.dest.index - 1],
                    next = ctrl.methods[event.dest.index + 1];
                $http
                    .post('shippingMethods/changeSorting', {
                        Id: methodId,
                        prevId: prev != null ? prev.ShippingMethodId : null,
                        nextId: next != null ? next.ShippingMethodId : null,
                    })
                    .then((response) => {
                        if (response.data.result === true) {
                            toaster.pop('success', '', $translate.instant('Admin.Js.ShippingMethods.List.ChangesSaved'));
                        }
                    });
            },
        };
        ctrl.setEnabled = function (methodId, checked) {
            $http
                .post('shippingMethods/setEnabled', {
                    id: methodId,
                    enabled: checked,
                })
                .then((response) => {
                    if (response.data.result === true) {
                        toaster.pop('success', '', $translate.instant('Admin.Js.ShippingMethods.List.ChangesSaved'));
                    }
                });
        };
        ctrl.deleteMethod = function (methodId) {
            SweetAlert.confirm($translate.instant('Admin.Js.ShippingMethods.List.AreYouSureDelete'), {
                title: $translate.instant('Admin.Js.ShippingMethods.List.Deleting'),
            }).then((result) => {
                if (result === true || result.value) {
                    $http
                        .post('shippingMethods/deleteMethod', {
                            methodId,
                        })
                        .then((response) => {
                            if (response.data.result === true) {
                                ctrl.fetch();
                                toaster.pop('success', '', $translate.instant('Admin.Js.ShipingMethods.DeliveryMethodDeleted'));
                            }
                        });
                }
            });
        };
    };
    ShippingMethodsListCtrl.$inject = ['$http', 'toaster', 'SweetAlert', '$translate'];
    ng.module('shippingMethodsList', ['as.sortable'])
        .controller('ShippingMethodsListCtrl', ShippingMethodsListCtrl)
        .component('shippingMethodsList', {
            templateUrl: shippingMethodsListTemplate,
            controller: 'ShippingMethodsListCtrl',
            transclude: true,
            bindings: {
                onInit: '&',
            },
        });
})(window.angular);
