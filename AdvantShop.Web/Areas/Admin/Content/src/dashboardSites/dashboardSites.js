(function (ng) {


    const DashboardSitesCtrl = function ($uibModal, $http, $sce, SweetAlert, toaster, $translate) {
        const ctrl = this;

        ctrl.$onInit = function () {
            ctrl.initScaleIframe = [];
            ctrl.isLoadedDashboard = false;
            ctrl.siteIframes = {};
            ctrl.getDashBoard();
        };

        ctrl.scrollToActiveElement = function (id, url) {
            ctrl.siteIframes[id] = url;
        };

        ctrl.getUrl = function (url) {
            return url != null ? $sce.trustAsResourceUrl(url) : null;
        };

        ctrl.deleteSite = function (site) {
            SweetAlert.confirm($translate.instant('Js.Admin.Content.DashboardSites.SureWantDelete'), { title: $translate.instant('Js.Admin.Content.DashboardSites.Removal'),
                cancelButtonText: $translate.instant('Admin.Js.Cancel')}).then((result) => {
                if (result && !result.dismiss) {
                    $http.post('dashboard/deleteSite', { id: site.Id, type: site.Type }).then((response) => {
                        toaster.pop('success', '', $translate.instant('Js.Admin.Content.DashboardSites.SuccessfullyDeleted'));
                        window.location.reload();
                    });
                }
            });
        };

        ctrl.createScreenShots = function () {
            $http.post('dashboard/createScreenShots').then((response) => {
                window.location.reload();
            });
        };

        ctrl.getDashBoard = function () {
            $http
                .get('dashboard/getDashBoard')
                .then((response) => {
                    ctrl.data = response.data;
                })
                .finally(() => {
                    ctrl.isLoadedDashboard = true;
                });
        };

        ctrl.changeEnabled = function (site) {
            $http.post('dashboard/changeEnabled', { id: site.Id, type: site.Type, enabled: !site.Published }).then((response) => {
                if (response.data.result) {
                    site.Published = !site.Published;
                    toaster.pop('success', '', 'Изменения успешно сохранены');
                }
            });
        };

        ctrl.scaleIframeDashboardSites = function (item) {
            if (window.matchMedia('(max-width: 1170px)').matches == true) {
                return { transform: `scale(${((window.innerWidth - 32) / 1170).toFixed(2)})` };
            }
            return {};
        };
    };

    DashboardSitesCtrl.$inject = ['$uibModal', '$http', '$sce', 'SweetAlert', 'toaster', '$translate'];

    ng.module('dashboardSites', ['changeAdminShopName', 'uiModal']).controller('DashboardSitesCtrl', DashboardSitesCtrl);
})(window.angular);
