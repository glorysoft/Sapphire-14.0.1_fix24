(function (ng) {
    

    const ModalAddEditDepartmentCtrl = function ($uibModalInstance, $http, toaster, $translate) {
        const ctrl = this;
        ctrl.formInited = false;

        ctrl.$onInit = function () {
            const params = ctrl.$resolve;
            ctrl.departmentId = params.departmentId != null ? params.departmentId : 0;
            ctrl.mode = ctrl.departmentId != 0 ? 'edit' : 'add';

            if (ctrl.mode == 'add') {
                ctrl.sort = 0;
                ctrl.enabled = true;
                ctrl.formInited = true;
            } else {
                ctrl.getDepartment(ctrl.departmentId);
            }
        };

        ctrl.close = function () {
            $uibModalInstance.dismiss('cancel');
        };

        ctrl.getDepartment = function (departmentId) {
            $http.get('departments/getDepartment', { params: { departmentId, rnd: Math.random() } }).then((response) => {
                const data = response.data;
                if (data != null) {
                    ctrl.name = data.Name;
                    ctrl.sort = data.Sort;
                    ctrl.enabled = data.Enabled;
                }
                ctrl.addEditDepartmentForm.$setPristine();
                ctrl.formInited = true;
            });
        };

        ctrl.save = function () {
            ctrl.btnSleep = true;

            const params = {
                departmentId: ctrl.departmentId,
                name: ctrl.name,
                sort: ctrl.sort,
                enabled: ctrl.enabled,
                rnd: Math.random(),
            };

            const url = ctrl.mode == 'add' ? 'departments/addDepartment' : 'departments/updateDepartment';

            $http.post(url, params).then((response) => {
                const data = response.data;
                if (data.result == true) {
                    toaster.pop(
                        'success',
                        '',
                        ctrl.mode == 'add'
                            ? $translate.instant('Admin.Js.Settings.AddEditDepartment.DepartmentAdded')
                            : $translate.instant('Admin.Js.Settings.AddEdit.ChangesSaved'),
                    );
                    $uibModalInstance.close('saveDepartment');
                } else {
                    toaster.pop(
                        'error',
                        $translate.instant('Admin.Js.Settings.AddEdit.Error'),
                        $translate.instant('Admin.Js.Settings.AddEdit.ErrorWhile') + ctrl.mode == 'add'
                            ? $translate.instant('Admin.Js.Settings.AddEdit.Creating')
                            : $translate.instant('Admin.Js.Settings.AddEdit.Editing'),
                    );
                    ctrl.btnSleep = false;
                }
            });
        };
    };

    ModalAddEditDepartmentCtrl.$inject = ['$uibModalInstance', '$http', 'toaster', '$translate'];

    ng.module('uiModal').controller('ModalAddEditDepartmentCtrl', ModalAddEditDepartmentCtrl);
})(window.angular);
