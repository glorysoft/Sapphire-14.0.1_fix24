/* @ngInject */
const ShippingYandexSelectCityCtrl = function($http) {
    const ctrl = this;

    ctrl.$onInit = function () {
        ctrl.numberMethodId = Number(ctrl.methodId);
        ctrl.findCity(ctrl.yandexCityName)
            .then(cities => {
                ctrl.yandexCity = cities.find(item => item.Value === ctrl.yandexCityGeoId);
            });
    };

    ctrl.findCity = function(val) {
        return $http.get('shippingMethods/findcityforyandex', { params: { shippingMethodId: ctrl.numberMethodId, q: val } }).then((response) => {
            ctrl.cities = response.data;
            return ctrl.cities;
        });
    };
};

angular.module('shippingMethod')
    .controller('ShippingYandexSelectCityCtrl', ShippingYandexSelectCityCtrl)
    .component('yandexSelectCity', {
        templateUrl: 'yandexSelectCity/tpl.html',
        controller: 'ShippingYandexSelectCityCtrl',
        bindings: {
            yandexCityName: '@',
            yandexCityGeoId: '@',
            methodId: '@'
        },
    });

