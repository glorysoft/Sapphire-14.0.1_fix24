(function (ng) {
    

    const LpGridColumnsCtrl = function ($transclude, lpGridTypes) {
        const ctrl = this;

        ctrl.$onInit = function () {};
    };

    ng.module('lpGrid').controller('LpGridColumnsCtrl', LpGridColumnsCtrl);

    LpGridColumnsCtrl.$inject = ['$transclude', 'lpGridTypes'];
})(window.angular);
