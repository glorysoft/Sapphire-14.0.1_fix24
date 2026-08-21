import './saveVkMarketSettings.html';

(function (ng) {
    

    const ModalSaveVkMarketSettingsCtrl = function ($http, $uibModalInstance, toaster, vkMarketService) {
        const ctrl = this;

        ctrl.$onInit = function () {
            ctrl.YesNo = [
                { label: 'Нет', value: false },
                { label: 'Да', value: true },
            ];
            ctrl.ExportModes = [
                { label: 'Выгружать каждую модификацию и группировать в 1 товар', value: 0 },
                { label: 'Выгружать товары, модификации выводятся как текст в описании', value: 1 },
            ];
            ctrl.getSettings();
        };

        ctrl.close = function () {
            $uibModalInstance.dismiss('cancel');
        };

        ctrl.changeMode = function () {
            if (ctrl.settings.ExportMode == 0) {
                ctrl.settings.AddSizeAndColorInDescription = false;
            } else {
                ctrl.settings.AddSizeAndColorInDescription = true;
            }
        };

        ctrl.getSettings = function () {
            vkMarketService.getExportSettings().then((data) => {
                ctrl.settings = data;
            });
        };

        ctrl.save = function () {
            return vkMarketService.saveExportSettings(ctrl.settings).then((data) => {
                if (data.result === true) {
                    toaster.pop('success', '', 'Настройки сохранены');
                    ctrl.close();
                } else {
                    toaster.pop('error', '', 'Ошибка при сохранении настроек');
                }
            });
        };
    };

    ModalSaveVkMarketSettingsCtrl.$inject = ['$http', '$uibModalInstance', 'toaster', 'vkMarketService'];

    ng.module('uiModal').controller('ModalSaveVkMarketSettingsCtrl', ModalSaveVkMarketSettingsCtrl);
})(window.angular);
