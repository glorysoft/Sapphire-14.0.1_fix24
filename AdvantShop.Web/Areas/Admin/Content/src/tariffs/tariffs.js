(function (ng) {
    

    const TariffsCtrl = function (lastStatisticsService) {
        const ctrl = this;
        window.addEventListener('message', (e) => {
            if (e.data === 'reCountIndicatorsAcademy') {
                lastStatisticsService.getLastStatistics();
            }
        });
    };

    TariffsCtrl.$inject = ['lastStatisticsService'];

    ng.module('tariffs', []).controller('TariffsCtrl', TariffsCtrl);
})(window.angular);
