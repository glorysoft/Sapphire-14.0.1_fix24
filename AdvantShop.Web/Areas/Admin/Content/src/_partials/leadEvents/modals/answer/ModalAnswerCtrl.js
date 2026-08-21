import './answer.html';

(function (ng) {
    

    const ModalAnswerCtrl = function ($uibModalInstance, $http, toaster, $translate) {
        const ctrl = this;

        ctrl.$onInit = function () {
            if (ctrl.$resolve != null && ctrl.$resolve.params != null) {
                ctrl.event = ctrl.$resolve.params.event;
                ctrl.text = ctrl.$resolve.params.text;
            }
        };

        ctrl.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };

        ctrl.save = function (event, text) {
            let url = '',
                params = null;

            ctrl.sendAnswerLoading = true;

            switch (event.EventType) {
                case 'vk':
                    // if (event.mode[index] === 'post') {
                    //     url = 'vk/sendVkMessageToWall';
                    //     params = { id: event.Id, message: text };
                    // } else {
                    //     url = 'vk/sendVkMessage';
                    //     params = { userId: event.Data.UserId, message: text };
                    // }
                    url = 'vk/sendVkMessage';
                    params = { userId: event.Data.UserId, message: text };
                    break;

                case 'facebook':
                    url = 'facebook/sendFacebookMessage';
                    params = { id: event.Id, message: text };
                    break;

                case 'telegram':
                    url = 'telegram/sendTelegramMessage';
                    params = { id: event.Id, message: text };
                    break;

                case 'ok':
                    url = 'ok/sendOkMessage';
                    params = { id: event.Id, message: text, customerId: event.CustomerId };
                    break;
            }

            $http
                .post(url, params)
                .then((response) => {
                    const data = response.data;

                    if (data.result === true) {
                        toaster.pop('success', '', $translate.instant('Admin.Js.Lead.MessageSent'));
                        $uibModalInstance.close(text);
                    } else if (data.errors != null) {
                        data.errors.forEach((err) => {
                            toaster.pop('error', '', err, 10000);
                        });
                    } else {
                        toaster.pop('error', '', $translate.instant('Admin.Js.Lead.MessageNotSent'));
                    }
                })
                .finally(() => {
                    ctrl.sendAnswerLoading = false;
                });
        };
    };

    ModalAnswerCtrl.$inject = ['$uibModalInstance', '$http', 'toaster', '$translate'];

    ng.module('uiModal').controller('ModalAnswerCtrl', ModalAnswerCtrl);
})(window.angular);
