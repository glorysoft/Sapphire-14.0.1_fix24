(function (ng) {
    

    const ShippingPecSelectCityCtrl = function ($http, toaster) {
        const ctrl = this;

        ctrl.findCity = function (val) {
            return $http.post('shippingMethods/findcityforpec', { q: val, login: ctrl.login, apiKey: ctrl.apiKey }).then((response) => {
                const data = response.data;
                if (data.result === true) {
                    return data.obj;
                }
                data.errors.forEach((error) => {
                    toaster.pop('error', '', error);
                });
            });
        };

        ctrl.selectCity = function (result) {
            if (result != null) {
                ctrl.cityId = result.CityId || result.BranchId;
                ctrl.cityName = (result.CityTitle ? `${result.CityTitle  }, ` : '') + result.BranchTitle;
            }
        };
    };

    ShippingPecSelectCityCtrl.$inject = ['$http', 'toaster'];

    ng.module('shippingMethod')
        .controller('ShippingPecSelectCityCtrl', ShippingPecSelectCityCtrl)
        .component('pecSelectCity', {
            templateUrl: 'pecSelectCity/tpl.html',
            controller: 'ShippingPecSelectCityCtrl',
            bindings: {
                cityName: '@',
                cityId: '@',
                login: '<',
                apiKey: '<',
            },
        });
})(window.angular);
