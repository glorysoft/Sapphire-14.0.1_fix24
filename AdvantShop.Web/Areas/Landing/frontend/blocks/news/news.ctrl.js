(function (ng) {
    

    const NewsCtrl = function ($http) {
        const ctrl = this;

        ctrl.$onInit = function () {
            ctrl.page = 0;
            ctrl.newsData = [];
            ctrl.inProgress = false;
        };

        ctrl.getItems = function (blockId, take, skip) {
            ctrl.inProgress = true;
            ctrl.page += 1;
            return ctrl
                .fetchData(blockId, take, skip)
                .then((data) => {
                    ctrl.newsData = ctrl.newsData.concat(data.obj);

                    return data;
                })
                .finally(() => {
                    ctrl.inProgress = false;
                });
        };

        ctrl.fetchData = function (blockId, take, skip) {
            return $http
                .get('landing/landing/GetPagingFromSettingsWithRows', {
                    params: { blockId, take, skip },
                })
                .then((response) => response.data);
        };
    };

    ng.module('news').controller('NewsCtrl', NewsCtrl);

    NewsCtrl.$inject = ['$http'];
})(window.angular);
