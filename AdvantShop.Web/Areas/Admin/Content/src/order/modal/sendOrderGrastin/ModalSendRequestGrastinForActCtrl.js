(function (ng) {
    

    const ModalSendRequestGrastinForActCtrl = function ($uibModalInstance, $window, toaster, $q, $http) {
        const ctrl = this;

        ctrl.$onInit = function () {
            const params = ctrl.$resolve.obj;
            ctrl.orderId = params.orderId;
        };

        ctrl.close = function () {
            $uibModalInstance.dismiss('cancel');
        };

        ctrl.send = function () {
            const params = {
                orderId: ctrl.orderId,
                contractId: ctrl.contractId,
                seats: ctrl.seats,
            };

            $http.post('grastin/sendrequestforact', params).then((response) => {
                const data = response.data;
                if (data.result === true) {
                    $uibModalInstance.close();
                    window.location = `grastin/getact?filename=${  encodeURIComponent(data.obj.FileName)}`;
                } else {
                    ctrl.btnLoading = false;
                    data.errors.forEach((error) => {
                        toaster.pop('error', '', error);
                    });
                }
            });
        };
    };

    ModalSendRequestGrastinForActCtrl.$inject = ['$uibModalInstance', '$window', 'toaster', '$q', '$http'];

    ng.module('uiModal').controller('ModalSendRequestGrastinForActCtrl', ModalSendRequestGrastinForActCtrl);
})(window.angular);
