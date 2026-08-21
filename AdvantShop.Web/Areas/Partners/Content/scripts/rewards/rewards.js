(function (ng) {
    

    const RewardsCtrl = function ($http, toaster) {
        const ctrl = this;

        ctrl.saveNaturalPersonPaymentData = function (form) {
            $http
                .post('rewards/saveNaturalPersonPaymentData', {
                    paymentTypeId: ctrl.paymentTypeId,
                    paymentAccountNumber: ctrl.paymentAccountNumber,
                })
                .then((response) => {
                    const data = response.data;
                    if (data.result == true) {
                        toaster.success('', 'Изменения сохранены');
                        form.$setPristine();
                    }
                });
        };
    };

    RewardsCtrl.$inject = ['$http', 'toaster'];

    ng.module('rewards', []).controller('RewardsCtrl', RewardsCtrl);
})(window.angular);
