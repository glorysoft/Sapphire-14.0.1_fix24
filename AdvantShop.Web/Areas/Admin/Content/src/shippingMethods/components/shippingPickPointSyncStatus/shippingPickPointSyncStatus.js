import shippingPickPointSyncStatusTemplate from './templates/shippingPickPointSyncStatus.html';
(function (ng) {
    

    const ShippingPickPointSyncStatusCtrl = function ($http, toaster) {
        const ctrl = this;
        ctrl.$onInit = function () {
            ctrl.statuses = {};
            const statusesArr = ctrl.statusesSource.split('@@');
            for (let i = 0; i < statusesArr.length; i++) {
                const value = statusesArr[i];
                if (value) {
                    const values = value.split(';;');
                    ctrl.statuses[values[0]] = {
                        Name: values[1],
                        Comment: '',
                    };
                }
            }
            ctrl.listStatuses = [];
            /*for (var value in ctrl.statuses) {
          if (ctrl.statuses.hasOwnProperty(value)) {
              ctrl.listStatuses.push({ value: value, label: ctrl.statuses[value].Name });
          }
      }*/
            for (let i = 0; i < statusesArr.length; i++) {
                const value = statusesArr[i];
                if (value) {
                    const values = value.split(';;');
                    ctrl.listStatuses.push({
                        value: values[0],
                        label: values[1],
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
                                    pickpointStatus: arr[0],
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
                ctrl.syncStatuses.some((item) => item.pickpointStatus === ctrl.Status)
            ) {
                toaster.error('Данный статус уже указан. Чтобы обновить необходимо удалить.');
                return;
            }
            ctrl.syncStatuses.push({
                pickpointStatus: ctrl.Status,
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
                .map((x) => `${x.pickpointStatus  },${  x.advStatus}`)
                .join(';');
            ctrl.update = true;
        };
        ctrl.getStatusNameByObj = function (obj) {
            return ctrl.getStatusName(obj.pickpointStatus);
        };
        ctrl.getStatusName = function (id) {
            return ctrl.statuses[id].Name;
        };
        ctrl.getStatusComment = function (id) {
            return ctrl.statuses[id].Comment;
        };
        ctrl.getAdvStatusName = function (id) {
            const status = ctrl.advStatuses.find((item) => item.value === id);
            return status ? status.label : undefined;
        };
        function compare(a, b) {
            if (a.pickpointStatus < b.pickpointStatus) return -1;
            if (a.pickpointStatus > b.pickpointStatus) return 1;
            return 0;
        }
    };
    ShippingPickPointSyncStatusCtrl.$inject = ['$http', 'toaster'];
    ng.module('shippingMethod')
        .controller('ShippingPickPointSyncStatusCtrl', ShippingPickPointSyncStatusCtrl)
        .component('shippingPickpointSyncStatus', {
            templateUrl: shippingPickPointSyncStatusTemplate,
            controller: 'ShippingPickPointSyncStatusCtrl',
            bindings: {
                onInit: '&',
                methodId: '@',
                statusesReference: '@',
                statusesSource: '@',
            },
        });
})(window.angular);
