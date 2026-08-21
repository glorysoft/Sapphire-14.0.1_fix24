(function (ng) {
    

    const SwitcherStateCtrl = function ($translate) {
        const ctrl = this;

        ctrl.$onInit = function () {
            ctrl.checked = ctrl.checked || false;
            ctrl.invert = ctrl.invert || false;
            ctrl.textOn = ctrl.textOn || $translate.instant('Admin.Js.SwitcherState.Active');
            ctrl.textOff = ctrl.textOff || $translate.instant('Admin.Js.SwitcherState.Hide');
            ctrl.disabled = ctrl.disabled || false;
        };

        ctrl.changeState = function (checked) {
            ctrl.switcher(checked);
        };

        ctrl.switcher = function (checked) {
            if (checked !== ctrl.checked) {
                ctrl.checked = checked;

                if (ctrl.onChange != null) {
                    ctrl.onChange({ checked });
                }
            }
        };
    };

    SwitcherStateCtrl.$inject = ['$translate'];

    ng.module('switcherState', []).controller('SwitcherStateCtrl', SwitcherStateCtrl);
})(window.angular);
