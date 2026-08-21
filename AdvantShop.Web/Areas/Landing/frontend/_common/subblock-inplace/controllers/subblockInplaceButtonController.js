(function (ng) {
    

    const SubblockInplaceButtonCtrl = function ($window, subblockInplaceService) {
        const ctrl = this;

        ctrl.modalSettingsBlockData = {
            data: {
                modalData: {},
            },
            backup: {},
        };

        ctrl.showModal = function (modalId) {
            ctrl.modalSettingsBlockData.data.modalData = ng.extend(ctrl.modalSettingsBlockData.data.modalData, {
                subblockId: ctrl.subblockId,
                onApply: ctrl.onApply,
                onUpdate: ctrl.onUpdate,
                onCancel: ctrl.onCancel,
                settings: ctrl.settings,
                templateUrlByType: 'areas/landing/frontend/blocks/subblock-inplace/templates/subblockModal_button.html',
            });

            subblockInplaceService
                .showModal(
                    modalId,
                    'Настройки кнопки',
                    {
                        modalClass: 'subblock-inplace-button-modal',
                        modalOverlayClass: 'subblock-inplace-button-modal-floating-wrap',
                    },
                    ctrl.modalSettingsBlockData.data,
                )
                .then(() => {
                    ctrl.modalSettingsBlockData.backup = ng.copy(ctrl.modalSettingsBlockData.data);
                });
        };

        ctrl.onUpdate = function (settings) {
            ctrl.settings = settings;
        };

        ctrl.onApply = function (subblockId, settings) {
            subblockInplaceService.updateSubBlockSettings(subblockId, settings).then((response) => {
                if (response.result === true) {
                    $window.location.reload();
                } else {
                    alert('Ошибка при сохранении настроек подблока');
                }
            });
        };

        ctrl.onCancel = function (subblockId, settings) {
            ctrl.modalSettingsBlockData.data.modalData.settings = ng.extend(
                ctrl.modalSettingsBlockData.data.modalData.settings,
                ctrl.modalSettingsBlockData.backup.modalData.settings,
            );
        };
    };

    ng.module('subblockInplace').controller('SubblockInplaceButtonCtrl', SubblockInplaceButtonCtrl);

    SubblockInplaceButtonCtrl.$inject = ['$window', 'subblockInplaceService'];
})(window.angular);
