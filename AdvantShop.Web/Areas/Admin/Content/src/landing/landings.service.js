(function (ng) {
    

    const landingsService = function ($http, $uibModal) {
        const service = this;

        service.getLandings = function (page, size, search) {
            return $http
                .get('funnels/getLandings', {
                    params: { rnd: Math.random(), page, itemsPerPage: size, search },
                })
                .then((response) => response.data);
        };

        service.deleteLanding = function (id) {
            return $http.post('funnels/deleteSiteLanding', { id }).then((response) => response.data);
        };

        service.updateTitle = function (id, value) {
            return $http.post('funnels/inplace', { id, name: value }).then((response) => response.data);
        };

        service.copyLandingPage = function (id) {
            return $http.post('funnels/copyLandingPage', { landingPageId: id }).then((response) => response.data);
        };

        service.copyLandingSite = function (id) {
            return $http.post('funnels/copyLandingSite', { landingSiteId: id }).then((response) => response.data);
        };
    };

    landingsService.$inject = ['$http', '$uibModal'];

    ng.module('landings').service('landingsService', landingsService);
})(window.angular);
