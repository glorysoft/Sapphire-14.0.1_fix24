import './triggerLetterKeys.html';

(function (ng) {
    

    const ModalTriggerLetterKeysCtrl = function ($uibModalInstance) {
        const ctrl = this;

        ctrl.$onInit = function () {
            ctrl.keys = ctrl.$resolve;
        };

        ctrl.close = function () {
            $uibModalInstance.dismiss('cancel');
        };
    };

    ModalTriggerLetterKeysCtrl.$inject = ['$uibModalInstance'];

    ng.module('uiModal').controller('ModalTriggerLetterKeysCtrl', ModalTriggerLetterKeysCtrl);
})(window.angular);
