(function (ng) {
    'strict';

    const ModalDistributionOfOrderItemCtrl = function ($http, toaster, $uibModalInstance, SweetAlert, $translate) {
        const ctrl = this;

        ctrl.$onInit = function () {
            const params = ctrl.$resolve;
            ctrl.orderItemId = params.orderItemId !== null ? params.orderItemId : 0;
            ctrl.orderItemAmount = params.amount !== null ? params.amount : 0;
            ctrl.itemInfo = params.itemInfo ? `(${params.itemInfo})` : '';
            ctrl.newAmount = 1;

            ctrl.getDistribution(ctrl.orderItemId).then(() => {
                ctrl.getDataForDistribution(ctrl.orderItemId).then(() => {
                    ctrl.distributionItems.forEach((distributionItem) => {
                        const warehouse = ctrl.getWarehouse(distributionItem.WarehouseId);
                        distributionItem.warehouseName = warehouse ? warehouse.Name : '';
                        distributionItem.availableAmount = warehouse ? warehouse.AvailableAmount : 0;
                    });

                    ctrl.updateListNotUsedWarehouses();
                    if (ctrl.notUsedWarehouses.length) {
                        ctrl.newWarehouse = ctrl.notUsedWarehouses[0].Id;
                        ctrl.availableAmountNewWarehouse = ctrl.notUsedWarehouses[0].AvailableAmount;
                    }
                });
            });
        };

        ctrl.getDistribution = function (orderItemId) {
            return $http.get('orders/getDistributionOfOrderItem', { params: { orderItemId } }).then((response) => {
                const { data } = response;
                if (data.result === true) {
                    ctrl.distributionItems = data.obj;
                } else {
                    data.errors.forEach((error) => {
                        toaster.pop('error', error);
                    });

                    if (!data.errors) {
                        toaster.pop(
                            'error',
                            $translate.instant('Admin.Js.DistributionOfOrderItem.Error'),
                            $translate.instant('Admin.Js.DistributionOfOrderItem.Error.Data'),
                        );
                    }
                }
                return data;
            });
        };

        ctrl.getDataForDistribution = function (orderItemId) {
            return $http.get('orders/getDataForDistributionOfOrderItem', { params: { orderItemId } }).then((response) => {
                const { data } = response;
                if (data.result === true) {
                    ctrl.warehouses = data.obj.Warehouses;
                } else {
                    data.errors.forEach((error) => {
                        toaster.pop('error', error);
                    });

                    if (!data.errors) {
                        toaster.pop(
                            'error',
                            $translate.instant('Admin.Js.DistributionOfOrderItem.Error'),
                            $translate.instant('Admin.Js.DistributionOfOrderItem.Error.AdditionalData'),
                        );
                    }
                }
                return data;
            });
        };

        ctrl.updateListNotUsedWarehouses = function () {
            ctrl.notUsedWarehouses = ctrl.warehouses.filter(
                (warehouse) =>
                    ctrl.distributionItems.every((distributionItem) => distributionItem.WarehouseId !== warehouse.Id) && warehouse.AllowEdit,
            );
        };

        ctrl.addDistribution = function () {
            if (!ctrl.newWarehouse) {
                toaster.error($translate.instant('Admin.Js.DistributionOfOrderItem.Error.Warehouse'));
                return;
            }

            const warehouse = ctrl.getWarehouse(ctrl.newWarehouse);

            ctrl.distributionItems.push({
                WarehouseId: ctrl.newWarehouse,
                Amount: ctrl.newAmount || 0,
                DecrementedAmount: 0,
                warehouseName: warehouse.Name,
                availableAmount: warehouse.AvailableAmount,
                AllowEdit: warehouse.AllowEdit,
            });

            ctrl.updateListNotUsedWarehouses();
            ctrl.newAmount = 1;
            delete ctrl.newWarehouse;
            if (ctrl.notUsedWarehouses.length) {
                ctrl.newWarehouse = ctrl.notUsedWarehouses[0].Id;
                ctrl.availableAmountNewWarehouse = ctrl.notUsedWarehouses[0].AvailableAmount;
            }
        };

        ctrl.changeWarehouse = function () {
            ctrl.availableAmountNewWarehouse = ctrl.getWarehouse(ctrl.newWarehouse).AvailableAmount;
        };

        ctrl.close = function () {
            $uibModalInstance.dismiss('cancel');
        };

        ctrl.save = function (updateOrderItemAmount) {
            if (!updateOrderItemAmount) {
                const newOrderItemAmount = ctrl.distributionItems.reduce((prev, current) => prev + current.Amount, 0);

                if (newOrderItemAmount !== ctrl.orderItemAmount) {
                    SweetAlert.confirm(
                        `${$translate.instant('Admin.Js.DistributionOfOrderItem.Save.TotalAmount')} ${newOrderItemAmount > ctrl.orderItemAmount ? $translate.instant('Admin.Js.DistributionOfOrderItem.Save.More') : $translate.instant('Admin.Js.DistributionOfOrderItem.Save.Less')}
                         ${$translate.instant('Admin.Js.DistributionOfOrderItem.Save.CurrentAmount')} ${Math.abs(newOrderItemAmount - ctrl.orderItemAmount)}.<br>
                         ${$translate.instant('Admin.Js.DistributionOfOrderItem.Save.UpdateAmount')} ${newOrderItemAmount}?`,
                        {
                            title: $translate.instant('Admin.Js.DistributionOfOrderItem.Save.Title'),
                            confirmButtonText: $translate.instant('Admin.Js.DistributionOfOrderItem.Save.Confirm'),
                            cancelButtonText: $translate.instant('Admin.Js.DistributionOfOrderItem.Save.Cancel'),
                        },
                    ).then((result) => {
                        if (result === true || result.value) {
                            ctrl.save(true);
                        }
                    });
                    return;
                }
            }

            $http
                .post('orders/saveDistributionOfOrderItem', {
                    orderItemId: ctrl.orderItemId,
                    distributionItems: ctrl.distributionItems,
                    updateOrderItemAmount,
                })
                .then((response) => {
                    const { data } = response;
                    if (data.result === true) {
                        $uibModalInstance.close(ctrl.distributionItems);
                    } else {
                        data.errors.forEach((error) => {
                            toaster.pop('error', error);
                        });

                        if (!data.errors) {
                            toaster.pop(
                                'error',
                                $translate.instant('Admin.Js.DistributionOfOrderItem.Error'),
                                $translate.instant('Admin.Js.DistributionOfOrderItem.Error.Save'),
                            );
                        }
                    }
                    return data;
                });
        };

        ctrl.getWarehouse = function (warehouseId) {
            if (!ctrl.warehouses.length) {
                return null;
            }

            const warehouse = ctrl.warehouses.reduce((prev, current) => {
                if (prev) {
                    return prev;
                }

                if (current.Id === warehouseId) {
                    return current;
                }

                return null;
            }, null);

            return warehouse;
        };
    };

    ModalDistributionOfOrderItemCtrl.$inject = ['$http', 'toaster', '$uibModalInstance', 'SweetAlert', '$translate'];

    ng.module('uiModal').controller('ModalDistributionOfOrderItemCtrl', ModalDistributionOfOrderItemCtrl);
})(window.angular);
