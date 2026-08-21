(function (ng) {
    

    const LpMenuTriggerCtrl = function ($attrs, lpMenuService) {
        const ctrl = this;

        ctrl.$onInit = function () {
            ctrl.id = $attrs.lpMenuTrigger;
        };

        ctrl.open = function () {
            lpMenuService.open(ctrl.id);
        };

        ctrl.close = function () {
            lpMenuService.close(ctrl.id);
        };
    };

    ng.module('lpMenu').controller('LpMenuTriggerCtrl', LpMenuTriggerCtrl);

    LpMenuTriggerCtrl.$inject = ['$attrs', 'lpMenuService'];
})(window.angular);
