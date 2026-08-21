(function (ng) {
    const ModalOfferStocksCtrl = function ($uibModalInstance, $http, productService, toaster, $translate) {
        const ctrl = this;

        ctrl.$onInit = function () {
            const params = ctrl.$resolve;
            ctrl.offerId = params.offerId !== null ? params.offerId : 0;
            ctrl.offerInfo = params.offerInfo ? `(${params.offerInfo})` : '';
            ctrl.newQuantity = 1;

            ctrl.getOfferStocks(ctrl.offerId).then((data) => {
                ctrl.getDataForOfferStocks(ctrl.offerId).then(() => {
                    if (data !== null && Array.isArray(data)) {
                        ctrl.stocks = data.map((stock) => {
                            const warehouse = ctrl.getWarehouse(stock.WarehouseId);
                            stock.warehouseName = warehouse.Name;
                            return stock;
                        });
                        ctrl.updateListNotUsedWarehouses();
                        if (ctrl.notUsedWarehouses.length) {
                            ctrl.newWarehouse = ctrl.notUsedWarehouses[0].Id;
                        }
                    }
                });
            });
        };

        ctrl.getOfferStocks = function (offerId) {
            return productService.getOfferStocks(offerId).then((data) => {
                if (data.result === true) {
                    return data.obj;
                }
                data.errors.forEach((error) => {
                    toaster.pop('error', error);
                });

                if (!data.errors) {
                    toaster.pop('error', $translate.instant('Admin.Js.OfferStocks.Error'), $translate.instant('Admin.Js.OfferStocks.Error.Data'));
                }

                return data;
            });
        };

        ctrl.getDataForOfferStocks = function (offerId) {
            return $http.get('product/getDataForOfferStocks', { params: { offerId } }).then((response) => {
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
                            $translate.instant('Admin.Js.OfferStocks.Error'),
                            $translate.instant('Admin.Js.OfferStocks.Error.AdditionalData'),
                        );
                    }
                }
                return data;
            });
        };

        ctrl.updateListNotUsedWarehouses = function () {
            ctrl.notUsedWarehouses = ctrl.warehouses.filter(
                (warehouse) => ctrl.stocks.every((stock) => stock.WarehouseId !== warehouse.Id) && warehouse.AllowEdit,
            );
        };

        ctrl.addStock = function () {
            if (!ctrl.newWarehouse) {
                toaster.error($translate.instant('Admin.Js.OfferStocks.Error.Warehouse'));
                return;
            }

            const warehouse = ctrl.getWarehouse(ctrl.newWarehouse);

            ctrl.stocks.push({
                OfferId: ctrl.offerId,
                WarehouseId: ctrl.newWarehouse,
                Quantity: ctrl.newQuantity || '0',
                warehouseName: warehouse.Name,
                AllowEdit: warehouse.AllowEdit,
            });

            ctrl.updateListNotUsedWarehouses();
            ctrl.newQuantity = 1;
            delete ctrl.newWarehouse;
            if (ctrl.notUsedWarehouses.length) {
                ctrl.newWarehouse = ctrl.notUsedWarehouses[0].Id;
            }
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

        ctrl.close = function () {
            $uibModalInstance.dismiss('cancel');
        };

        ctrl.save = function () {
            productService.saveOfferStocks(ctrl.stocks).then((data) => {
                if (data.result === true) {
                    $uibModalInstance.close(ctrl.stocks);
                } else {
                    data.errors.forEach((error) => {
                        toaster.pop('error', error);
                    });

                    if (!data.errors) {
                        toaster.pop('error', $translate.instant('Admin.Js.OfferStocks.Error'), $translate.instant('Admin.Js.OfferStocks.Error.Save'));
                    }
                }
                return data;
            });
        };
    };

    ModalOfferStocksCtrl.$inject = ['$uibModalInstance', '$http', 'productService', 'toaster', '$translate'];

    ng.module('uiModal').controller('ModalOfferStocksCtrl', ModalOfferStocksCtrl);
})(window.angular);
