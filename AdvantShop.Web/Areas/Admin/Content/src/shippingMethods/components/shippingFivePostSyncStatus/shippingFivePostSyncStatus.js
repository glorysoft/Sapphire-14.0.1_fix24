import shippingFivePostSyncStatusTemplate from './templates/shippingFivePostSyncStatus.html';
(function (ng) {
    

    const ShippingFivePostSyncStatusCtrl = function ($http, toaster, $translate) {
        const ctrl = this;
        ctrl.$onInit = function () {
            ctrl.listStatuses = [];
            ctrl.listExecutionStatuses = [
                {
                    value: '',
                    label: $translate.instant('Admin.Js.ShippingMethod.FivePost.NotSelected'),
                },
            ];
            for (var value in ctrl.statuses) {
                if (ctrl.statuses.hasOwnProperty(value)) {
                    ctrl.listStatuses.push({
                        value,
                        label: ctrl.statuses[value],
                    });
                }
            }
            for (var value in ctrl.executionStatuses) {
                if (ctrl.executionStatuses.hasOwnProperty(value)) {
                    ctrl.listExecutionStatuses.push({
                        value,
                        label: ctrl.executionStatuses[value],
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
                                const fivePostStatus = arr[0].split('_');
                                return {
                                    fivePostStatus: fivePostStatus[0],
                                    fivePostExecutionStatus: fivePostStatus.length > 1 ? fivePostStatus[1] : null,
                                    advStatus: arr[1],
                                };
                            })
                            // фильтруем существующие статусы
                            .filter((x) => (
                                    ctrl.getStatusNameByObj(x) &&
                                    (!x.fivePostExecutionStatus || ctrl.getExecutionStatusName(x.fivePostExecutionStatus)) &&
                                    ctrl.getAdvStatusName(x.advStatus)
                                ));
                        ctrl.syncStatuses.sort(compare);
                        ctrl.updateStatusesReference();
                    }
                });
        };

        ctrl.addSyncStatus = function () {
            if (
                ctrl.syncStatuses.some(
                    (item) =>
                        item.fivePostStatus === ctrl.Status &&
                        (item.fivePostExecutionStatus === ctrl.ExecutionStatus || (!item.fivePostExecutionStatus && !ctrl.ExecutionStatus)),
                )
            ) {
                toaster.error($translate.instant('Admin.Js.ShippingMethod.FivePost.StatusAlreadyExists'));
                return;
            }
            ctrl.syncStatuses.push({
                fivePostStatus: ctrl.Status,
                fivePostExecutionStatus: ctrl.ExecutionStatus,
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
                .map((x) => {
                    let fivePostStatus = x.fivePostStatus;
                    if (x.fivePostExecutionStatus) fivePostStatus += `_${  x.fivePostExecutionStatus}`;
                    return `${fivePostStatus  },${  x.advStatus}`;
                })
                .join(';');
            ctrl.update = true;
        };
        ctrl.getStatusNameByObj = function (obj) {
            return ctrl.getStatusName(obj.fivePostStatus);
        };
        ctrl.getExecutionStatusName = function (statusId) {
            if (!statusId) return $translate.instant('Admin.Js.ShippingMethod.FivePost.NotSelected');
            return ctrl.executionStatuses[statusId];
        };
        ctrl.getStatusName = function (id) {
            return ctrl.statuses[id];
        };
        ctrl.getAdvStatusName = function (id) {
            const status = ctrl.advStatuses.find((item) => item.value === id);
            return status ? status.label : undefined;
        };
        function compare(a, b) {
            let fivePostStatus1 = Number(a.fivePostStatus) * 100 + Number(a.advStatus) * 1000;
            if (a.fivePostExecutionStatus) fivePostStatus1 += Number(a.fivePostExecutionStatus);

            let fivePostStatus2 = Number(b.fivePostStatus) * 100 + Number(b.advStatus) * 1000;
            if (b.fivePostExecutionStatus) fivePostStatus2 += Number(b.fivePostExecutionStatus);

            return fivePostStatus1 - fivePostStatus2;
        }
    };
    ShippingFivePostSyncStatusCtrl.$inject = ['$http', 'toaster', '$translate'];
    ng.module('shippingMethod')
        .controller('ShippingFivePostSyncStatusCtrl', ShippingFivePostSyncStatusCtrl)
        .component('shippingFivePostSyncStatus', {
            templateUrl: shippingFivePostSyncStatusTemplate,
            controller: 'ShippingFivePostSyncStatusCtrl',
            bindings: {
                onInit: '&',
                methodId: '@',
                statusesReference: '@',
                statuses: '<',
                executionStatuses: '<',
            },
        });
})(window.angular);
