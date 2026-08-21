import productListsMenuTemplate from './templates/productListsMenu.html';
(function (ng) {
    

    const ProductListsMenuCtrl = function ($http, SweetAlert, toaster, urlHelper, $window, $translate) {
        const ctrl = this;
        ctrl.$onInit = function () {
            ctrl.fetch();
            if (ctrl.onInit != null) {
                ctrl.onInit({
                    productLists: ctrl,
                });
            }
        };
        ctrl.fetch = function () {
            return $http.get('productLists/getProductListsMenu').then((response) => (ctrl.productLists = response.data));
        };
        ctrl.deleteList = function (id) {
            SweetAlert.confirm($translate.instant('Admin.Js.AreYouSureDelete'), {
                title: $translate.instant('Admin.Js.Deleting'),
            }).then((result) => {
                if (result === true || result.value === true) {
                    $http
                        .post('productLists/deleteProductList', {
                            id,
                        })
                        .then((response) => {
                            ctrl.selectList(null);
                            toaster.pop('success', '', $translate.instant('Admin.Js.Design.SuccessfullyDeleted'));
                        });
                } else {
                    toaster.pop('error', '', $translate.instant('Admin.Js.Catalog.ErrorWhileDeleting'));
                }
            });
        };
        ctrl.sortableOptions = {
            orderChanged (event) {
                const id = event.source.itemScope.list.Id,
                    prev = ctrl.productLists[event.dest.index - 1],
                    next = ctrl.productLists[event.dest.index + 1];
                $http
                    .post('productLists/changeProductListsSorting', {
                        id,
                        prevId: prev != null ? prev.Id : null,
                        nextId: next != null ? next.Id : null,
                    })
                    .then((response) => {
                        if (response.data.result === true) {
                            toaster.pop('success', '', $translate.instant('Admin.Js.ChangesSaved'));
                        }
                    });
            },
        };
        ctrl.selectList = function (list) {
            ctrl.listId = list != null ? list.Id : null;
            if (ctrl.onChange != null) {
                ctrl.onChange({
                    list,
                });
            }
        };
    };
    ProductListsMenuCtrl.$inject = ['$http', 'SweetAlert', 'toaster', 'urlHelper', '$window', '$translate'];
    ng.module('productListsMenu', ['as.sortable'])
        .controller('ProductListsMenuCtrl', ProductListsMenuCtrl)
        .component('productListsMenu', {
            templateUrl: productListsMenuTemplate,
            controller: 'ProductListsMenuCtrl',
            transclude: true,
            bindings: {
                listId: '<?',
                onInit: '&',
                onChange: '&',
                mainPageProducts: '<',
            },
        });
})(window.angular);
