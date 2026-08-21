(function (ng) {
    

    const ModalBookingServicesAnalyticsCtrl = function ($translate) {
        const ctrl = this;

        ctrl.$onInit = function () {
            const params = ctrl.$resolve.params;
            ctrl.affiliateId = params.affiliateId;
            ctrl.reservationResourceId = params.reservationResourceId;
            ctrl.dateFrom = params.dateFrom;
            ctrl.dateTo = params.dateTo;
            ctrl.paid = params.paid;
            ctrl.status = params.status;
            ctrl.noStatus = params.noStatus;
        };
    };

    ModalBookingServicesAnalyticsCtrl.$inject = ['$translate'];

    ng.module('uiModal').controller('ModalBookingServicesAnalyticsCtrl', ModalBookingServicesAnalyticsCtrl);
})(window.angular);
