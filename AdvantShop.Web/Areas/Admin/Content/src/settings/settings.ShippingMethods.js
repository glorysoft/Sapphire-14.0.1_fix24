const SettingsShippingMethodsCtrl = function () {
    const ctrl = this;

    ctrl.onSelectTab = function (indexTab) {
        ctrl.tabActiveIndex = indexTab;
    };
};
angular.module('settingsShippingMethods', ['isMobile', 'shippingRules']).controller('SettingsShippingMethodsCtrl', SettingsShippingMethodsCtrl);
