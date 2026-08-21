(function (ng) {
    

    const StorePageCtrl = function ($http, $window, SweetAlert, $translate) {
        const ctrl = this;

        ctrl.$onInit = function () {
            ctrl.tab = '0';
        };

        ctrl.changeTab = function (tab) {
            if (tab != null) {
                ctrl.tab = tab;
            }
            //$location.search(TAB_SEARCH_NAME, ctrl.tab);
        };
    };

    StorePageCtrl.$inject = ['$http', '$window', 'SweetAlert', '$translate'];

    ng.module('storePage', []).controller('StorePageCtrl', StorePageCtrl);
})(window.angular);
