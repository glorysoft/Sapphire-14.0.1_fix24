(function (ng) {
    

    const SettingsCrmCtrl = function (toaster, $translate, $window, leadsService, $location, isMobileService, settingsCrmService) {
        const ctrl = this;

        ctrl.$onInit = function () {
            //ctrl.getSaasData();
            ctrl.getSalesFunnels();
            ctrl.getOrderStatuses();
        };

        ctrl.salesFunnelsOnInit = function (salesFunnels) {
            ctrl.salesFunnels = salesFunnels;
        };

        ctrl.getSalesFunnels = function () {
            settingsCrmService.getSalesFunnels().then((response) => (ctrl.funnels = response.data));
        };

        ctrl.getOrderStatuses = function () {
            settingsCrmService.getOrderStatuses().then((response) => (ctrl.statuses = response.data));
        };

        ctrl.updateFunnels = function () {
            ctrl.getSalesFunnels();

            leadsService.updateList();
        };

        ctrl.saveDefaultSalesFunnelId = function () {
            settingsCrmService.saveDefaultSalesFunnelId(ctrl.DefaultSalesFunnelId).then((response) => {
                if (response.data.result) {
                    toaster.success('', $translate.instant('Admin.Js.SettingsCrm.ChangesSuccessfullySaved'));
                }
            });
        };

        ctrl.saveOrderStatusIdFromLead = function () {
            settingsCrmService.saveOrderStatusIdFromLead(ctrl.OrderStatusIdFromLead).then((response) => {
                if (response.data.result) {
                    toaster.success('', $translate.instant('Admin.Js.SettingsCrm.ChangesSuccessfullySaved'));
                }
            });
        };

        ctrl.setCrmActive = function (active) {
            if (isMobileService.getValue()) {
                ctrl.crmActive = active;
            } else {
                settingsCrmService
                    .setCrmActive(active)
                    .then((response) => {
                        if (response.data.result) {
                            toaster.success('', $translate.instant('Admin.Js.SettingsCrm.ChangesSuccessfullySaved'));
                        }
                    })
                    .then((res) => {
                        $window.location.reload();
                    });
            }
        };

        ctrl.pushForm = function () {
            settingsCrmService
                .setCrmActive(ctrl.crmActive)
                .then((response) => {
                    if (response.data.result) {
                        toaster.success('', $translate.instant('Admin.Js.SettingsCrm.ChangesSuccessfullySaved'));
                    }
                })
                .then((res) => {
                    $window.location.reload();
                });
        };

        //ctrl.getSaasData = function () {
        //    return $http.get('settingsCrm/getIntegrationsData').then(function (response) {
        //        if (response.data != null) {
        //            ctrl.saasData = {
        //                limit: response.data.limit,
        //                count: response.data.count,
        //                limitRiched: response.data.limitRiched
        //            };
        //        }
        //    });
        //};

        ctrl.onSelectTab = function (indexTab) {
            ctrl.tabActiveIndex = indexTab;
        };
    };

    SettingsCrmCtrl.$inject = ['toaster', '$translate', '$window', 'leadsService', '$location', 'isMobileService', 'settingsCrmService'];

    ng.module('settingsCrm', [
        'dealStatuses',
        'as.sortable',
        'facebookAuth',
        'salesFunnels',
        'integrationsLimit',
        'leadFieldsList',
        'lead',
        'leads',
        'callRecord',
        'yaru22.angular-timeago',
        'import',
        'ngFileUpload',
        'color.picker',
        'fileUploader',
        'productsSelectvizr',
        'isMobile',
    ]).controller('SettingsCrmCtrl', SettingsCrmCtrl);
})(window.angular);
