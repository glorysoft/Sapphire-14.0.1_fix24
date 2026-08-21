(function (ng) {
    

    const leadsService = function ($http) {
        const service = this,
            _list = [],
            promiseData = [];

        service.addLeadsList = function (leadsList) {
            _list.push(leadsList);
        };

        service.updateList = function () {
            _list.forEach((item) => {
                item.update();
            });
        };

        service.fetchDataList = function (excludeLeadListId) {
            let index;

            for (let i = 0, len = promiseData.length; len < i; i++) {
                if (promiseData[i].excludeLeadListId === excludeLeadListId) {
                    index = i;
                    break;
                }
            }

            if (index != null) {
                return promiseData[index].promise;
            }

            const promise = $http
                .get('./leads/salesFunnelsMenu', {
                    params: { rnd: Math.random(), excludeLeadListId: excludeLeadListId || 0 },
                })
                .then((response) => response.data)
                .finally(() => {
                    let index;

                    for (let i = 0, len = promiseData.length; i, len; i++) {
                        if (promiseData[i].excludeLeadListId === excludeLeadListId) {
                            index = i;
                            break;
                        }
                    }

                    promiseData.splice(index, 1);
                });

            promiseData.push({
                excludeLeadListId,
                promise,
            });

            return promise;
        };
    };

    leadsService.$inject = ['$http'];

    ng.module('leads').service('leadsService', leadsService);
})(window.angular);
