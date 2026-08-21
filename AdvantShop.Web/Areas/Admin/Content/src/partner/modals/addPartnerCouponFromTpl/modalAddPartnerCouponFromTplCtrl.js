(function (ng) {
    

    const ModalAddPartnerCouponFromTplCtrl = function ($uibModalInstance, $http, toaster, $translate) {
        const ctrl = this;

        ctrl.$onInit = function () {
            const params = ctrl.$resolve.params;
            ctrl.partnerId = params.partnerId;
        };

        ctrl.close = function () {
            $uibModalInstance.dismiss('cancel');
        };

        ctrl.submit = function () {
            $http.post('partners/addPartnerCouponFromTpl', { partnerId: ctrl.partnerId, couponCode: ctrl.couponCode }).then((response) => {
                const data = response.data;
                if (data.result) {
                    $uibModalInstance.close();
                    toaster.success('', $translate.instant('Admin.Js.ChangesSaved'));
                } else {
                    toaster.error('', (data.errors || [])[0] || $translate.instant('Admin.Js.ErrorWhileSaving'));
                }
            });
        };
    };

    ModalAddPartnerCouponFromTplCtrl.$inject = ['$uibModalInstance', '$http', 'toaster', '$translate'];

    ng.module('uiModal').controller('ModalAddPartnerCouponFromTplCtrl', ModalAddPartnerCouponFromTplCtrl);
})(window.angular);
