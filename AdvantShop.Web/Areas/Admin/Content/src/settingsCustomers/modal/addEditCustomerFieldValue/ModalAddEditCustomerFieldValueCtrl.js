(function (ng) {
    

    const ModalAddEditCustomerFieldValueCtrl = function ($uibModalInstance, customerFieldValuesService, toaster, $translate) {
        const ctrl = this;
        ctrl.formInited = false;

        ctrl.$onInit = function () {
            const params = ctrl.$resolve;
            ctrl.id = params.id != null ? params.id : 0;
            ctrl.fieldId = params.fieldId;
            ctrl.mode = ctrl.id != 0 ? 'edit' : 'add';

            if (ctrl.mode == 'add') {
                ctrl.sortOrder = 0;
                ctrl.formInited = true;
            } else {
                ctrl.getCustomerFieldValue(ctrl.id);
            }
        };

        ctrl.close = function () {
            $uibModalInstance.dismiss('cancel');
        };

        ctrl.getCustomerFieldValue = function (id) {
            customerFieldValuesService.getCustomerFieldValue(id).then((data) => {
                if (data != null) {
                    ctrl.fieldId = data.CustomerFieldId;
                    ctrl.value = data.Value;
                    ctrl.sortOrder = data.SortOrder;
                }
                ctrl.form.$setPristine();
                ctrl.formInited = true;
            });
        };

        ctrl.save = function () {
            ctrl.btnSleep = true;

            const params = {
                id: ctrl.id,
                customerFieldId: ctrl.fieldId,
                value: ctrl.value,
                sortOrder: ctrl.sortOrder,
            };

            customerFieldValuesService.addOrUpdateCustomerFieldValue(ctrl.mode == 'add', params).then((data) => {
                if (data.result == true) {
                    toaster.pop(
                        'success',
                        '',
                        ctrl.mode == 'add'
                            ? $translate.instant('Admin.Js.SettingsCustomers.ValueAdded')
                            : $translate.instant('Admin.Js.SettingsCustomers.ChangesSaved'),
                    );
                    $uibModalInstance.close('saveCustomerFieldValue');
                } else {
                    toaster.pop(
                        'error',
                        $translate.instant('Admin.Js.SettingsCustomers.Error'),
                        $translate.instant('Admin.Js.SettingsCustomers.ErrorWhile') + ctrl.mode == 'add'
                            ? $translate.instant('Admin.Js.SettingsCustomers.AddingWithSmallLetter')
                            : $translate.instant('Admin.Js.SettingsCustomers.EditingWithSmallLetter'),
                    );
                    ctrl.btnSleep = false;
                }
            });
        };
    };

    ModalAddEditCustomerFieldValueCtrl.$inject = ['$uibModalInstance', 'customerFieldValuesService', 'toaster', '$translate'];

    ng.module('uiModal').controller('ModalAddEditCustomerFieldValueCtrl', ModalAddEditCustomerFieldValueCtrl);
})(window.angular);
