/* @ngInject */
const ShippingSdekSelectCityCtrl = function($http) {
    const ctrl = this;

    ctrl.$onInit = function() {
        ctrl.findCity(ctrl.sdekCityName)
            .then(cities => {
                ctrl.sdekCity = cities.find(item => item.cityCode === ctrl.sdekCityId);
            });
    };

    ctrl.findCity = function(val) {
        return $http.get('shippingMethods/findcityforsdek', { params: { q: val } }).then((response) => {
            ctrl.cities = response.data;
            return ctrl.cities;
        });
    };
};

angular.module('shippingMethod')
    .controller('ShippingSdekSelectCityCtrl', ShippingSdekSelectCityCtrl)
    .component('sdekSelectCity', {
        templateUrl: 'sdekSelectCity/tpl.html',
        controller: 'ShippingSdekSelectCityCtrl',
        bindings: {
            sdekCityName: '@',
            sdekCityId: '@',
        },
    });

