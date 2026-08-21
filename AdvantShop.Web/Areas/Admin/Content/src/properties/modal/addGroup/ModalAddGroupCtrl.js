import './AddGroup.html';
(function (ng) {
    

    const ModalAddGroupCtrl = function ($uibModalInstance, $http, $window, urlHelper, toaster, $translate, isMobileService) {
        const ctrl = this;

        ctrl.$onInit = function () {
            const params = ctrl.$resolve;
            ctrl.groupId = params.groupId != null ? params.groupId : 0;
            ctrl.mode = ctrl.groupId != 0 ? 'edit' : 'add';

            if (ctrl.mode == 'add') {
                ctrl.sortOrder = 0;
            } else {
                $http.get('properties/getGroup', { params: { groupId: ctrl.groupId } }).then((response) => {
                    const data = response.data;
                    ctrl.name = data.Name;
                    ctrl.nameDisplayed = data.NameDisplayed;
                    ctrl.sortOrder = data.SortOrder;
                });
            }
        };

        ctrl.close = function () {
            $uibModalInstance.dismiss('cancel');
        };

        ctrl.addGroup = function () {
            if (ctrl.name == null || ctrl.name === '') return;

            if (ctrl.mode == 'add') {
                $http
                    .post('properties/addGroup', {
                        name: ctrl.name,
                        nameDisplayed: ctrl.nameDisplayed,
                        sortOrder: ctrl.sortOrder,
                    })
                    .then((response) => {
                        $uibModalInstance.close({ groupId: response.groupId, name: ctrl.name });
                    })
                    .then((res) => {
                        toaster.pop('success', '', $translate.instant('Admin.Js.Properties.ChangesSaved'));
                        if (isMobileService.getValue()) {
                            document.querySelector('.popover-backdrop').click();
                        }
                    })
                    .catch((error) => {
                        toaster.pop('error', '', $translate.instant('Admin.Js.Properties.Error'));
                    });
            } else {
                $http
                    .post('properties/updateGroup', {
                        propertyGroupId: ctrl.groupId,
                        name: ctrl.name,
                        nameDisplayed: ctrl.nameDisplayed,
                        sortOrder: ctrl.sortOrder,
                    })
                    .then((response) => {
                        $uibModalInstance.close('');
                    })
                    .then((res) => {
                        toaster.pop('success', '', $translate.instant('Admin.Js.Properties.ChangesSaved'));
                    })
                    .catch((error) => {
                        toaster.pop('error', '', $translate.instant('Admin.Js.Properties.Error'));
                    });
            }
        };
    };

    ModalAddGroupCtrl.$inject = ['$uibModalInstance', '$http', '$window', 'urlHelper', 'toaster', '$translate', 'isMobileService'];

    ng.module('uiModal').controller('ModalAddGroupCtrl', ModalAddGroupCtrl);
})(window.angular);
