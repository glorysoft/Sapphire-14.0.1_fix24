import shippingSberlogisticSyncStatusTemplate from './templates/shippingSberlogisticSyncStatus.html';
(function (ng) {
    

    const ShippingSberlogisticSyncStatus = function ($http, toaster) {
        const ctrl = this;
        ctrl.$onInit = function () {
            ctrl.listStatuses = [];
            ctrl.statuses = JSON.parse(ctrl.statusesStr);
            for (const value in ctrl.statuses) {
                if (ctrl.statuses.hasOwnProperty(value)) {
                    ctrl.listStatuses.push({
                        value,
                        label: ctrl.statuses[value],
                    });
                }
            }
            $http
                .get('orders/getorderstatuses')
                .then((response) => {
                    ctrl.advStatuses = response.data;
                })
                .then(() => {
                    ctrl.syncStatuses = [];
                    if (ctrl.statusesReference != null && ctrl.statusesReference !== '') {
                        ctrl.syncStatuses = ctrl.statusesReference
                            .split(';')
                            .filter((x) => x)
                            .map((x) => {
                                const arr = x.split(',');
                                return {
                                    sberlogisticStatus: arr[0],
                                    advStatus: arr[1],
                                };
                            })
                            // фильтруем существующие статусы
                            .filter((x) => ctrl.getStatusNameByObj(x) && ctrl.getAdvStatusName(x.advStatus));
                        ctrl.syncStatuses.sort(compare);
                        ctrl.updateStatusesReference();
                    }
                });
        };
        ctrl.addSyncStatus = function () {
            if (
                ctrl.syncStatuses.some((item) => item.sberlogisticStatus === ctrl.Status)
            ) {
                toaster.error('Данный статус уже указан. Чтобы обновить необходимо удалить.');
                return;
            }
            ctrl.syncStatuses.push({
                sberlogisticStatus: ctrl.Status,
                advStatus: ctrl.advStatus,
            });
            ctrl.syncStatuses.sort(compare);
            ctrl.updateStatusesReference();
        };
        ctrl.deleteSyncStatus = function (index) {
            ctrl.syncStatuses.splice(index, 1);
            ctrl.updateStatusesReference();
        };
        ctrl.updateStatusesReference = function () {
            ctrl.statusesReference = ctrl.syncStatuses
                .map((x) => `${x.sberlogisticStatus  },${  x.advStatus}`)
                .join(';');
            ctrl.update = true;
        };
        ctrl.getStatusNameByObj = function (obj) {
            return ctrl.getStatusName(obj.sberlogisticStatus);
        };
        ctrl.getStatusName = function (id) {
            return ctrl.statuses[id];
        };
        ctrl.getAdvStatusName = function (id) {
            const status = ctrl.advStatuses.find((item) => item.value === id);
            return status ? status.label : undefined;
        };
        function compare(a, b) {
            if (a.sberlogisticStatus < b.sberlogisticStatus) return -1;
            if (a.sberlogisticStatus > b.sberlogisticStatus) return 1;
            return 0;
        }
    };
    ShippingSberlogisticSyncStatus.$inject = ['$http', 'toaster'];
    ng.module('shippingMethod')
        .controller('ShippingSberlogisticSyncStatus', ShippingSberlogisticSyncStatus)
        .component('shippingSberlogisticSyncStatus', {
            templateUrl: shippingSberlogisticSyncStatusTemplate,
            controller: 'ShippingSberlogisticSyncStatus',
            bindings: {
                onInit: '&',
                methodId: '@',
                statusesReference: '@',
                statusesStr: '@',
            },
        });
})(window.angular);
