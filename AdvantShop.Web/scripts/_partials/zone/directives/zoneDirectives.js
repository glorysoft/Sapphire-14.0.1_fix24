import dialogTemplate from '../templates/dialog.html';

angular.module('zone').directive('zoneDialogTrigger', [
    'zoneService',
    function (zoneService) {
        return {
            restrict: 'A',
            scope: {
                showImmediately: '<?',
            },
            link(scope, element) {
                const onClickHandler = (event) => {
                    event.stopPropagation();
                    scope.$apply(zoneService.zoneDialogOpen);
                };

                element.on('click', onClickHandler);

                if (scope.showImmediately) {
                    zoneService.zoneDialogOpen({ showImmediately: scope.showImmediately });
                }

                scope.$on('$destroy', () => {
                    element.off('click', onClickHandler);
                });
            },
        };
    },
]);

angular.module('zone').directive('zoneDialog', () => ({
    restrict: 'A',
    scope: {
        hideCountries: '<?',
        hideSearch: '<?',
    },
    replace: true,
    templateUrl: dialogTemplate,
    controller: 'ZoneCtrl',
    controllerAs: 'zone',
    bindToController: true,
}));

angular.module('zone').directive('zoneCurrent', [
    'zoneService',
    '$parse',
    function (zoneService, $parse) {
        return {
            restrict: 'A',
            scope: true,
            link(scope, _element, attrs) {
                const startVal = $parse(attrs.startVal)(scope);
                if (startVal) {
                    scope.zone = startVal;
                }
                zoneService.getCurrentZone().then((data) => {
                    if (!data.City && startVal?.City) {
                        data.City = startVal.City;
                    }

                    if (data) {
                        scope.zone = zoneService.trustZone(data);
                    } else {
                        scope.zone = {};

                        if (startVal) {
                            angular.extend(scope.zone, zoneService.trustZone(startVal));
                        }

                        zoneService.addUpdateList(scope);

                        zoneService.getCurrentZone().then((responseData) => {
                            scope.zone = zoneService.trustZone(responseData);
                        });
                    }
                });
            },
        };
    },
]);

angular.module('zone').directive('zonePopover', () => ({
    restrict: 'A',
    scope: true,
    controller: 'ZonePopoverCtrl',
    controllerAs: 'zonePopover',
}));

angular.module('zone').directive('zoneAddCallback', [
    'zoneService',
    '$parse',
    function (zoneService, $parse) {
        return {
            restrict: 'A',
            link(scope, _element, attrs) {
                const objCallback = $parse(attrs.zoneAddCallback)(scope);
                if (objCallback?.callback && objCallback?.callbackName) {
                    zoneService.addCallback(objCallback.callbackName, objCallback.callback);
                }
            },
        };
    },
]);
