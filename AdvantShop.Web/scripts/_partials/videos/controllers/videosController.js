/* @ngInject */
function VideosCtrl($http, $sce, $scope, $timeout) {
    const ctrl = this;

    ctrl.$onInit = function () {
        $scope.$watch('videos.videoId', (newVal) => {
            if (newVal) {
                ctrl.getVideoById(newVal).then(response => ctrl.processResult([response.data]));
            }
        });

        $scope.$watch('videos.productId', (newVal) => {
            if (newVal) {
                ctrl.getVideos(newVal).then(response => ctrl.processResult(response.data));
            }
        });
    };

    ctrl.getVideos = function (newVal) {
        return $http.get('productExt/getvideos', {params: {productId: newVal}});
    };

    ctrl.getVideoById = function (newVal) {
        return $http.get('productExt/getVideoById', {params: {videoId: newVal}});
    };

    ctrl.processResult = function (data) {
        ctrl.videos = data;

        for (let i = 0; i < ctrl.videos.length; i++) {
            ctrl.videos[i].PlayerCode = $sce.trustAsHtml(ctrl.videos[i].PlayerCode);
        }

        if (ctrl.onReceive) {
            $timeout(() => {
                ctrl.onReceive({});
            });
        }

        return data;
    }
}

export default VideosCtrl;
