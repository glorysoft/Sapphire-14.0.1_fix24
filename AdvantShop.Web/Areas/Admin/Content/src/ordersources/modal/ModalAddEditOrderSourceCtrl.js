(function (ng) {
    

    const ModalAddEditOrderSourceCtrl = function ($uibModalInstance, $http, $translate, toaster) {
        const ctrl = this;

        ctrl.$onInit = function () {
            const params = ctrl.$resolve;
            ctrl.id = params.id != null ? params.id : 0;
            ctrl.mode = ctrl.id != 0 ? 'edit' : 'add';

            ctrl.getTypes().then(() => {
                if (ctrl.mode == 'add') {
                    ctrl.data = {
                        Type: ctrl.types[0].value,
                        SortOrder: 0,
                    };
                } else {
                    ctrl.loadOrderSource();
                }
            });
        };

        ctrl.close = function () {
            $uibModalInstance.dismiss('cancel');
        };

        ctrl.getTypes = function () {
            return $http.get('ordersources/getTypes').then((response) => {
                ctrl.types = response.data;
            });
        };

        ctrl.loadOrderSource = function () {
            $http.get('ordersources/getOrderSource', { params: { id: ctrl.id } }).then((response) => {
                const data = response.data;
                if (data.result == true) {
                    ctrl.data = data.obj;
                } else {
                    ctrl.close();
                }
            });
        };

        ctrl.saveSource = function () {
            const url = ctrl.mode == 'add' ? 'ordersources/addOrderSource' : 'ordersources/updateOrderSource';
            $http.post(url, ctrl.data).then((response) => {
                const data = response.data;
                if (data.result == true) {
                    toaster.success('', $translate.instant('Admin.Js.ChangesSaved'));
                    $uibModalInstance.close();
                } else {
                    toaster.error('', (data.errors || [])[0] || $translate.instant('Admin.Js.ErrorWhileSaving'));
                }
            });
        };
    };

    ModalAddEditOrderSourceCtrl.$inject = ['$uibModalInstance', '$http', '$translate', 'toaster'];

    ng.module('uiModal').controller('ModalAddEditOrderSourceCtrl', ModalAddEditOrderSourceCtrl);
})(window.angular);
