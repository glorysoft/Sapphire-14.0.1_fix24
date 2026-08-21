(function (ng) {
    

    const CurrencyCtrl = function ($http) {
        const ctrl = this;

        ctrl.changeCurrency = function (currency) {
            $http.get('/Common/SetCurrency', { params: { currencyISO: currency, rnd: Math.random() } }).then((response) => {
                window.location.reload();
            });
        };
    };

    angular.module('currency').controller('currencyController', CurrencyCtrl);

    CurrencyCtrl.$inject = ['$http'];
})(window.angular);
