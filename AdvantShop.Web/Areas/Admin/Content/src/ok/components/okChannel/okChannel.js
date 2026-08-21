import okChannelTemplate from './okChannel.html';
(function (ng) {
    

    const okChannelCtrl = function ($window, toaster, SweetAlert, okService, $translate, isMobileService, appService, $location) {
        const ctrl = this;
        ctrl.$onInit = function () {
            ctrl.isLoadded = false;
            ctrl.getSettings();
            ctrl.navMobileAttr = isMobileService.getValue() ? 'navigation' : '';
            ctrl.childs = {};
            if (ctrl.onInit != null) {
                ctrl.onInit({
                    okChannel: ctrl,
                });
            }
        };
        ctrl.initChild = function (childName, childCtrl) {
            ctrl.childs[childName] = childCtrl;
        };
        ctrl.removeChannel = function () {
            SweetAlert.confirm('Вы уверены, что хотите отключить канал?', {
                title: 'Удаление',
            }).then((result) => {
                if (result === true || result.value) {
                    okService.removeChannel().then(() => {
                        const basePath = document.getElementsByTagName('base')[0].getAttribute('href');
                        $window.location.assign(basePath);
                    });
                }
            });
        };
        ctrl.removeBinding = function () {
            okService.removeBinding().then(() => {
                $window.location.reload(true);
            });
        };
        ctrl.getSettings = function () {
            okService.getOkSettings().then((data) => {
                ctrl.groupId = data.groupId;
                ctrl.groupName = data.groupName;
                ctrl.salesFunnels = data.salesFunnels;
                ctrl.salesFunnelId = data.salesFunnelId;
                ctrl.subscribeToMessages = data.subscribeToMessages;
                ctrl.isLoadded = true;
            });
        };
        ctrl.changeSaleFunnel = function () {
            return okService
                .changeSaleFunnel({
                    id: ctrl.salesFunnelId,
                })
                .then((data) => {
                    if (data.result === true) {
                        toaster.pop('success', '', $translate.instant('Admin.Js.OkChannel.ChangesSaved'));
                    }
                });
        };
        ctrl.toggleSubscriptionToMessages = function () {
            return okService.toggleSubscriptionToMessages(ctrl.subscribeToMessages).then((data) => {
                if (data.result === true) {
                    toaster.pop('success', '', $translate.instant('Admin.Js.OkChannel.ChangesSaved'));
                } else {
                    toaster.pop('error', '', 'Ошибка при сохранении');
                }
            });
        };
        ctrl.openGroup = function () {
            $window.open(`https://ok.ru/group/${  ctrl.groupId}`);
        };
        ctrl.onSelectTab = function (indexTab, name) {
            ctrl.tabActiveIndex = indexTab;
            if (isMobileService.getValue()) {
                appService.setTitle(name.replace(/(в ОК|из ОК)$/g, ''));
            }
        };
    };
    okChannelCtrl.$inject = ['$window', 'toaster', 'SweetAlert', 'okService', '$translate', 'isMobileService', 'appService', '$location'];
    ng.module('okChannel', ['isMobile'])
        .controller('okChannelCtrl', okChannelCtrl)
        .component('okChannel', {
            templateUrl: okChannelTemplate,
            controller: 'okChannelCtrl',
            bindings: {
                onInit: '&',
            },
        });
})(window.angular);
