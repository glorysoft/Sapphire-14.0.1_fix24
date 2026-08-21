(function (ng) {
    

    const ModalAddAffiliateCtrl = function ($uibModalInstance, $http, $window, toaster, $translate) {
        const ctrl = this;

        ctrl.$onInit = function () {
            const params = ctrl.$resolve;
            ctrl.goToAffiliatePage = params.goToAffiliatePage;

            ctrl.name = '';
            ctrl.sortOrder = 0;
        };

        ctrl.close = function () {
            $uibModalInstance.dismiss('cancel');
        };

        ctrl.save = function () {
            const params = {
                name: ctrl.name,
                sortOrder: ctrl.sortOrder,
                bookingIntervalMinutes: 60,
            };

            $http.post('bookingAffiliate/addAffiliate', params).then((response) => {
                const data = response.data;
                if (data.result == true) {
                    toaster.pop('success', '', $translate.instant('Admin.Js.BookingAffiliate.AffiliateAdded'));
                    $uibModalInstance.close(data.obj);
                    if (ctrl.goToAffiliatePage === true) {
                        $window.location.assign(`bookingaffiliate/settings?id=${  data.obj}`);
                    }
                } else if (data.errors) {
                        data.errors.forEach((error) => {
                            toaster.pop('error', error);
                        });
                    } else {
                        toaster.pop(
                            'error',
                            $translate.instant('Admin.Js.BookingAffiliate.Error'),
                            $translate.instant('Admin.Js.BookingAffiliate.ErrorWhileCreating'),
                        );
                    }
            });
        };
    };

    ModalAddAffiliateCtrl.$inject = ['$uibModalInstance', '$http', '$window', 'toaster', '$translate'];

    ng.module('uiModal').controller('ModalAddAffiliateCtrl', ModalAddAffiliateCtrl);
})(window.angular);
