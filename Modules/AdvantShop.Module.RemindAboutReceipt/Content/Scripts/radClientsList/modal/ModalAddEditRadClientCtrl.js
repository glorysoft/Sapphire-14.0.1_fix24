; (function (ng) {
    'use strict';

    var ModalAddEditRadClientCtrl = function ($uibModalInstance, $http, toaster) {
        var ctrl = this;
        ctrl.formInited = false;

        ctrl.client = {};

        ctrl.$onInit = function () {
            var params = ctrl.$resolve;
            ctrl.id = params.id !== undefined && params.id !== null ? params.id : 0;
            ctrl.mode = ctrl.id !== undefined && ctrl.id !== 0 ? 'edit' : 'add';

            if (ctrl.mode === 'add') {
                ctrl.formInited = true;
            } else {
                ctrl.getClient(ctrl.id);
            }
        };

        ctrl.close = function () {
            $uibModalInstance.dismiss('cancel');
        };

        ctrl.getClient = function (id) {
            $http.get('../module/raradmin/getRadClient', { params: { id: id } }).then(function (response) {
                var data = response.data;
                if (data !== null) {
                    ctrl.client = data;
                }

                ctrl.addEditRadClientForm.$setPristine();
                ctrl.formInited = true;
            });
        };

        ctrl.save = function () {
            ctrl.btnSleep = true;

            var url = '../module/raradmin/' + (ctrl.mode === 'add' ? 'addRadclient' : 'updateRadclient');
            $http.post(url, { client: ctrl.client }).then(function (response) {
                var data = response.data;
                if (data.result === true) {
                    toaster.pop('success', '', 'Изменения сохранены');
                    $uibModalInstance.close('saveRadClient');
                } else {
                    toaster.pop('error', 'Ошибка', 'Ошибка при изменении');
                    ctrl.btnSleep = false;
                }
            });
        };

        ctrl.createLead = function () {
            $http.post('../module/raradmin/createleadbyradclient', { id: ctrl.id }).then(function (response) {
                var data = response.data;
                if (data.result === true) {
                    ctrl.client.LeadId = data.leadId;
                    ctrl.client.LeadTitle = data.leadTitle;
                    toaster.pop('success', '', data.msg);
                } else {
                    toaster.pop('error', 'Ошибка', data.msg);
                    ctrl.btnSleep = false;
                }
            });
        };
    };

    ModalAddEditRadClientCtrl.$inject = ['$uibModalInstance', '$http', 'toaster'];

    ng.module('uiModal')
        .controller('ModalAddEditRadClientCtrl', ModalAddEditRadClientCtrl);

})(window.angular);