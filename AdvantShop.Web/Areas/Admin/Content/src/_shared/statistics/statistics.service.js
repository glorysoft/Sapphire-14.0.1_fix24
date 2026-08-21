(function (ng) {
    

    const lastStatisticsService = function ($document, $http) {
        let service = this,
            timer,
            data = null,
            documentIsVisible = $document[0].visibilityState === 'visible';

        service.getLastStatistics = function () {
            if (documentIsVisible === true) {
                $http.get('common/getLastStatistics', { params: { rnd: Math.random() } }).then((response) => {
                    data = response.data;
                    if (timer != null) {
                        clearTimeout(timer);
                    }
                    timer = setTimeout(() => {
                        service.getLastStatistics();
                    }, 30 * 1000);
                });
            }
        };

        service.getLastStatistics();

        service.getData = function () {
            return data;
        };

        $document.on('visibilitychange', () => {
            documentIsVisible = $document[0].visibilityState === 'visible';

            if (documentIsVisible === true) {
                service.getLastStatistics();
            }
        });
    };

    lastStatisticsService.$inject = ['$document', '$http'];

    ng.module('statistics').service('lastStatisticsService', lastStatisticsService);
})(window.angular);
