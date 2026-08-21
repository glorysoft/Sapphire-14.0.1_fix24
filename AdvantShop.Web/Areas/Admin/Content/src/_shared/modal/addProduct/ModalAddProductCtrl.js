(function(ng) {
    

    /* @ngInject */
    const ModalAddProductCtrl = function($uibModalInstance, $uibModalStack, $http, $window, urlHelper, toaster, $translate, $timeout) {
        const ctrl = this;

        ctrl.$onInit = function() {
            const categoryId = urlHelper.getUrlParamByName('categoryid');
            if (categoryId != null) {
                $http.get(`catalog/getCategoryName?categoryId=${  categoryId}`).then((response) => {
                    ctrl.categoryId = categoryId;
                    ctrl.categoryName = response.data.name;
                });
            }
        };

        ctrl.close = function(reason) {
            $uibModalInstance.dismiss(reason ?? 'cancel');
        };
        ctrl.changeCategory = function(result) {
            ctrl.categoryId = result.categoryId;
            ctrl.categoryName = result.categoryName;
        };

        ctrl.addProduct = function() {
            if (ctrl.name == '' || ctrl.btnLoading === true) {
                return;
            }

            if (ctrl.categoryId == null) {
                toaster.pop('error', '', $translate.instant('Admin.Js.AddProduct.SelectCategory'));
                return;
            }

            ctrl.btnLoading = true;

            $http
                .post('product/add', { name: ctrl.name, categoryId: ctrl.categoryId })
                .then((response) => {
                    if (response.data != null && response.data.result) {
                        $window.location.assign(`product/edit/${  response.data.obj}`);
                    } else if (response.data.errors.length) {
                            toaster.pop('error', '', response.data.errors[0]);
                            ctrl.btnLoading = false;
                        }
                })
                .catch(() => {
                    ctrl.btnLoading = false;
                });
        };

        ctrl.scrollToFormControl = function(e) {
            $timeout(() => {
                e.target.scrollIntoView();
            }, 400);
        };
    };

    ng.module('uiModal').controller('ModalAddProductCtrl', ModalAddProductCtrl);
})(window.angular);
