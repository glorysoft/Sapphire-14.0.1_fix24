(function (ng) {
    

    const SettingsCtrl = function ($http, toaster) {
        const ctrl = this;

        ctrl.saveCommonInfo = function (form) {
            $http.post('settings/saveCommonInfo', ctrl.common).then((response) => {
                const data = response.data;
                if (data.result == true) {
                    toaster.success('', 'Изменения сохранены');
                    form.$setPristine();
                }
            });
        };
    };

    SettingsCtrl.$inject = ['$http', 'toaster'];

    ng.module('settings', []).controller('SettingsCtrl', SettingsCtrl);
})(window.angular);
