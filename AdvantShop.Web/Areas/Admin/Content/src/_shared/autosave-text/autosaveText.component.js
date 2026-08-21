(function (ng) {
    

    const AutoSaveTextCtrl = function ($attrs, $http, toaster) {
        const ctrl = this;

        ctrl.save = function (paramName, parameters) {
            const params = {};
            params[paramName] = ctrl.ngModel.$viewValue;

            $http.post($attrs.url, ng.extend(params, parameters || {})).then((response) => {
                const data = response.data;
                if (data.result) {
                    toaster.pop('success', '', 'Изменения успешно сохранены');
                } else if (data.errors != null) {
                    data.errors.forEach((err) => {
                        toaster.pop('success', '', err);
                    });
                }
            });
        };
    };

    AutoSaveTextCtrl.$inject = ['$attrs', '$http', 'toaster'];

    ng.module('autosaveText', [])
        .controller('AutoSaveTextCtrl', AutoSaveTextCtrl)
        .directive('autosaveText', () => ({
                require: {
                    ngModel: 'ngModel',
                },
                scope: true,
                controller: AutoSaveTextCtrl,
                controllerAs: 'autosaveText',
                bindToController: true,
            }));
})(window.angular);
