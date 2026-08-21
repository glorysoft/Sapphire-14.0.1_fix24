(function (ng) {
    

    const SettingsAuthCallCtrl = function ($http) {
        const ctrl = this;

        ctrl.getAuthCallMods = function (moduleId) {
            $http.get('settingsAuthCall/getAuthCallMods', { params: { moduleStringId: moduleId } }).then((response) => {
                ctrl.AuthCallMods = response.data;
                ctrl.AuthCallMode = '0';
            });
        };
    };

    SettingsAuthCallCtrl.$inject = ['$http'];

    ng.module('settingsAuthCall', []).controller('SettingsAuthCallCtrl', SettingsAuthCallCtrl);
})(window.angular);
