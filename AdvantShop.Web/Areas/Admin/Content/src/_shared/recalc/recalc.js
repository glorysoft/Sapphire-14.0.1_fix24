(function (ng) {
    

    const RecalcCtrl = function ($http) {
        const ctrl = this;

        ctrl.recalc = function () {
            $http.post('catalog/recalculateproductscount').then(() => {
                location.reload();
            });
        };
    };

    RecalcCtrl.$inject = ['$http'];

    ng.module('recalc', [])
        .controller('RecalcCtrl', RecalcCtrl)
        .component('recalcTrigger', {
            template:
                '</div><a href="" ng-class="{\'{{$ctrl.cssClass}}\' : $ctrl.cssClass != null}" data-ng-click="$ctrl.recalc()" ng-transclude></a>',
            bindings: {
                cssClass: '@',
            },
            controller: RecalcCtrl,
            transclude: true,
        });
})(window.angular);
