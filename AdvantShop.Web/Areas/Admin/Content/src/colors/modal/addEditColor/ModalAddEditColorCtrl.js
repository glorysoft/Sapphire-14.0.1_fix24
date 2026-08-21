(function (ng) {
    

    const ModalAddEditColorCtrl = function ($uibModalInstance, $http, $q, $timeout, toaster, Upload, $translate, isMobileService) {
        const ctrl = this;

        ctrl.$onInit = function () {
            const params = ctrl.$resolve;
            ctrl.colorId = params.colorId != null ? params.colorId : 0;
            ctrl.mode = ctrl.colorId != 0 ? 'edit' : 'add';

            ctrl.getFormData().then((data) => {
                ctrl.iconSizesText = data.iconSizesText;
                ctrl.filesHelpText = data.filesHelpText;

                if (ctrl.mode == 'add') {
                    ctrl.sortOrder = 0;
                    ctrl.colorIcon = null;

                    ctrl.colorCodeRequired = true;
                    $timeout(() => {
                        ctrl.colorPickerApi.getScope().AngularColorPickerController.setNgModel('#000000');
                    }, 0);
                } else {
                    ctrl.getColor(ctrl.colorId).then((data) => {
                        ctrl.colorPickerApi.getScope().AngularColorPickerController.setNgModel(ctrl.colorCode);
                        ctrl.colorCodeRequired = ctrl.colorIcon == null && ctrl.colorCode == null;
                    });
                }
            });

            ctrl.colorCodeRequired = false;

            ctrl.colorPickerOptions = {
                swatchBootstrap: false,
                format: 'hex',
                alpha: false,
                case: 'lower',
                swatchOnly: false,
                allowEmpty: true,
                required: false,
                preserveInputFormat: false,
                restrictToFormat: false,
                inputClass: 'form-control',
            };

            ctrl.colorPickerEventApi = {};

            ctrl.colorPickerEventApi.onBlur = function () {
                ctrl.colorPickerApi.getScope().AngularColorPickerController.update();
            };
        };

        ctrl.close = function () {
            $uibModalInstance.dismiss('cancel');
        };

        ctrl.getFormData = function () {
            return $http.post('colors/getFormData').then((response) => response.data);
        };

        ctrl.getColor = function (colorId) {
            return $http.get('colors/getColor', { params: { colorId } }).then((response) => {
                const data = response.data;

                if (data != null) {
                    ctrl.colorName = data.ColorName;
                    ctrl.colorCode = data.ColorCode != null && data.ColorCode.trim() != '' ? data.ColorCode : '#000000';
                    ctrl.colorIcon = data.ColorIcon;
                    ctrl.sortOrder = data.SortOrder;
                }

                return data;
            });
        };

        ctrl.file = null;

        ctrl.upload = function ($files, $file, $newFiles, $duplicateFiles, $invalidFiles, $event) {
            if (($event.type === 'change' || $event.type === 'drop') && $file != null) {
                ctrl.file = $file;
                ctrl.colorCodeRequired = false;
                ctrl.needDeleteIcon = false;
            }
        };

        ctrl.deleteIcon = function () {
            ctrl.needDeleteIcon = true;

            ctrl.colorIcon = null;
            ctrl.colorCodeRequired = true;
            ctrl.colorPickerApi.getScope().AngularColorPickerController.setNgModel('#000000');
        };

        ctrl.save = function () {
            const params = {
                colorId: ctrl.colorId,
                colorName: ctrl.colorName,
                colorCode: ctrl.colorCode != null && ctrl.colorCode.length > 0 ? (ctrl.colorCode[0] != '#' ? '#' : '') + ctrl.colorCode : '#ffffff',
                colorIconFile: ctrl.colorIconFile,
                sortOrder: ctrl.sortOrder,
            };

            const deferDeleteIcon = $q.defer();

            if (ctrl.needDeleteIcon === true) {
                $http.post('colors/deleteIcon', { colorId: ctrl.colorId }).then(() => {
                    deferDeleteIcon.resolve();
                });
            } else {
                deferDeleteIcon.resolve();
            }

            const url = ctrl.mode == 'add' ? 'colors/addColor' : 'colors/updateColor';

            deferDeleteIcon.promise.then(() => {
                Upload.upload({
                    url,
                    data: ng.extend(params, {
                        colorIconFile: ctrl.file,
                        rnd: Math.random(),
                    }),
                }).then((response) => {
                    const data = response.data;
                    if (data.result === true) {
                        toaster.pop('success', '', $translate.instant('Admin.Js.Colors.ChangesSaved'));
                        $uibModalInstance.close('saveColor');
                    } else if (data.errors != null) {
                        data.errors.forEach((err) => {
                            toaster.pop('error', '', err);
                        });
                    }
                });
            });
        };
    };

    ModalAddEditColorCtrl.$inject = ['$uibModalInstance', '$http', '$q', '$timeout', 'toaster', 'Upload', '$translate', 'isMobileService'];

    ng.module('uiModal').controller('ModalAddEditColorCtrl', ModalAddEditColorCtrl);
})(window.angular);
