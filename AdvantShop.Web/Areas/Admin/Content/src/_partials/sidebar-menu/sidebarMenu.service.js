(function (ng) {
    

    const CSS_ANIMATION_DELAY = 300;

    const sidebarMenuService = function ($cookies, $timeout) {
        const service = this;
        const KEY = 'adminSidebarMenu';
        const callbacks = [];
        const callbacksMenuStates = [];

        service.getState = function () {
            return $cookies.getObject(KEY) || false;
        };

        service.setState = function (value) {
            $cookies.putObject(KEY, value);
            return value;
        };

        service.toggle = function () {
            const state = service.getState();
            const stateNew = !state;
            service.setState(stateNew);

            service.processMenuStatesCallback(stateNew);

            $timeout(() => {
                service.processCallback(stateNew);
            }, CSS_ANIMATION_DELAY);
        };

        service.addCallback = function (fn) {
            callbacks.push(fn);
        };

        service.addCallbackForMenuStates = function (fn) {
            callbacksMenuStates.push(fn);
        };

        service.processCallback = function (value) {
            callbacks.forEach((fn) => {
                fn(value);
            });
        };

        service.processMenuStatesCallback = function (value) {
            callbacksMenuStates.forEach((fn) => {
                fn(value);
            });
        };
    };

    sidebarMenuService.$inject = ['$cookies', '$timeout'];

    ng.module('sidebarMenu').service('sidebarMenuService', sidebarMenuService);
})(window.angular);
