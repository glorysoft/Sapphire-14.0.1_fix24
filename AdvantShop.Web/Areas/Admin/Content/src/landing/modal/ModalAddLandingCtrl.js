(function (ng) {
    

    const ModalAddLandingCtrl = function ($uibModalInstance, $http, $window, toaster) {
        const ctrl = this;

        ctrl.$onInit = function () {
            const params = ctrl.$resolve || {};
            ctrl.siteId = params.siteId;
        };

        ctrl.close = function () {
            $uibModalInstance.dismiss('cancel');
        };

        ctrl.addLanding = function () {
            if (ctrl.name == '') return;

            const params = {
                name: ctrl.name,
                type: ctrl.type,
                productIds: ctrl.productIds,
                goal: ctrl.goal,
                siteId: ctrl.siteId,
            };

            $http.post('funnels/add', params).then((response) => {
                const data = response.data;
                if (data.result == true) {
                    $window.location.assign(data.url);
                    $uibModalInstance.close();
                } else {
                    data.errors.forEach((err) => {
                        toaster.pop('error', '', err);
                    });
                }
            });
        };
    };

    ModalAddLandingCtrl.$inject = ['$uibModalInstance', '$http', '$window', 'toaster'];

    ng.module('uiModal').controller('ModalAddLandingCtrl', ModalAddLandingCtrl);
})(window.angular);
