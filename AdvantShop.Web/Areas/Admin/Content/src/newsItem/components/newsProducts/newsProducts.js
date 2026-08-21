import newsProductsTemplate from './newsProducts.html';
(function (ng) {
    

    const NewsProductsCtrl = function ($filter, $http, SweetAlert, toaster, $translate) {
        const ctrl = this;
        ctrl.$onInit = function () {
            ctrl.addingNew = ctrl.newsId == -1;
            if (!ctrl.addingNew) {
                ctrl.getNewsProducts();
            }
        };
        ctrl.addProductsModal = function (result) {
            if (result == null || result.ids == null || result.ids.length === 0) return;
            ctrl.productIds = result.ids;
            if (!ctrl.addingNew) {
                $http
                    .post('news/addNewsProduct', {
                        newsId: ctrl.newsId,
                        ids: result.ids,
                    })
                    .then((response) => {
                        ctrl.getNewsProducts();
                        toaster.success($translate.instant('Admin.Js.NewsItem.ChangesSaved'));
                    });
            } else {
                ctrl.getProducts();
            }
        };
        ctrl.sortableOptions = {
            orderChanged (event) {
                const id = event.source.itemScope.item.ProductId,
                    prev = ctrl.products[event.dest.index - 1],
                    next = ctrl.products[event.dest.index + 1];
                $http
                    .post('news/changeNewsProductsSorting', {
                        newsId: ctrl.newsId,
                        id,
                        prevId: prev != null ? prev.ProductId : null,
                        nextId: next != null ? next.ProductId : null,
                    })
                    .then((response) => {
                        toaster.success('', $translate.instant('Admin.Js.ChangesSaved'));
                        ctrl.productIds = ctrl.products.map((x) => x.ProductId);
                    });
            },
        };
        ctrl.deleteNewsProduct = function (productId) {
            ctrl.productIds = $filter('filter')(ctrl.productIds, (value) => value !== productId);
            if (!ctrl.addingNew) {
                SweetAlert.confirm($translate.instant('Admin.Js.NewsItem.AreYouSureDelete'), {
                    title: $translate.instant('Admin.Js.NewsItem.Deleting'),
                }).then((result) => {
                    if (result === true || result.value) {
                        $http
                            .post('news/deleteNewsProduct', {
                                newsId: ctrl.newsId,
                                productId,
                            })
                            .then((response) => {
                                ctrl.getNewsProducts();
                                toaster.success($translate.instant('Admin.Js.NewsItem.ChangesSaved'));
                            });
                    }
                });
            } else {
                ctrl.products = $filter('filter')(ctrl.products, (value) => value.ProductId !== productId);
            }
        };
        ctrl.getNewsProducts = function () {
            $http
                .get('news/getNewsProducts', {
                    params: {
                        newsId: ctrl.newsId,
                    },
                })
                .then((response) => {
                    ctrl.products = response.data.products;
                    ctrl.productIds = response.data.productIds;
                });
        };
        ctrl.getProducts = function () {
            $http
                .get('news/getProducts', {
                    params: {
                        productIds: ctrl.productIds,
                    },
                })
                .then((response) => {
                    ctrl.products = response.data;
                });
        };
    };
    NewsProductsCtrl.$inject = ['$filter', '$http', 'SweetAlert', 'toaster', '$translate'];
    ng.module('newsProducts', [])
        .controller('NewsProductsCtrl', NewsProductsCtrl)
        .component('newsProducts', {
            templateUrl: newsProductsTemplate,
            controller: NewsProductsCtrl,
            bindings: {
                newsId: '=',
                productIds: '=',
            },
        });
})(window.angular);
