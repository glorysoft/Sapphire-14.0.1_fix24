(function (ng) {
    

    const BlocksConstructorFormSettingsTabCtrl = function ($scope, $element, $parse, $attrs) {
        const ctrl = this;

        ctrl.$onInit = function () {
            ctrl.blocksConstructorFormSettings.addTab($parse($attrs.header)($scope), $element.html(), $scope);
        };
    };

    ng.module('blocksConstructor').controller('BlocksConstructorFormSettingsTabCtrl', BlocksConstructorFormSettingsTabCtrl);

    BlocksConstructorFormSettingsTabCtrl.$inject = ['$scope', '$element', '$parse', '$attrs'];
})(window.angular);
