import modalUserInfoPopupInviteTemplate from './modals/modalUserInfoPopupInvite.html';
import modalUserInfoPopupTemplate from './modals/modalUserInfoPopup.html';
(function (ng) {
    

    const userInfoPopupCtrl = function ($uibModal, $http) {
        const ctrl = this;
        ctrl.$onInit = function () {
            ctrl.getUserData()
                .then((data) => {
                    if (data != null && data.Show === true) {
                        if (Sweetalert2.isVisible()) {
                            // скрыть sweetalert, если открыты
                            Sweetalert2.close();
                        }
                        return ctrl.showStepOne(data).then((result) => {
                            if (ctrl.onFinish != null) {
                                ctrl.onFinish({});
                            }
                            return result;
                        });
                    }
                })
                .finally(() => {
                    if (ctrl.onClose != null) {
                        ctrl.onClose({});
                    }
                });
        };
        ctrl.getUserData = function () {
            return $http
                .get('home/getUserInformation', {
                    params: {
                        rnd: Math.random(),
                    },
                })
                .then((response) => response.data);
        };
        ctrl.showStepOne = function (data) {
            return $uibModal.open(
                {
                    windowClass: 'user-info-popup',
                    bindToController: true,
                    controller: 'ModalUserInfoPopupCtrl',
                    controllerAs: 'ctrl',
                    templateUrl: modalUserInfoPopupTemplate,
                    backdrop: false,
                    keyboard: false,
                    resolve: {
                        params: data,
                    },
                },
                true,
            ).result;
        };
        ctrl.showStepTwo = function () {
            return $uibModal.open(
                {
                    windowClass: 'user-info-popup',
                    bindToController: true,
                    controller: 'ModalUserInfoPopupInviteCtrl',
                    controllerAs: 'ctrl',
                    templateUrl: modalUserInfoPopupInviteTemplate,
                    backdrop: 'static',
                    keyboard: false,
                },
                true,
            ).result;
        };
    };
    userInfoPopupCtrl.$inject = ['$uibModal', '$http'];
    ng.module('userInfoPopup', []).controller('userInfoPopupCtrl', userInfoPopupCtrl);
})(window.angular);
