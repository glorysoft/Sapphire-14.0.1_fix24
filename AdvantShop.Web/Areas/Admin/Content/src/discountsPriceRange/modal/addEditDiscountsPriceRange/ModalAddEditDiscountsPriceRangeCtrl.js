(function (ng) {
    

    const ModalAddEditDiscountsPriceRangeCtrl = function ($uibModalInstance, $http, toaster, $translate) {
        const ctrl = this;

        ctrl.$onInit = function () {
            const params = ctrl.$resolve;
            ctrl.OrderPriceDiscountId = params.OrderPriceDiscountId != null ? params.OrderPriceDiscountId : 0;
            ctrl.type = ctrl.OrderPriceDiscountId != 0 ? 'edit' : 'add';

            if (ctrl.type == 'edit') {
                ctrl.getItem(ctrl.OrderPriceDiscountId);
            }
        };

        ctrl.close = function () {
            $uibModalInstance.dismiss('cancel');
        };

        ctrl.getItem = function (id) {
            $http.get('discountsPriceRange/getItem', { params: { orderPriceDiscountId: id } }).then((response) => {
                const data = response.data;
                if (data != null) {
                    ctrl.PriceRange = data.PriceRange;
                    ctrl.PercentDiscount = data.PercentDiscount;
                }
            });
        };

        ctrl.save = function () {
            const params = {
                OrderPriceDiscountId: ctrl.OrderPriceDiscountId,
                PriceRange: ctrl.PriceRange,
                PercentDiscount: ctrl.PercentDiscount,
            };
            const url = ctrl.type == 'add' ? 'discountsPriceRange/addItem' : 'discountsPriceRange/updateItem';

            $http.post(url, params).then((response) => {
                const data = response.data;
                if (data.result == true) {
                    toaster.pop('success', '', $translate.instant('Admin.Js.PriceRange.ChangesSuccessfullySaved'));
                    $uibModalInstance.close();
                } else {
                    toaster.pop('error', $translate.instant('Admin.Js.PriceRange.Error'), data.errors);
                }
            });
        };
    };

    ModalAddEditDiscountsPriceRangeCtrl.$inject = ['$uibModalInstance', '$http', 'toaster', '$translate'];

    ng.module('uiModal').controller('ModalAddEditDiscountsPriceRangeCtrl', ModalAddEditDiscountsPriceRangeCtrl);
})(window.angular);
