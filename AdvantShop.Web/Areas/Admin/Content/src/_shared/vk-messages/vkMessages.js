import vkMessagesTemplate from './vkMessages.html';
(function (ng) {
    

    const VkMessagesCtrl = function ($http, toaster, $translate) {
        const ctrl = this;
        ctrl.$onInit = function () {
            ctrl.getMessages();
        };
        ctrl.getMessages = function () {
            $http
                .get('vk/getCustomerMessages', {
                    params: {
                        customerId: ctrl.customerId,
                    },
                })
                .then((response) => {
                    ctrl.messages = response.data;
                });
        };
        ctrl.sendVkMessage = function () {
            $http
                .post('vk/sendVkMessage', {
                    userId: ctrl.userId,
                    message: ctrl.answerText,
                })
                .then((response) => {
                    if (response.data.result === true) {
                        toaster.pop('success', '', $translate.instant('Admin.Js.VkMessages.MessageSent'));
                        ctrl.answerText = '';
                    } else {
                        toaster.pop('error', '', $translate.instant('Admin.Js.VkMessages.MessageNotSent'));
                    }
                    ctrl.getMessages();
                });
        };
    };
    VkMessagesCtrl.$inject = ['$http', 'toaster', '$translate'];
    ng.module('vkMessages', []).component('vkMessages', {
        templateUrl: vkMessagesTemplate,
        controller: VkMessagesCtrl,
        bindings: {
            customerId: '<?',
            userId: '<?',
        },
    });
})(window.angular);
