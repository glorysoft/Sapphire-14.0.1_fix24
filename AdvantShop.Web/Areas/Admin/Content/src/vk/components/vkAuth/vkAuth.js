import vkAuthTemplate from './vkAuth.html';
(function (ng) {


    const vkAuthCtrl = function ($http, toaster, SweetAlert, vkService, $translate, $window) {
        const ctrl = this;
        ctrl.$onInit = function () {
            ctrl.getSettings();
        };
        ctrl.getSettings = function () {
            vkService.getVkSettings().then((data) => {
                ctrl.clientId = data.clientId;
                ctrl.groups = data.groups;
                if (ctrl.groups != null && ctrl.groups.length > 0) {
                    ctrl.selectedGroup = ctrl.groups[0];
                }
                ctrl.group = data.group;
                ctrl.groupId = data.group != null ? data.group.Id : null;
                ctrl.groupName = data.group != null ? data.group.Name : null;
                ctrl.groupScreenName = data.group != null ? data.group.ScreenName : null;
            });
        };

        ctrl.openVkIdModal = function(){
            const url = `${ctrl.baseUrl}/integration/vk/auth?clientId=${ctrl.clientId}&redirectUrl=${ctrl.redirectUrl}`;

            const width = 700;
            const height = 525;
            const left = screen.width / 2 - width / 2;
            const top = screen.height / 2 - height / 2;

            const win = window.open(url, '', `width=${width}, height=${height}, top=${top}, left=${left}`);
            win.focus();

            // слушаем сообщения от открытого окна
            window.addEventListener('message', ev => {
                const { code, device_id, state } = ev.data;

                if (code && device_id && state) {
                    ctrl.getUserAccessToken(code, device_id, state);

                    window.removeEventListener('message', ev => {});
                }
            })
        }

        ctrl.getUserAccessToken = function (code, device_id, state) {

            const exchangeCode = {
                redirect_uri: ctrl.redirectUrl,
                client_id: ctrl.clientId,
                code,
                device_id,
                state
            };

            vkService.getUserAccessToken(exchangeCode).then((data) => {
                if (data.errors != null) {
                    data.errors.forEach(error => toaster.pop('error', '', error));
                } else {
                    vkService.getGroups().then((groups) => {
                        ctrl.groups = groups;
                        if (ctrl.groups != null && ctrl.groups.length > 0) {
                            ctrl.selectedGroup = ctrl.groups[0];
                        }
                    });
                }
            })
        }

        // Авторизация в vk с правами пользователя, чтобы получить список групп
        ctrl.authGroup = function () {
            if (ctrl.selectedGroup == null) {
                return;
            }

            const group = ctrl.selectedGroup;
            const url = `${ctrl.baseUrl}/integration/vk/authGroup?clientId=${ctrl.clientId}&redirectUrl=${ctrl.redirectUrl}&groupId=${group.Id}`;

            const w = 700;
            const h = 525;
            const left = screen.width / 2 - w / 2;
            const top = screen.height / 2 - h / 2;

            const win = window.open(url, '', `width=${w}, height=${h}, top=${top}, left=${left}`);
            win.focus();

            // слушаем сообщения от открытого окна
            window.addEventListener('message', ev => {
                const { accessToken } = ev.data;

                if (accessToken) {
                    ctrl.saveAuthVkGroup(group, accessToken);
                }
            });
        };

        ctrl.saveAuthVkGroup = function (group, accessToken) {
            try {
                vkService.saveAuthVkGroup({ group, accessToken })
                    .then((data) => {
                        if (data.result === true) {

                            $window.location.reload(true);
                            toaster.pop('success', '', $translate.instant('Admin.Js.SettingsCrm.Group') + group.Name + $translate.instant('Admin.Js.SettingsCrm.GroupIsConnected'));
                            if (ctrl.onAddDelVk) {
                                ctrl.onAddDelVk();
                            }
                        } else {
                            data.errors.forEach((error) => toaster.error('', error));
                        }
                    });
            } catch (e) {
                console.log(e);
            }
        }

        ctrl.saveSettings = function () {
            vkService.saveSettings(ctrl.salesFunnelId, ctrl.createLeadFromMessages, ctrl.createLeadFromComments).then((data) => {
                toaster.pop('success', '', $translate.instant('Admin.Js.SettingsCrm.ChangesSaved'));
            });
        };
    };
    vkAuthCtrl.$inject = ['$http', 'toaster', 'SweetAlert', 'vkService', '$translate', '$window'];
    ng.module('vkAuth', [])
        .controller('vkAuthCtrl', vkAuthCtrl)
        .component('vkAuth', {
            templateUrl: vkAuthTemplate,
            controller: 'vkAuthCtrl',
            bindings: {
                redirectUrl: '<?',
                baseUrl: '<?',
                onAddDelVk: '&',
            },
        });
})(window.angular);
