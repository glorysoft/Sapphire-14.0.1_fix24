(function (ng) {
    

    const ModalAddEditSmsAnswerTemplateCtrl = function ($uibModalInstance, $http, toaster, $translate, $sce) {
        const ctrl = this;

        ctrl.$onInit = function () {
            const params = ctrl.$resolve.params || {};
            ctrl.TemplateId = params.id != null ? params.id : 0;
            ctrl.mode = ctrl.TemplateId !== 0 ? 'edit' : 'add';

            ctrl.getLetterFormatKeys();

            if (ctrl.TemplateId !== 0) {
                ctrl.getSmsAnswerTemplate(ctrl.TemplateId);
            } else {
                ctrl.SortOrder = 0;
                ctrl.Active = true;
            }
        };

        ctrl.getSmsAnswerTemplate = function (id) {
            return $http.get('settingsMail/getSmsAnswerTemplate', { params: { id } }).then((response) => {
                const data = response.data;
                if (data != null) {
                    ctrl.Name = data.Name;
                    ctrl.Active = data.Active;
                    ctrl.Text = data.Text;
                    ctrl.SortOrder = data.SortOrder;
                    ctrl.TemplateId = data.TemplateId;
                } else {
                    toaster.pop('error', $translate.instant('Admin.Js.MailSettings.Error'), response.data.error);
                }
            });
        };

        ctrl.getLetterFormatKeys = function () {
            return $http.get('settingsMail/getLetterFormatKeys').then((response) => {
                const data = response.data;
                if (data != null) {
                    ctrl.storeKeys = $sce.trustAsHtml(data.storeKeys);
                    ctrl.customerKeys = $sce.trustAsHtml(data.customerKeys);
                    ctrl.orderKeys = $sce.trustAsHtml(data.orderKeys);
                    ctrl.leadKeys = $sce.trustAsHtml(data.leadKeys);
                }
            });
        };

        ctrl.close = function () {
            $uibModalInstance.dismiss('cancel');
        };

        ctrl.save = function () {
            const params = {
                TemplateId: ctrl.TemplateId,
                Name: ctrl.Name,
                Active: ctrl.Active,
                Text: ctrl.Text,
                SortOrder: ctrl.SortOrder,
            };

            const url = ctrl.mode === 'add' ? 'settingsMail/AddSmsTemplate' : 'settingsMail/EditSmsTemplate';

            $http.post(url, params).then((response) => {
                const data = response.data;
                if (data.result === true) {
                    toaster.pop('success', '', $translate.instant('Admin.Js.MainPageProducts.ChangesSaved'));
                    $uibModalInstance.close();
                } else {
                    toaster.pop(
                        'error',
                        $translate.instant('Admin.Js.MailSettings.Error'),
                        data.errors || $translate.instant('Admin.Js.MailSettings.ErrorWhileCreatingEditing'),
                    );
                }
            });
        };
    };

    ModalAddEditSmsAnswerTemplateCtrl.$inject = ['$uibModalInstance', '$http', 'toaster', '$translate', '$sce'];

    ng.module('uiModal').controller('ModalAddEditSmsAnswerTemplateCtrl', ModalAddEditSmsAnswerTemplateCtrl);
})(window.angular);
