import './EditUserRoleActions.html';
(function (ng) {
    

    const ModalEditUserRoleActionsCtrl = function ($uibModalInstance, $http) {
        const ctrl = this;
        ctrl.formInited = false;

        ctrl.$onInit = function () {
            const params = ctrl.$resolve.params;
            ctrl.customerId = params.customerId;
            ctrl.roleActions = params.roleActionKeys;
            ctrl.accessSettingsGroups = params.accessSettingsGroups
            ctrl.roleActionsWithParent = ctrl.roleActions.filter(item => item.Parent !== null);
        };

        ctrl.setSelectionAll = function (selected) {
            angular.forEach(ctrl.roleActions, (roleAction, key) => {
                roleAction.Enabled = selected;
            });
        };

        ctrl.setRoleAsParent = function (parent, parentResult) {
            ctrl.roleActionsWithParent
                .filter((roleAction) => roleAction.Parent === parent.Key)
                .forEach((roleAction) => {
                    roleAction.Enabled = parentResult;
                });
        };

        ctrl.close = function () {
            $uibModalInstance.dismiss('cancel');
        };

        ctrl.apply = function () {
            $uibModalInstance.close({ roleActionKeys: ctrl.roleActions });
        };
    };

    ModalEditUserRoleActionsCtrl.$inject = ['$uibModalInstance', '$http'];

    ng.module('uiModal').controller('ModalEditUserRoleActionsCtrl', ModalEditUserRoleActionsCtrl);
})(window.angular);
