(function (ng) {
    

    const windowService = function ($window) {
        const service = this,
            windowElement = angular.element($window),
            callbackList = {};

        service.print = function (url, name, parameters) {
            const wPrintOrder = $window.open(url, name, parameters);
            wPrintOrder.onload = wPrintOrder.print;
            wPrintOrder.focus();

            return wPrintOrder;
        };

        service.addCallback = function (eventName, callback) {
            if (callbackList[eventName] == null) {
                callbackList[eventName] = [];
                service.addBindEvent(eventName);
            }

            callbackList[eventName].push(callback);
        };

        service.addBindEvent = function (eventName) {
            windowElement.on(eventName, (event) => {
                service.processCallbacks(eventName, event);
            });
        };

        service.processCallbacks = function (eventName, event) {
            const eventFunctions = callbackList[eventName];

            for (let i = eventFunctions.length - 1; i >= 0; i--) {
                eventFunctions[i]({ event });
            }
        };
    };

    angular.module('windowExt').service('windowService', windowService);

    windowService.$inject = ['$window'];
})(window.angular);
