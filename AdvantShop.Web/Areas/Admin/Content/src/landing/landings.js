import addLandingSiteTemplate from './../_shared/modal/addLandingSite/addLandingSite.html';
(function (ng) {
    

    const LandingsAdminCtrl = function ($translate, landingsService, SweetAlert, toaster, $uibModal, $window, $sce) {
        const ctrl = this;
        ctrl.$onInit = function () {
            ctrl.landingsIframe = {};
            ctrl.page = 1;
            ctrl.size = 20;
            ctrl.itemsHtml = [];
            ctrl.inProgress = false;
        };
        ctrl.deleteLanding = function (id) {
            SweetAlert.confirm($translate.instant('Admin.Js.GridCustomComponent.AreYouSureDelete'), {
                title: $translate.instant('Admin.Js.GridCustomComponent.Deleting'),
            }).then(() => {
                landingsService
                    .deleteLanding(id)
                    .then((response) => {
                        const data = response.result;
                        if (data === true) {
                            toaster.pop('success', '', $translate.instant('Admin.Js.GridCustom.ChangesSaved'));
                            $window.location.reload();
                        } else if (data.errors != null && data.errors.length > 0) {
                            toaster.pop('error', '', data.error.join('<br>'));
                        }
                    })
                    .catch((err) => {
                        console.error(err.message);
                    });
            });
        };
        ctrl.showModalCreate = function () {
            $uibModal.open({
                controller: 'ModalAddLandingSiteCtrl',
                controllerAs: 'ctrl',
                templateUrl: addLandingSiteTemplate,
                size: 'lg',
            });
        };
        ctrl.scrollToActiveElement = function (id, url) {
            ctrl.landingsIframe[id] = url;
        };
        ctrl.getUrl = function (url) {
            return url != null ? $sce.trustAsResourceUrl(url) : null;
        };
        ctrl.getMore = function () {
            ctrl.page += 1;
            ctrl.inProgress = true;
            landingsService
                .getLandings(ctrl.page, ctrl.size, ctrl.q)
                .then((result) => {
                    if (ctrl.q != null && ctrl.q.length > 0) {
                        ctrl.itemsHtml = ctrl.itemsHtml.concat(result);
                    } else {
                        ctrl.itemsHtml = [result];
                    }
                })
                .finally(() => {
                    ctrl.inProgress = false;
                });
        };
        ctrl.search = function () {
            ctrl.page = 1;
            ctrl.inProgress = true;
            landingsService
                .getLandings(ctrl.page, ctrl.size, ctrl.q)
                .then((result) => {
                    ctrl.itemsHtml = [];
                    if (ctrl.q != null && ctrl.q.length > 0) {
                        ctrl.itemsHtml = ctrl.itemsHtml.concat(result);
                    } else {
                        ctrl.itemsHtml = [result];
                    }
                })
                .finally(() => {
                    ctrl.inProgress = false;
                });
        };
    };
    LandingsAdminCtrl.$inject = ['$translate', 'landingsService', 'SweetAlert', 'toaster', '$uibModal', '$window', '$sce'];
    ng.module('landings', ['uiGridCustom']).controller('LandingsAdminCtrl', LandingsAdminCtrl);
})(window.angular);
