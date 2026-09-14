; (function (ng) {

    'use strict';
    
    var RADModuleSettingsCtrl = function ($http, toaster, SweetAlert) {
        var ctrl = this;

        ctrl.settings = {};

        ctrl.$onInit = function () {
            ctrl.getSettings();
        };

        ctrl.getSettings = function () {
            $http.get('../module/raradmin/getmoduleradsettings').then(function success(response) {
                ctrl.settings = response.data;
                ctrl.getSalesFunnelIds();
            });
        };

        ctrl.getSalesFunnelIds = function () {
            $http.get('../module/raradmin/getsalesfunnelids', { params: { remind: false, rnd: Math.random() } })
                .then(function (response) {
                    ctrl.salesFunnelIds = response.data;
                    ctrl.salesFunnelId = { Id: ctrl.settings.SalesFunnelId, Value: "" };
                });
        }

        ctrl.saveChanges = function (form) {
            if (form.$valid) {

                ctrl.settings.SalesFunnelId = ctrl.salesFunnelId.Id;

                $http.post('../module/raradmin/savemoduleradsettings', {
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

        ctrl.selectImage = function ($file) {
            if ($file === null) return false;
            var fData = new FormData();
            fData.append("imageFile", $file);
            var req = {
                method: 'POST',
                url: '../module/raradmin/radUploadImage',
                headers: {
                    'Content-Type': undefined
                },
                data: fData
            };

            $http(req).then(function success(response) {
                if (!response.data.success) {
                    toaster.pop('error', '', response.data.msg);
                    return false;
                }

                ctrl.settings.ImagePath = response.data.newImagePath;

                toaster.pop('success', '', response.data.msg);
                return true;
            });
        };

        ctrl.deleteImage = function () {
            SweetAlert.confirm("Вы уверены, что хотите удалить изображение?", { title: "Удаление изображения" }).then(function (result) {
                if (result === true || result.value) {
                    $http.post('../module/raradmin/radDeleteimage', { iamgeName: ctrl.imagePath })
                        .then(function success(response) {
                            if (response.data.success) {
                                toaster.pop('success', '', response.data.msg);
                                ctrl.settings.ImagePath = response.data.newImagePath;
                            } else {
                                toaster.pop('error', '', response.data.msg);
                            }
                        });
                }
            });
        };
    };

    RADModuleSettingsCtrl.$inject = ['$http', 'toaster', 'SweetAlert'];

    ng.module('RADModuleSettings', [])
        .controller('RADModuleSettingsCtrl', RADModuleSettingsCtrl)
        .component('radModuleSettings', {
            templateUrl: '../modules/RemindAboutReceipt/content/scripts/radModuleSettings/templates/radModuleSettings.html',
            controller: 'RADModuleSettingsCtrl'
        });

})(window.angular);