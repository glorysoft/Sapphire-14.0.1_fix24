(function (ng) {
    

    const ModalChangeTaskGroupCtrl = function ($uibModalInstance, tasksService, $translate, toaster) {
        const ctrl = this;

        ctrl.$onInit = function () {
            ctrl.params = ctrl.$resolve.params;
            ctrl.GetGroups();
        };

        ctrl.GetGroups = function () {
            tasksService.getTaskGroups().then((result) => {
                ctrl.groups = result;
                if (result.length > 0) {
                    ctrl.selectedGroup = result[0];
                }
            });
        };

        ctrl.close = function () {
            $uibModalInstance.dismiss('cancel');
        };

        ctrl.changeGroup = function () {
            tasksService.changeTaskGroups(ng.extend(ctrl.params || {}, { selectedGroupId: ctrl.selectedGroup.value })).then((result) => {
                if (result == false) {
                    toaster.error($translate.instant('Admin.Js.Tasks.ChangeTaskGroup.FailedToChange'));
                    ctrl.GetGroups();
                } else {
                    $uibModalInstance.close('changedGroup');
                }
            });
        };
    };

    ModalChangeTaskGroupCtrl.$inject = ['$uibModalInstance', 'tasksService', '$translate', 'toaster'];

    ng.module('uiModal').controller('ModalChangeTaskGroupCtrl', ModalChangeTaskGroupCtrl);
})(window.angular);
