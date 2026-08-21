(function (ng) {
    

    const ModalSalesChannelExcludedCtrl = function ($uibModalInstance, $http, $q, toaster, $translate) {
        const ctrl = this;
        ctrl.salesChannelExcluded = [];

        ctrl.$onInit = function () {
            $q.when(
                ctrl.$resolve != null && ctrl.$resolve.data != null && ctrl.$resolve.data.productId != null
                    ? { productId: ctrl.$resolve.data.productId }
                    : ctrl.$resolve != null && ctrl.$resolve.data != null && ctrl.$resolve.data.ids != null
                      ? { filterModel: ctrl.$resolve.data }
                      : null,
            ).then((result) => {
                ctrl.productId = result.productId;
                ctrl.filterModel = result.filterModel;
                if (ctrl.productId != null) {
                    $http
                        .post('product/GetProductSalesChannels', { id: ctrl.productId })
                        .then((response) => {
                            ctrl.salesChannelExcluded = response.data.obj;
                        })
                        .finally(() => {
                            ctrl.btnLoading = false;
                        });
                }
                if (ctrl.filterModel != null) {
                    $http
                        .post('product/GetSalesChannelsActive', { filterModel: ctrl.filterModel })
                        .then((response) => {
                            ctrl.salesChannelExcluded = response.data.obj;
                        })
                        .finally(() => {
                            ctrl.btnLoading = false;
                        });
                }
            });
        };

        ctrl.setSelectionAll = function (selected) {
            angular.forEach(ctrl.salesChannelExcluded.SalesChannelList, (channel) => {
                channel.Enable = selected;
                channel.GrayEnable = false;
            });
        };

        ctrl.close = function () {
            $uibModalInstance.dismiss('cancel');
        };

        ctrl.save = function () {
            ctrl.isProgress = true;
            if (ctrl.productId != null) {
                $http
                    .post('product/SetProductSalesChannels', { model: ctrl.salesChannelExcluded })
                    .then((response) => {
                        toaster.pop('success', '', $translate.instant('Admin.Js.ChangeAdminShopName.ChangesSuccessfullySaved'));
                        $uibModalInstance.close({ name: response.data.name });
                        ctrl.isProgress = false;
                    })
                    .finally(() => {
                        ctrl.btnLoading = false;
                        ctrl.isProgress = false;
                    });
            } else if (ctrl.filterModel != null) {
                $http
                    .post('product/SetSalesChannelsActive', { model: ctrl.salesChannelExcluded })
                    .then((response) => {
                        toaster.pop('success', '', $translate.instant('Admin.Js.ChangeAdminShopName.ChangesSuccessfullySaved'));
                        $uibModalInstance.close({ name: response.data.name });
                        ctrl.isProgress = false;
                    })
                    .finally(() => {
                        ctrl.btnLoading = false;
                        ctrl.isProgress = false;
                    });
            }
        };
    };

    ModalSalesChannelExcludedCtrl.$inject = ['$uibModalInstance', '$http', '$q', 'toaster', '$translate'];

    ng.module('uiModal').controller('ModalSalesChannelExcludedCtrl', ModalSalesChannelExcludedCtrl);
})(window.angular);
