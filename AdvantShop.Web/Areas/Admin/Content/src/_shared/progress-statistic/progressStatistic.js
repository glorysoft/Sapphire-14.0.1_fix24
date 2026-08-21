(function (ng) {
    

    /* @ngInject */
    const RecalcCtrl = function ($http) {
        const ctrl = this;

        ctrl.recalc = function () {
            $http.post('catalog/recalculateproductscount').then((response) => {
                location.reload();
            });
        };
    };

    ng.module('recalc', []).controller('RecalcCtrl', RecalcCtrl).component('recalcTrigger', {
        template: '<a href="" data-ng-click="$ctrl.recalc()" ng-transclude></a>',
        controller: RecalcCtrl,
        transclude: true,
    });
})(window.angular);
