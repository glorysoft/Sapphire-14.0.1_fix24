; (function (ng) {

    'use strict';
    
    var SmsConfirmationModuleSettingsCtrl = function ($http, $timeout, toaster) {
        var ctrl = this;

        ctrl.$onInit = function () {
            ctrl.getSettings();
        };

        ctrl.getSettings = function () {
            $http.get('../module/smsConfirmationAdmin/getSettings').then(function (response) {
                ctrl.settings = response.data;
                ctrl.updateContentSettings();
            });
        };

        ctrl.updateContentSettings = function () {
            $timeout(function () {
                if (CKEDITOR.instances['smsConfirmationModuleFormContent'] !== null && CKEDITOR.instances['smsConfirmationModuleFormContent'] !== undefined) {
                    CKEDITOR.instances['smsConfirmationModuleFormContent'].setData(ctrl.settings.FormContent);
                }
            }, 2000);
        };

        ctrl.saveSettings = function () {
            $http.post('../module/smsConfirmationAdmin/saveSettings', { settings: ctrl.settings }).then(function (response) {
                if (response.data === true) {
                    toaster.pop('success', '', 'Изменения сохранены');
                } else {
                    toaster.pop('error', '', 'Ошибка при сохранении');
                }
            });
        };
    }

    SmsConfirmationModuleSettingsCtrl.$inject = ['$http', '$timeout', 'toaster'];

    ng.module('SmsConfirmationModuleSettings', [])
        .controller('SmsConfirmationModuleSettingsCtrl', SmsConfirmationModuleSettingsCtrl)
        .component('smsConfirmationModuleSettings', {
            templateUrl: '../modules/SmsConfirmation/content/scripts/moduleSettings/templates/moduleSettings.html',
            controller: 'SmsConfirmationModuleSettingsCtrl'
        });

})(window.angular);