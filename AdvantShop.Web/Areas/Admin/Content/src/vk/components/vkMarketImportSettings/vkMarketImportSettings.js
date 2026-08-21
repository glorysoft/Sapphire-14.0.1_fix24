import vkMarketImportSettingsTemplate from './vkMarketImportSettings.html';
(function (ng) {
    

    const vkMarketImportSettingsCtrl = function (toaster, vkMarketService) {
        const ctrl = this;
        ctrl.$onInit = function () {
            ctrl.settings = {};
            ctrl.settings.createImVkRelations = true;
        };
        ctrl.import = function () {
            ctrl.hideImportBtn = true;
            vkMarketService.import(ctrl.settings).then((data) => {
                if (data.result === true) {
                    toaster.pop('success', '', 'Импорт товаров начался');
                    setTimeout(() => {
                        ctrl.getImportProgress();
                    }, 500);
                } else {
                    data.errors.forEach((e) => {
                        toaster.pop('error', '', e);
                    });
                    ctrl.hideImportBtn = false;
                }
            });
        };
        ctrl.getImportProgress = function () {
            vkMarketService.getImportProgress().then((data) => {
                ctrl.Total = data.Total;
                ctrl.Current = data.Current;
                ctrl.Percent = ctrl.Total > 0 ? parseInt((100 / ctrl.Total) * ctrl.Current) : 0;
                if (ctrl.Current === ctrl.Total && ctrl.Total > 0) {
                    toaster.pop('success', '', 'Импорт товаров закончен');
                    setTimeout(() => {
                        window.location.reload();
                    }, 500);
                } else {
                    setTimeout(() => {
                        ctrl.getImportProgress();
                    }, 500);
                }
            });
        };
    };
    vkMarketImportSettingsCtrl.$inject = ['toaster', 'vkMarketService'];
    ng.module('vkMarketImportSettings', [])
        .controller('vkMarketImportSettingsCtrl', vkMarketImportSettingsCtrl)
        .component('vkMarketImportSettings', {
            templateUrl: vkMarketImportSettingsTemplate,
            controller: 'vkMarketImportSettingsCtrl',
            bindings: {
                onUpdate: '&',
            },
        });
})(window.angular);
