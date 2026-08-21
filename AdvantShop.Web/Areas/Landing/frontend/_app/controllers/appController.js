(function (ng) {
    

    const AppCtrl = function ($window) {};

    AppCtrl.$inject = ['$window'];

    const module = ng.module('app');

    module.controller('AppCtrl', AppCtrl);
})(window.angular);
