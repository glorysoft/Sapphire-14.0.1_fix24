(function (ng) {
    

    ng.module('lpSettings').directive('lpSettingsTrigger', () => ({
            controller: 'LpSettingsTriggerCtrl',
            controllerAs: 'lpSettingsTrigger',
            bindToController: true,
            scope: true,
            link (scope, element, attrs, ctrl) {
                ctrl.lpId = attrs.lpId;
            },
        }));
})(window.angular);
