; (function (ng) {
    'use strict';

    var ShippingPaymentPageSettingsCtrl = function ($http, toaster, $window) {
        var ctrl = this;

        ctrl.$onInit = function () {
            ctrl.getSettings().then(function (result) {
                if (result) {
                    ctrl.btnSave = false;
                }
            });
        };

        ctrl.getSettings = function () {
            return $http.get('../module/ShippingPaymentPageAdmin/GetSettings').then(function (response) {
                var data = response.data;
                if (data.result === true) {
                    ctrl.settings = data.obj;
                    ctrl.btnSave = false;
                } else {
                    if (data.errors) {
                        data.errors.forEach(function (error) {
                            toaster.pop('error', error);
                        });
                    } else {
                        toaster.pop("error", "Не удалось получить настройки");
                    }
                }
                return response.data.result;
            });
        };

        ctrl.saveSettings = function () {
            return $http.post("../module/ShippingPaymentPageAdmin/SaveSettings", ctrl.settings).then(function (response) {
                var data = response.data;
                if (data.result === true) {
                    toaster.pop('success', '', 'Настройки сохранены');
                    ctrl.getSettings().then(function (result) {
                        if (result) {
                            ctrl.btnSave = false;
                        };
                    });
                } else {
                    data.errors.forEach(function (e) {
                        toaster.pop('error', '', e);
                    });
                    ctrl.btnSave = false;
                }
                return response.data.result;
            });
        };

        ctrl.goToModulePage = function () {
            $window.open(ctrl.settings.ModuleUrl);
        }
    };

    ShippingPaymentPageSettingsCtrl.$inject = ['$http', 'toaster', '$window'];

    ng.module('ShippingPaymentPageSettings', [])
        .controller('ShippingPaymentPageSettingsCtrl', ShippingPaymentPageSettingsCtrl)
        .component('shippingPaymentPageSettings', {
            templateUrl: '../modules/ShippingPaymentPage/scripts/admin/ShippingPaymentPageSettings/ShippingPaymentPageSettings.html',
            controller: 'ShippingPaymentPageSettingsCtrl'
        });

})(window.angular);