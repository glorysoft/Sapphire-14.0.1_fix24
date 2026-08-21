(function (ng) {
    

    const ModalAddCustomerGroupCtrl = function ($uibModalInstance, $http) {
        const ctrl = this;

        ctrl.$onInit = function () {
            const resolve = ctrl.$resolve;
            ctrl.mode = resolve?.params.CustomerGroupId ? 'edit' : 'add';

            ctrl.currency = resolve.params != undefined && resolve.params.currency != undefined ? resolve.params.currency : null;

            if (ctrl.mode == 'edit') {
                ctrl.name = resolve.params.GroupName;
                ctrl.discount = resolve.params.GroupDiscount;
                ctrl.minimumOrderPrice = resolve.params.MinimumOrderPrice;
                ctrl.groupId = resolve.params.CustomerGroupId;
            }
        };

        ctrl.close = function () {
            $uibModalInstance.dismiss('cancel');
        };

        ctrl.addCustomerGroup = function () {
            if (ctrl.mode == 'add') {
                const params = {
                    groupName: ctrl.name,
                    groupDiscount: ctrl.discount,
                    minimumOrderPrice: ctrl.minimumOrderPrice,
                };

                $http.post('customergroups/addCustomerGroup', params).then((response) => {
                    $uibModalInstance.close('addCustomerGroup');
                });
            } else {
                const params = {
                    CustomerGroupId: ctrl.groupId,
                    GroupName: ctrl.name,
                    GroupDiscount: ctrl.discount,
                    MinimumOrderPrice: ctrl.minimumOrderPrice,
                };

                $http
                    .post('customergroups/inplace', params)
                    .then((response) => {
                        ctrl.$resolve.params.GroupName = ctrl.name;
                        ctrl.$resolve.params.GroupDiscount = ctrl.discount;
                        ctrl.$resolve.params.MinimumOrderPrice = ctrl.minimumOrderPrice;
                        $uibModalInstance.close('addCustomerGroup');
                    })
                    .catch((err) => {
                        console.log(err);
                    });
            }
        };
    };

    ModalAddCustomerGroupCtrl.$inject = ['$uibModalInstance', '$http'];

    ng.module('uiModal').controller('ModalAddCustomerGroupCtrl', ModalAddCustomerGroupCtrl);
})(window.angular);
