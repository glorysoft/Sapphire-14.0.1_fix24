(function (ng) {
    

    const NewsItemCtrl = function ($http, $window, SweetAlert, $translate) {
        const ctrl = this;
        ctrl.PhotoId = 0;

        ctrl.deleteNewsItem = function (id) {
            SweetAlert.confirm($translate.instant('Admin.Js.NewsItem.AreYouSureDelete'), {
                title: $translate.instant('Admin.Js.NewsItem.Deleting'),
            }).then((result) => {
                if (result === true || result.value) {
                    $http.post('News/DeleteNewsItem', { newsId: id }).then((response) => {
                        $window.location.assign('news');
                    });
                }
            });
        };

        ctrl.changePhoto = function (result) {
            ctrl.PhotoId = result.pictureId;
        };
    };

    NewsItemCtrl.$inject = ['$http', '$window', 'SweetAlert', '$translate'];

    ng.module('newsItem', ['uiGridCustom', 'urlGenerator', 'newsProducts', 'ngCkeditor']).controller('NewsItemCtrl', NewsItemCtrl);
})(window.angular);
