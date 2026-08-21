(function (ng) {


    const ModalAddEditPriceRuleCtrl = function ($uibModalInstance, $http, $q, $timeout, toaster, Upload, $translate) {
        const ctrl = this;

        ctrl.$onInit = function () {
            const params = ctrl.$resolve;
            ctrl.id = params.Id != null ? params.Id : 0;
            ctrl.mode = ctrl.id != 0 ? 'edit' : 'add';
            ctrl.selectedCustomerGroups = [];
            ctrl.selectedWarehouses = [];

            ctrl.getInfo().then((data) => {
                if (ctrl.mode == 'add') {
                    ctrl.priceRule = {
                        Amount: 0,
                        SortOrder: data.sortOrder,
                        Enabled: true,
                        Mode: 0,
                        CartSum: 0,
                    };
                    if (ctrl.customerGroups != null && ctrl.customerGroups.length > 0) {
                        ctrl.selectedCustomerGroups.push(ctrl.customerGroups[0]);
                    }
                    if (ctrl.priceRule.PaymentMethodId == null && ctrl.paymentMethods.length > 0) {
                        ctrl.priceRule.PaymentMethodId = ctrl.paymentMethods[0].value;
                    }
                    if (ctrl.priceRule.ShippingMethodId == null && ctrl.shippingMethods.length > 0) {
                        ctrl.priceRule.ShippingMethodId = ctrl.shippingMethods[0].value;
                    }
                } else {
                    return ctrl.getPriceRule(ctrl.id);
                }
            }).finally(() => {

                if (typeof ctrl.priceRule.CalculationPriceMode === 'undefined' || ctrl.priceRule.CalculationPriceMode === null) {
                    ctrl.priceRule.CalculationPriceMode = ctrl.calculationPriceModes[0].value;
                }

                if (typeof ctrl.priceRule.MarkupPercentage === 'undefined' || ctrl.priceRule.MarkupPercentage >= 0) {
                    ctrl.MarkupPercentagePlusSelect = '+';
                } else {
                    ctrl.MarkupPercentagePlusSelect = '-';
                    ctrl.priceRule.MarkupPercentage *= -1;
                }

                if (typeof ctrl.priceRule.MarkupAmount === 'undefined' || ctrl.priceRule.MarkupAmount >= 0) {
                    ctrl.MarkupAmountPlusSelect = '+';
                } else {
                    ctrl.MarkupAmountPlusSelect = '-';
                    ctrl.priceRule.MarkupAmount *= -1;
                }
            })
        };

        ctrl.close = function () {
            $uibModalInstance.dismiss('cancel');
        };

        ctrl.getPriceRule = function (id) {
            return $http.get('priceRules/get', { params: { id } }).then((response) => {
                const data = (ctrl.priceRule = response.data);

                if (ctrl.priceRule.CustomerGroupIds != null && ctrl.priceRule.CustomerGroupIds.length > 0) {
                    ctrl.priceRule.CustomerGroupIds.forEach((id) => {
                        const item = ctrl.customerGroups.find((x) => x.Id === id);
                        if (item != null) {
                            ctrl.selectedCustomerGroups.push(item);
                        }
                    });
                }

                if (ctrl.priceRule.WarehouseIds != null && ctrl.priceRule.WarehouseIds.length > 0) {
                    ctrl.priceRule.WarehouseIds.forEach((id) => {
                        const item = ctrl.warehouses.find((x) => x.Id === id);
                        if (item != null) {
                            ctrl.selectedWarehouses.push(item);
                        }
                    });
                }

                return data;
            });
        };

        ctrl.getInfo = function () {
            return $http.get('priceRules/getInfo').then((response) => {
                ctrl.customerGroups = response.data.customerGroups;
                ctrl.paymentMethods = response.data.paymentMethods;
                ctrl.shippingMethods = response.data.shippingMethods;
                ctrl.warehouses = response.data.warehouses;
                ctrl.warehousesActive = response.data.warehousesActive;
                ctrl.calculationPriceModes = response.data.calculationPriceModes;
                ctrl.modes = response.data.modes;
                ctrl.plusMinusSelect = [{label:'+', value:'+'}, {label:'−', value:'-'}];
                ctrl.currencySymbol = response.data.currencySymbol;

                return response.data;
            });
        };

        ctrl.save = function () {
            const url = ctrl.mode === 'add' ? 'priceRules/add' : 'priceRules/update';

            ctrl.priceRule.CustomerGroupIds = ctrl.selectedCustomerGroups.map((x) => x.Id);
            ctrl.priceRule.WarehouseIds = ctrl.selectedWarehouses.map((x) => x.Id);

            const priceRule = angular.copy(ctrl.priceRule);

            if (priceRule.MarkupPercentage !== null && priceRule.MarkupPercentage !== 0 && ctrl.MarkupPercentagePlusSelect === '-') {
                priceRule.MarkupPercentage *= -1;
            }

            if (priceRule.MarkupAmount !== null && priceRule.MarkupAmount !== 0 && ctrl.MarkupAmountPlusSelect === '-') {
                priceRule.MarkupAmount *= -1;
            }

            $http.post(url, priceRule).then((response) => {
                const data = response.data;

                if (data.result === true) {
                    toaster.pop('success', '', $translate.instant('Admin.Js.ChangesSaved'));
                    $uibModalInstance.close();
                } else if (data.errors != null) {
                    data.errors.forEach((err) => {
                        toaster.pop('error', '', err);
                    });
                }
            });
        };
    };

    ModalAddEditPriceRuleCtrl.$inject = ['$uibModalInstance', '$http', '$q', '$timeout', 'toaster', 'Upload', '$translate'];

    ng.module('uiModal').controller('ModalAddEditPriceRuleCtrl', ModalAddEditPriceRuleCtrl);
})(window.angular);
