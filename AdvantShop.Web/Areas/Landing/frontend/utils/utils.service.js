(function (ng) {
    

    const utilsService = function () {
        const service = this;

        service.debounce = function (func, wait, immediate) {
            let timeout;
            return function executedFunction() {
                const context = this;
                const args = arguments;

                const later = function () {
                    timeout = null;
                    if (!immediate) func.apply(context, args);
                };

                const callNow = immediate && !timeout;

                clearTimeout(timeout);

                timeout = setTimeout(later, wait);

                if (callNow) func.apply(context, args);
            };
        };

        service.throttle = function (func, time) {
            return function (args) {
                const previousCall = this.lastCall;
                this.lastCall = Date.now();
                if (previousCall === undefined || this.lastCall - previousCall > time) {
                    func(args);
                }
            };
        };
    };

    ng.module('utils', []).service('utilsService', utilsService);
})(window.angular);
