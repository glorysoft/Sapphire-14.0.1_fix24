(function (ng) {
    

    const ModalAddEditSizeCtrl = function ($uibModalInstance, $http, toaster, $translate) {
        const ctrl = this;

        ctrl.$onInit = function () {
            const params = ctrl.$resolve;
            ctrl.sizeId = params.sizeId != null ? params.sizeId : 0;
            ctrl.mode = ctrl.sizeId != 0 ? 'edit' : 'add';

            if (ctrl.mode == 'add') {
                ctrl.sortOrder = 0;
            } else {
                ctrl.getSize(ctrl.sizeId);
            }
        };

        ctrl.close = function () {
            $uibModalInstance.dismiss('cancel');
        };

        ctrl.getSize = function (sizeId) {
            $http.get('sizes/getSize', { params: { sizeId } }).then((response) => {
                const data = response.data;
                if (data != null) {
                    ctrl.sizeName = data.SizeName;
                    ctrl.sortOrder = data.SortOrder;
                }
            });
        };

        ctrl.save = function () {
            const params = {
                sizeId: ctrl.sizeId,
                sizeName: ctrl.sizeName,
                sortOrder: ctrl.sortOrder,
            };

            const url = ctrl.mode == 'add' ? 'sizes/addSize' : 'sizes/updateSize';

            $http.post(url, params).then((response) => {
                const data = response.data;
                if (data.result == true) {
                    toaster.pop('success', '', $translate.instant('Admin.Js.Sizes.ChangesSaved'));
                    $uibModalInstance.close('saveSize');
                } else {
                    toaster.pop('error', $translate.instant('Admin.Js.Sizes.Error'), $translate.instant('Admin.Js.Sizes.ErrorAddingEditing'));
                }
            });
        };
    };

    ModalAddEditSizeCtrl.$inject = ['$uibModalInstance', '$http', 'toaster', '$translate'];

    ng.module('uiModal').controller('ModalAddEditSizeCtrl', ModalAddEditSizeCtrl);
})(window.angular);
