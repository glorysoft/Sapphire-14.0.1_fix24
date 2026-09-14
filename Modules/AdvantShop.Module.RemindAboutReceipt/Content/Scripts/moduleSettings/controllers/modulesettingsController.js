; (function (ng) {

    'use strict';
    
    var RARModuleSettingsCtrl = function ($http, toaster) {
        var ctrl = this;

        ctrl.settings = {};

        ctrl.$onInit = function () {

            ctrl.getSettings();
        };

        ctrl.getSettings = function () {
            $http.get('../module/raradmin/getmodulesettings').then(function success(response) {
                ctrl.settings = response.data;
                ctrl.getSalesFunnelIds();
            });
        };

        ctrl.getSalesFunnelIds = function () {
            $http.get('../module/raradmin/getsalesfunnelids', { params: { remind: true, rnd: Math.random() } })
                .then(function (response) {
                    ctrl.salesFunnelIds = response.data;
                    ctrl.salesFunnelId = { Id: ctrl.settings.SalesFunnelId, Value: "" };
                });
        }

        ctrl.saveChanges = function (form) {
            if (form.$valid) {

                ctrl.settings.SalesFunnelId = ctrl.salesFunnelId.Id;

                $http.post('../module/raradmin/savemodulesettings', {
                    settings: ctrl.settings
                }).then(function success(response) {
                    if (response.data.success === true) {
                        toaster.pop('success', '', 'Изменения сохранены');
                    } else {
                        toaster.pop('error', '', 'Не удалось сохранить изменения');
                    }
                });
            }
            else {
                toaster.pop('error', '', 'Заполните необходимые данные');
            }
        };
    };

    RARModuleSettingsCtrl.$inject = ['$http', 'toaster'];

    ng.module('RARModuleSettings',[])
        .controller('RARModuleSettingsCtrl', RARModuleSettingsCtrl)
        .component('rarModuleSettings', {
            templateUrl: '../modules/RemindAboutReceipt/content/scripts/moduleSettings/templates/moduleSettings.html',
            controller: 'RARModuleSettingsCtrl'
        });

})(window.angular);