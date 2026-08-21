import relatedProductsTemplate from './relatedProducts.html';
(function (ng) {
    

    const RelatedProductsCtrl = function ($http, SweetAlert, toaster, $translate) {
        const ctrl = this;
        ctrl.$onInit = function () {
            getRelatedProducts();
        };
        ctrl.addProductsModal = function (result) {
            if (result == null || result.ids == null || result.ids.length === 0) return;
            $http
                .post('product/addRelatedProduct', {
                    productId: ctrl.productId,
                    type: ctrl.type,
                    ids: result.ids,
                })
                .then((response) => {
                    getRelatedProducts();
                    toaster.success('', $translate.instant('Admin.Js.Product.ChangesSaved'));
                });
        };
        ctrl.deleteRelatedProduct = function (relatedProductId) {
            SweetAlert.confirm($translate.instant('Admin.Js.Product.AreYouSureDelete'), {
                title: $translate.instant('Admin.Js.Product.Deleting'),
            }).then((result) => {
                if (result === true || result.value === true) {
                    $http
                        .post('product/deleteRelatedProduct', {
                            productId: ctrl.productId,
                            type: ctrl.type,
                            relatedProductId,
                        })
                        .then((response) => {
                            getRelatedProducts();
                            toaster.success('', $translate.instant('Admin.Js.Product.ChangesSaved'));
                        });
                }
            });
        };
        function getRelatedProducts() {
            $http
                .get('product/getRelatedProducts', {
                    params: {
                        productId: ctrl.productId,
                        type: ctrl.type,
                    },
                })
                .then((response) => {
                    ctrl.products = response.data;
                });
        }
        ctrl.sortableOptions = {
            orderChanged (event) {
                const id = event.source.itemScope.item.Id,
                    prev = ctrl.products[event.dest.index - 1],
                    next = ctrl.products[event.dest.index + 1];
                $http
                    .post('product/changeRelatedProductsSorting', {
                        id,
                        prevId: prev != null ? prev.Id : null,
                        nextId: next != null ? next.Id : null,
                    })
                    .then((response) => {
                        toaster.success('', $translate.instant('Admin.Js.ChangesSaved'));
                    });
            },
        };
    };
    RelatedProductsCtrl.$inject = ['$http', 'SweetAlert', 'toaster', '$translate'];
    ng.module('relatedProducts', [])
        .controller('RelatedProductsCtrl', RelatedProductsCtrl)
        .component('relatedProducts', {
            templateUrl: relatedProductsTemplate,
            controller: RelatedProductsCtrl,
            bindings: {
                productId: '=',
                type: '@',
            },
        });
})(window.angular);
