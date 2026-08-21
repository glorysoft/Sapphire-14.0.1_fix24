(function (ng) {
    

    const BrandCtrl = function ($http, $window, SweetAlert, $translate) {
        const ctrl = this;
        ctrl.PhotoId = 0;

        ctrl.updateImage = function (result) {
            ctrl.PhotoId = result.pictureId;
        };

        ctrl.deleteBrand = function (brandId) {
            SweetAlert.confirm($translate.instant('Admin.Js.Brand.AreYouSureDelete'), {
                title: $translate.instant('Admin.Js.Brand.Deleting'),
            }).then((result) => {
                if (result === true || result.value) {
                    $http.post('brands/deleteBrand', { brandId }).then((response) => {
                        //$window.location.assign('brands');
                        $window.location.assign('settingscatalog?catalogTab=brand');
                    });
                }
            });
        };
    };

    BrandCtrl.$inject = ['$http', '$window', 'SweetAlert', '$translate'];

    ng.module('brand', ['uiGridCustom', 'urlGenerator']).controller('BrandCtrl', BrandCtrl);
})(window.angular);
