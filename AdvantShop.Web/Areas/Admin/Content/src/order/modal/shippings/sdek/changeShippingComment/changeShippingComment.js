(function (ng) {
    

    /* @ngInject */
    const ModalSdekChangeCommentCtrl = function ($uibModalInstance) {
        const ctrl = this;

        ctrl.$onInit = function () {
            const params = ctrl.$resolve.params;
            ctrl.comment = params.pristineText;
            if (ctrl.comment && ctrl.comment.length > 255) {
                ctrl.comment = ctrl.comment.substring(0, 255);
            }
        };

        ctrl.close = function () {
            $uibModalInstance.dismiss('cancel');
        };

        ctrl.save = function () {
            $uibModalInstance.close({ comment: ctrl.comment });
        };
    };

    ng.module('uiModal').controller('ModalSdekChangeCommentCtrl', ModalSdekChangeCommentCtrl);
})(window.angular);
