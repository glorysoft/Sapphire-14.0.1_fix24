(function (ng) {
    

    const ModalChangeAdminShopNameCtrl = function ($uibModalInstance, $http, $q, toaster, $translate) {
        const ctrl = this;

        ctrl.$onInit = function () {
            $q.when(
                ctrl.$resolve != null && ctrl.$resolve.data != null && ctrl.$resolve.data.name != null
                    ? { data: { name: ctrl.$resolve.data.name } }
                    : $http.get('home/getAdminShopName'),
            ).then((result) => {
                ctrl.name = result.data.name;
            });
        };

        ctrl.close = function () {
            $uibModalInstance.dismiss('cancel');
        };

        ctrl.save = function () {
            if (ctrl.name == '' || ctrl.btnLoading === true) {
                return;
            }

            ctrl.btnLoading = true;

            $http
                .post('home/saveAdminShopName', { name: ctrl.name })
                .then((response) => {
                    toaster.pop('success', '', $translate.instant('Admin.Js.ChangeAdminShopName.ChangesSuccessfullySaved'));
                    $uibModalInstance.close({ name: response.data.name });
                })
                .finally(() => {
                    ctrl.btnLoading = false;
                });
        };
    };

    ModalChangeAdminShopNameCtrl.$inject = ['$uibModalInstance', '$http', '$q', 'toaster', '$translate'];

    ng.module('uiModal').controller('ModalChangeAdminShopNameCtrl', ModalChangeAdminShopNameCtrl);
})(window.angular);
