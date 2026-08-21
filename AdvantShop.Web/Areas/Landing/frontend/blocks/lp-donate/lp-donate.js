(function (ng) {
    ng.module('lpDonate', []).directive('lpDonate', [
        function () {
            return {
                restrict: 'A',
                scope: true,
                controllerAs: 'donateItem',
                bindToController: {
                    prices: '<?',
                    showOtherPrice: '<?',
                    otherPrice: '<?',
                    otherPriceMin: '@',
                },
                controller: [
                    function () {
                        const ctrl = this;

                        ctrl.$onInit = function () {
                            if (ctrl.prices != null) {
                                for (const item of ctrl.prices) {
                                    if (item.selected) {
                                        ctrl.selectedItem = angular.copy(item);
                                        break;
                                    }
                                }
                            }

                            if (ctrl.selectedItem == null && ctrl.otherPrice != null) {
                                ctrl.selectedItem = angular.copy(ctrl.otherPrice);
                                ctrl.setOtherPriceMin();
                            }
                        };

                        ctrl.selectPrice = function (priceItem) {
                            ctrl.deselectAllPrices();
                            priceItem.selected = true;
                            ctrl.selectedItem = angular.copy(priceItem);
                        };

                        ctrl.selectOtherPrice = function () {
                            ctrl.deselectAllPrices();
                            if (ctrl.otherPrice) {
                                ctrl.otherPrice.selected = true;
                                ctrl.selectedItem = angular.copy(ctrl.otherPrice);

                                ctrl.setOtherPriceMin();
                            }
                        };

                        ctrl.deselectAllPrices = function () {
                            ctrl.prices.forEach((x) => {
                                x.selected = false;
                            });
                            if (ctrl.otherPrice) {
                                ctrl.otherPrice.selected = false;
                            }
                        };

                        ctrl.setOtherPriceMin = function () {
                            if (ctrl.otherPriceMin != null && ctrl.otherPriceMin.length > 0) {
                                const min = Number(ctrl.otherPriceMin);
                                if (Number.isFinite(min)) {
                                    ctrl.selectedItem.value = min;
                                }
                            }
                        };

                        ctrl.changeOther = function() {
                            ctrl.deselectAllPrices();
                        }
                    },
                ],
            };
        },
    ]);
})(window.angular);
