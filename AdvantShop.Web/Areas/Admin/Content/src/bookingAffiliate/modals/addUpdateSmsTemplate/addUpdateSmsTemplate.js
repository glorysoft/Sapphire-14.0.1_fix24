(function (ng) {
    

    const ModalAddUpdateSmsTemplateCtrl = function ($http, toaster, $uibModalInstance, $translate, bookingAffiliateService) {
        const ctrl = this;

        ctrl.$onInit = function () {
            const params = ctrl.$resolve.params;
            ctrl.id = params.id != null ? params.id : 0;
            ctrl.affiliateId = params.affiliateId;
            ctrl.mode = ctrl.id !== 0 ? 'edit' : 'add';

            ctrl.getStatuses();
            ctrl.getFormData();

            if (ctrl.mode === 'add') {
                ctrl.enabled = true;
            } else {
                ctrl.getTemplate();
            }
        };

        ctrl.getTemplate = function () {
            return bookingAffiliateService.getSmsTemplate(ctrl.id).then((data) => {
                if (data.result === true) {
                    ctrl.affiliateId = data.obj.AffiliateId;
                    ctrl.status = data.obj.Status;
                    ctrl.template = data.obj.Text;
                    ctrl.enabled = data.obj.Enabled;
                } else {
                    data.errors.forEach((error) => {
                        toaster.pop('error', error);
                    });

                    if (!data.errors) {
                        toaster.pop('error', 'Ошибка', 'Не удалось загрузить данные шаблона');
                    }
                    ctrl.close();
                }
            });
        };

        ctrl.getStatuses = function () {
            return $http.get('booking/getStatusesList').then((response) => {
                ctrl.statuses = response.data;
            });
        };

        ctrl.getFormData = function () {
            return $http.get('bookingAffiliate/getSmsTemplateFormData').then((response) => {
                const data = response.data;

                if (data.result === true) {
                    ctrl.smsTemplateVariables = data.obj;
                } else {
                    data.errors.forEach((error) => {
                        toaster.pop('error', error);
                    });

                    if (!data.errors) {
                        toaster.pop('error', 'Ошибка', 'Не удалось загрузить данные для формы');
                    }
                }
            });
        };

        ctrl.save = function () {
            let promise = null;
            if (ctrl.mode === 'add') {
                promise = bookingAffiliateService.addSmsTemplate(ctrl.affiliateId, ctrl.status, ctrl.template, ctrl.enabled);
            } else {
                promise = bookingAffiliateService.updateSmsTemplate(ctrl.id, ctrl.affiliateId, ctrl.status, ctrl.template, ctrl.enabled);
            }

            promise.then((data) => {
                if (data.result === true) {
                    toaster.pop('success', '', 'Изменения сохранены');
                    $uibModalInstance.close('saveBookingSmsTemplate');
                } else {
                    ctrl.btnLoading = false;
                    data.errors.forEach((error) => {
                        toaster.pop('error', error);
                    });

                    if (!data.errors) {
                        toaster.pop('error', 'Ошибка', 'Не удалось сохранить данные шаблона');
                    }
                }
            });
        };

        ctrl.close = function () {
            $uibModalInstance.dismiss('cancel');
        };
    };

    ModalAddUpdateSmsTemplateCtrl.$inject = ['$http', 'toaster', '$uibModalInstance', '$translate', 'bookingAffiliateService'];

    ng.module('uiModal').controller('ModalAddUpdateSmsTemplateCtrl', ModalAddUpdateSmsTemplateCtrl);
})(window.angular);
