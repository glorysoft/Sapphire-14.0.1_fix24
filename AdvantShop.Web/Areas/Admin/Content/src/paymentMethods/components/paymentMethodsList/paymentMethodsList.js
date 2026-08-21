import paymentMethodsListTemplate from './templates/paymentMethodsList.html';
(function (ng) {
    

    const PaymentMethodsListCtrl = function ($http, SweetAlert, toaster, urlHelper, $window, $translate) {
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
            $http
                .get('paymentMethods/getPaymentMethods', {
                    params: {
                        rnd: Math.random(),
                    },
                })
                .then((response) => {
                    ctrl.methods = response.data;
                });
        };
        ctrl.sortableOptions = {
            orderChanged (event) {
                const methodId = event.source.itemScope.item.PaymentMethodId,
                    prev = ctrl.methods[event.dest.index - 1],
                    next = ctrl.methods[event.dest.index + 1];
                $http
                    .post('paymentMethods/changeSorting', {
                        Id: methodId,
                        prevId: prev != null ? prev.PaymentMethodId : null,
                        nextId: next != null ? next.PaymentMethodId : null,
                    })
                    .then((response) => {
                        if (response.data.result === true) {
                            toaster.pop('success', '', $translate.instant('Admin.Js.PaymentMethods.ChangesSaved'));
                        }
                    });
            },
        };
        ctrl.setEnabled = function (methodId, checked) {
            $http
                .post('paymentMethods/setEnabled', {
                    id: methodId,
                    enabled: checked,
                })
                .then((response) => {
                    if (response.data.result === true) {
                        toaster.pop('success', '', $translate.instant('Admin.Js.PaymentMethods.ChangesSaved'));
                    }
                });
        };
        ctrl.deleteMethod = function (methodId) {
            SweetAlert.confirm($translate.instant('Admin.Js.PaymentMethods.AreYouSureDelete'), {
                title: $translate.instant('Admin.Js.PaymentMethods.Deleting'),
            }).then((result) => {
                if (result === true || result.value) {
                    $http
                        .post('paymentMethods/deleteMethod', {
                            methodId,
                        })
                        .then((response) => {
                            if (response.data.result === true) {
                                ctrl.fetch();
                                toaster.pop('success', '', $translate.instant('Admin.Js.PaymentMethods.PaymentMethodsSuccessfullySaved'));
                            }
                        });
                }
            });
        };
    };
    PaymentMethodsListCtrl.$inject = ['$http', 'SweetAlert', 'toaster', 'urlHelper', '$window', '$translate'];
    ng.module('paymentMethodsList', ['as.sortable'])
        .controller('PaymentMethodsListCtrl', PaymentMethodsListCtrl)
        .component('paymentMethodsList', {
            templateUrl: paymentMethodsListTemplate,
            controller: 'PaymentMethodsListCtrl',
            transclude: true,
            bindings: {
                onInit: '&',
            },
        });
})(window.angular);
