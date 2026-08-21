(function (ng) {
    

    ng.module('inplaceLanding').directive('inplaceLandingSwitch', () => ({
            restrict: 'A',
            scope: true,
            controller: 'InplaceLandingSwitchCtrl',
            controllerAs: 'inplaceLandingSwitch',
            bindToController: true,
        }));

    //#endregion
})(window.angular);
