(function (ng) {
    

    const LpMenuStateCtrl = function ($attrs, lpMenuService) {
        const ctrl = this;

        ctrl.$postLink = function () {
            ctrl.data = lpMenuService.addInStorage($attrs.lpMenuState);
        };
    };

    ng.module('lpMenu').controller('LpMenuStateCtrl', LpMenuStateCtrl);

    LpMenuStateCtrl.$inject = ['$attrs', 'lpMenuService'];
})(window.angular);
