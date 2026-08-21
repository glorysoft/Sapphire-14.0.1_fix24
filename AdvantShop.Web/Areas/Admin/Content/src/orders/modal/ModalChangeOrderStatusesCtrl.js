(function (ng) {
    

    const ModalChangeOrderStatusesCtrl = function ($uibModalInstance, $http, lastStatisticsService, toaster, $translate) {
        const ctrl = this;

        ctrl.$onInit = function () {
            $http.get('orders/getorderstatuses').then((response) => {
                ctrl.statuses = response.data;
                if (response.data != null && response.data.length > 0) {
                    ctrl.status = response.data[0];
                }
            });
        };

        ctrl.close = function () {
            $uibModalInstance.dismiss('cancel');
        };

        ctrl.changeStatus = () => {
            ctrl.changeStatusInProgress = true;
            $http
                .post(
                    'orders/changestatus',
                    ng.extend(ctrl.$resolve.params || {}, {
                        newOrderStatusId: ctrl.status.value,
                        statusBasis: ctrl.basis != null ? ctrl.basis : '',
                    }),
                )
                .then((response) => {
                    if (response.data.result) {
                        lastStatisticsService.getLastStatistics();
                        ctrl.changeStatusInProgress = false;
                        toaster.pop('success', '', $translate.instant('Admin.Js.Order.ModalChangeOrderStatuses.ChangeSuccess'));
                        $uibModalInstance.close('changedStatus');
                        return;
                    }

                    toaster.pop('error', '', response.data.errors.length > 0
                        ? response.data.errors.join('<br>')
                        : $translate.instant('Admin.Js.Order.ModalChangeOrderStatuses.Error'));
                    $uibModalInstance.close('changedStatus');
                });
        };
    };

    ModalChangeOrderStatusesCtrl.$inject = ['$uibModalInstance', '$http', 'lastStatisticsService', 'toaster' ,'$translate'];

    ng.module('uiModal').controller('ModalChangeOrderStatusesCtrl', ModalChangeOrderStatusesCtrl);
})(window.angular);
