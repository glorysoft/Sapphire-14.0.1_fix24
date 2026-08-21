(function (ng) {


    const LpSettingsTriggerCtrl = function ($controller, $window, $http, $translate, toaster, modalService) {
        const ctrl = this;

        ctrl.showModal = function (lpId) {
            modalService.renderModal(
                'lpSettings',
                $translate.instant('Admin.Js.Landings.BlocksConstructor.Controllers.LpSettingsTrigger.GeneralSettings'),
                '<div ng-include="\'areas/landing/frontend/_common/lp-settings/templates/lp-settings.html\'"></div>',
                '<div><button type="button" class="blocks-constructor-btn-confirm" ng-click="lpSettings.saveSettings()">{{\'Admin.Js.Landings.BlocksConstructor.Controllers.LpSettingsTrigger.Save\'|translate}}</button><button type="button"  class="blocks-constructor-btn-cancel blocks-constructor-btn-mar" data-modal-close="" data-modal-close-callback="modal.close()">{{\'Admin.Js.Landings.BlocksConstructor.Controllers.LpSettingsTrigger.Cancel\'|translate}}</button></div>',
                {
                    modalClass: 'lp-settings-modal',
                    modalOverlayClass: 'lp-settings-modal-overlay',
                    isFloating: true,
                    backgroundEnable: false,
                    callbackClose: 'lpSettings.callbackClose()',
                },
                { lpId, lpSettings: $controller('LpSettingsCtrl') },
            );

            modalService.getModal('lpSettings').then((modal) => {
                modal.modalScope.open();
            });
        };
    };

    ng.module('lpSettings').controller('LpSettingsTriggerCtrl', LpSettingsTriggerCtrl);

    LpSettingsTriggerCtrl.$inject = ['$controller', '$window', '$http', '$translate', 'toaster', 'modalService'];
})(window.angular);
