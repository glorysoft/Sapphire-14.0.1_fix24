(function (ng) {
    

    const modalVideoService = function ($window) {
        const service = this;
        const onChangeMQCallbackList = [];
        let isSetMq = false;

        service.setMQ = function (mqString) {
            if (!isSetMq) {
                isSetMq = true;
                service.mqState = $window.matchMedia(mqString);
                service.mqState.addListener((event) => {
                    onChangeMQCallbackList.forEach((callback) => {
                        callback(service.mqState.matches);
                    });
                });
            }
        };

        service.addCallbackOnChangeMQ = function (callback) {
            onChangeMQCallbackList.push(callback);
        };

        service.getMQState = function () {
            return service.mqState.matches;
        };
    };

    ng.module('modalVideo').service('modalVideoService', modalVideoService);

    modalVideoService.$inject = ['$window'];
})(window.angular);
