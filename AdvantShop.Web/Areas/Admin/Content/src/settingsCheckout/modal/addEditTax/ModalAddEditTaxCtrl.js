(function (ng) {
    

    const ModalAddEditTaxCtrl = function ($uibModalInstance, $http, $filter, toaster, $translate) {
        const ctrl = this;
        ctrl.formInited = false;

        ctrl.$onInit = function () {
            const params = ctrl.$resolve;
            ctrl.id = params.id != null ? params.id : 0;
            ctrl.mode = ctrl.id != 0 ? 'edit' : 'add';

            ctrl.getTaxTypes().then(() => {
                if (ctrl.mode === 'add') {
                    ctrl.name = '';
                    ctrl.rate = 0;
                    ctrl.enabled = false;
                    ctrl.formInited = true;
                    ctrl.isDefault = false;
                    ctrl.taxType = ctrl.TaxTypes[0];
                } else {
                    ctrl.getTax(ctrl.id);
                }
            });
        };

        ctrl.close = function () {
            $uibModalInstance.dismiss('cancel');
        };

        ctrl.getTaxTypes = function () {
            return $http.get('settingsCheckout/getTaxTypes').then((response) => {
                ctrl.TaxTypes = response.data;
            });
        };

        ctrl.getTax = function (id) {
            $http.get('settingsCheckout/getTax', { params: { id } }).then((response) => {
                const data = response.data;
                if (data != null) {
                    ctrl.id = data.TaxId;
                    ctrl.name = data.Name;
                    ctrl.rate = data.Rate;
                    ctrl.enabled = data.Enabled;
                    ctrl.isDefault = data.IsDefault;
                    ctrl.taxType = ctrl.TaxTypes.filter((x) => x.value === data.TaxType)[0];
                }
                ctrl.form.$setPristine();
                ctrl.formInited = true;
            });
        };

        ctrl.save = function () {
            ctrl.btnSleep = true;

            const params = {
                taxid: ctrl.id,
                name: ctrl.name,
                rate: ctrl.rate,
                enabled: ctrl.enabled,
                isDefault: ctrl.isDefault,
                taxType: ctrl.taxType.value,
                rnd: Math.random(),
            };

            const url = ctrl.mode == 'add' ? 'settingsCheckout/addtax' : 'settingsCheckout/updatetax';

            $http.post(url, params).then((response) => {
                const data = response.data;
                if (data.result == true) {
                    toaster.pop(
                        'success',
                        '',
                        ctrl.mode == 'add'
                            ? $translate.instant('Admin.Js.SettingsCheckout.TaxAdded')
                            : $translate.instant('Admin.Js.SettingsCheckout.ChangesSaved'),
                    );
                    $uibModalInstance.close('saveTax');
                } else {
                    const errorMsg =
                        data.errors.length > 0
                            ? data.errors[0]
                            : $translate.instant('Admin.Js.SettingsCheckout.ErrorWhile') +
                              (ctrl.mode == 'add'
                                  ? $translate.instant('Admin.Js.SettingsCheckout.CreatingSmall')
                                  : $translate.instant('Admin.Js.SettingsCheckout.EditingSmall'));
                    toaster.pop('error', $translate.instant('Admin.Js.SettingsCheckout.Error'), errorMsg);
                    ctrl.btnSleep = false;
                }
            });
        };
    };

    ModalAddEditTaxCtrl.$inject = ['$uibModalInstance', '$http', '$filter', 'toaster', '$translate'];

    ng.module('uiModal').controller('ModalAddEditTaxCtrl', ModalAddEditTaxCtrl);
})(window.angular);
