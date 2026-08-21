import bookingCategoriesTreeviewTemplate from './templates/bookingCategoriesTreeview.html';
(function (ng) {
    

    ng.module('bookingCategoriesTreeview').component('bookingCategoriesTreeview', {
        templateUrl: bookingCategoriesTreeviewTemplate,
        controller: 'BookingCategoriesTreeviewCtrl',
        bindings: {
            categoryIdSelected: '@',
            affiliateId: '@',
            onInit: '&',
        },
    });
})(window.angular);
