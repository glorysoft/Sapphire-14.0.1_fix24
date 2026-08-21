(function (ng) {
    

    ng.module('lpMenu').directive('lpMenuState', () => ({
            controller: 'LpMenuStateCtrl',
            controllerAs: 'lpMenuState',
            scope: true,
            bindToController: true,
        }));

    ng.module('lpMenu').directive('lpMenuTrigger', () => ({
            controller: 'LpMenuTriggerCtrl',
            controllerAs: 'lpMenuTrigger',
            scope: true,
            bindToController: true,
        }));
})(window.angular);
