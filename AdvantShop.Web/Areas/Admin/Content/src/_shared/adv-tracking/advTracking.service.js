(function (ng) {
    

    const advTrackingService = function ($http) {
        const service = this;

        service.trackEvent = function (eventKey, eventKeyPostfix) {
            return $http
                .get(
                    `advantshopTracking/trackEvent?eventKey=${ 
                        eventKey 
                        }${eventKeyPostfix && eventKeyPostfix.length ? `&eventKeyPostfix=${  eventKeyPostfix}` : ''}`,
                )
                .then((response) => response.data);
        };
    };

    advTrackingService.$inject = ['$http'];

    ng.module('advTracking', []).service('advTrackingService', advTrackingService);
})(window.angular);
