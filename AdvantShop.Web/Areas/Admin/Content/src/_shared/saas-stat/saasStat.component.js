(function (ng) {
    

    ng.module('saasStat').directive('saasStat', () => ({
            scope: true,
            controller: 'SaasStatCTrl',
            controllerAs: 'saasStat',
            bindToController: true,
        }));
})(window.angular);
