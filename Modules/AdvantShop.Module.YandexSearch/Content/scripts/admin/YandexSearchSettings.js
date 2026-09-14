; (function (ng) {
    'use strict';

    var YandexSearchSettingsCtrl = function ($http, toaster, vkMarketService) {
        var ctrl = this;

        ctrl.$onInit = function () {
            ctrl.getSettings();
        };

        ctrl.getSettings = function () {
            $http.get('../module/yandexSearchSettings/getSettings').then(function (response) {
                ctrl.settings = response.data;
            });
        }

        ctrl.saveSettings = function () {
            $http.post('../module/yandexSearchSettings/saveSettings', ctrl.settings).then(function (response) {
                if (response.data.result === true) {
                    toaster.pop('success', '', 'Настройки сохранены');
                } else {
                    toaster.pop('error', '', 'Ошибка при сохранении настроек');
                }
            });
        }
    };

    YandexSearchSettingsCtrl.$inject = ['$http', 'toaster'];

    ng.module('yandexSearchSettings', [])
        .controller('YandexSearchSettingsCtrl', YandexSearchSettingsCtrl)
        .component('yandexSearchSettings', {
            templateUrl: '../modules/yandexsearch/content/scripts/admin/YandexSearchSettings.html',
            controller: 'YandexSearchSettingsCtrl'
        });

})(window.angular);