(function (ng) {
    

    const BookingCategoriesCtrl = function () {
        const ctrl = this;

        ctrl.getListBookingData = function (data) {
            ctrl.listBookingData = data;
        };
    };

    BookingCategoriesCtrl.$inject = [];

    ng.module('bookingCategories', ['listBookingCategories']).controller('BookingCategoriesCtrl', BookingCategoriesCtrl);
})(window.angular);
