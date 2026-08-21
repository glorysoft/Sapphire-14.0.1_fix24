(function (ng) {
    

    const ModalAddProductListCtrl = function ($uibModalInstance, $http, $window, toaster, urlHelper, $translate) {
        const ctrl = this;

        ctrl.$onInit = function () {
            ctrl.categoryId = ctrl.$resolve != null && ctrl.$resolve.data != null ? ctrl.$resolve.data.categoryId : null;

            if (ctrl.categoryId != null) {
                ctrl.categoryName = ctrl.$resolve.data.categoryName;
            } else {
                const categoryId = urlHelper.getUrlParam('categoryid');

                if (categoryId !== null && categoryId !== '') {
                    ctrl.categoryId = categoryId;

                    $http.get('category/getCategoryForList', { params: { categoryId } }).then((response) => {
                        if (response.data != null && response.data.category != null) {
                            ctrl.categoryId = response.data.category.CategoryId;
                            ctrl.categoryName = response.data.category.Name;
                        }
                    });
                }
            }
        };

        ctrl.close = function () {
            $uibModalInstance.dismiss('cancel');
        };

        ctrl.changeCategory = function (result) {
            ctrl.categoryId = result.categoryId;
            ctrl.categoryName = result.categoryName;
        };

        ctrl.save = function () {
            if (ctrl.products == null || ctrl.products === '' || ctrl.inProgress === true) return;

            if (ctrl.categoryId == null) {
                toaster.pop('error', '', $translate.instant('Admin.Js.AddProductList.SelectACategory'));
                return;
            }

            ctrl.inProgress = true;

            const products = ctrl.products.split('\n').filter((x) => x.trim() !== '');

            $http
                .post('product/addProductList', { categoryId: ctrl.categoryId, products })
                .then((response) => {
                    const data = response.data;
                    if (data.result === true) {
                        $window.location.assign(`catalog?categoryId=${  ctrl.categoryId}`);
                    } else {
                        toaster.pop('error', '', $translate.instant('Admin.Js.AddProductList.ErrorAddingProduct'));
                    }
                })
                .catch(() => {
                    ctrl.inProgress = false;
                });
        };
    };

    ModalAddProductListCtrl.$inject = ['$uibModalInstance', '$http', '$window', 'toaster', 'urlHelper', '$translate'];

    ng.module('uiModal').controller('ModalAddProductListCtrl', ModalAddProductListCtrl);
})(window.angular);
