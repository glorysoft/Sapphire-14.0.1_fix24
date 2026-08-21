(function (ng) {
    

    const ModalAddEditApiWebhookCtrl = function ($uibModalInstance, $http, toaster, $translate) {
        const ctrl = this;

        ctrl.$onInit = function () {
            const params = ctrl.$resolve.params;
            ctrl.mode = params ? 'edit' : 'add';
            ctrl.apiWebhook = params;

            ctrl.loadTypes();
        };

        ctrl.save = function () {
            ctrl.apiWebhook.EventTypeName = ctrl.eventTypes.find((item) => item.value == ctrl.apiWebhook.EventType).label;

            $uibModalInstance.close({
                apiWebhook: ctrl.apiWebhook,
            });
        };

        ctrl.loadTypes = function () {
            return $http.get('settingsApi/getEventTypes').then((response) => {
                if (response.data.result === true) {
                    ctrl.eventTypes = response.data.obj;
                } else {
                    response.data.errors.forEach((error) => {
                        toaster.pop('error', error);
                    });

                    if (!response.data.errors) {
                        toaster.pop('error', 'Не удалось загрузить события webhooks');
                    }
                }
            });
        };

        ctrl.close = function () {
            $uibModalInstance.dismiss('cancel');
        };
    };

    ModalAddEditApiWebhookCtrl.$inject = ['$uibModalInstance', '$http', 'toaster', '$translate'];

    ng.module('uiModal').controller('ModalAddEditApiWebhookCtrl', ModalAddEditApiWebhookCtrl);
})(window.angular);
