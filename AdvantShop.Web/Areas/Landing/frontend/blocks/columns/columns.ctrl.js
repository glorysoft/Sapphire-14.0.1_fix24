(function (ng) {
    

    const ColumnsCtrl = function ($http) {
        const ctrl = this;

        ctrl.$onInit = function () {
            ctrl.page = 0;
            ctrl.columnsData = [];
            ctrl.inProgress = false;
        };

        ctrl.getItems = function (blockId, take, skip, modelName) {
            ctrl.inProgress = true;
            ctrl.page += 1;
            return ctrl
                .fetchData(blockId, take, skip, modelName)
                .then((data) => {
                    ctrl.columnsData = ctrl.columnsData.concat(data.obj);

                    return data;
                })
                .finally(() => {
                    ctrl.inProgress = false;
                });
        };

        ctrl.fetchData = function (blockId, take, skip, modelName) {
            return $http
                .get('landing/landing/GetPagingFromSettingsWithRows', {
                    params: { blockId, take, skip, modelName },
                })
                .then((response) => response.data);
        };
    };

    ng.module('columns').controller('ColumnsCtrl', ColumnsCtrl);

    ColumnsCtrl.$inject = ['$http'];
})(window.angular);
