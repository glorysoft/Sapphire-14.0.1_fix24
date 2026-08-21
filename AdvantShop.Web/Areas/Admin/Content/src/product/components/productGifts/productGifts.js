import productGiftsTemplate from './productGifts.html';
(function (ng) {
    

    const ProductGiftsCtrl = function ($http, SweetAlert, toaster, $translate) {
        const ctrl = this;
        ctrl.$onInit = function () {
            getGifts();
        };
        ctrl.addGifts = function (result) {
            if (result == null || result.ids == null || result.ids.length === 0) return;
            $http
                .post('product/addGifts', {
                    productId: ctrl.productId,
                    offerIds: result.ids,
                    productCount: 1,
                })
                .then((response) => {
                    getGifts();
                    if (response.data.result) {
                        toaster.success('', $translate.instant('Admin.Js.ChangesSaved'));
                    } else {
                        response.data.errors.forEach((err) => {
                            toaster.error('', err);
                        });
                    }
                });
        };
        ctrl.deleteGift = function (giftOfferId, offerId) {
            SweetAlert.confirm($translate.instant('Admin.Js.AreYouSureDelete'), {
                title: $translate.instant('Admin.Js.Deleting'),
            }).then((result) => {
                if (result === true || result.value) {
                    $http
                        .post('product/deleteGift', {
                            productId: ctrl.productId,
                            giftOfferId,
                            offerId,
                        })
                        .then((response) => {
                            getGifts();
                            toaster.success('', $translate.instant('Admin.Js.ChangesSaved'));
                        });
                }
            });
        };
        function getGifts() {
            $http
                .get('product/getGifts', {
                    params: {
                        productId: ctrl.productId,
                    },
                })
                .then((response) => {
                    ctrl.products = response.data;
                });
        }
        ctrl.updateGift = function (giftOfferId, offerId, productCount) {
            $http
                .post('product/updateGift', {
                    productId: ctrl.productId,
                    giftOfferId,
                    offerId,
                    productCount,
                })
                .then((response) => {
                    const data = response.data;
                    if (data.result == true) {
                        getGifts();
                        toaster.success('', $translate.instant('Admin.Js.ChangesSaved'));
                    } else {
                        toaster.error('', (data.errors || [])[0] || $translate.instant('Admin.Js.ErrorWhileSaving'));
                    }
                });
        };
        ctrl.updateGiftOffer = function (giftOfferId, offerId, prevOfferId, productCount) {
            $http
                .post('product/updateGiftOffer', {
                    productId: ctrl.productId,
                    giftOfferId,
                    offerId,
                    prevOfferId,
                    productCount,
                })
                .then((response) => {
                    const data = response.data;
                    if (data.result == true) {
                        getGifts();
                        toaster.success('', $translate.instant('Admin.Js.ChangesSaved'));
                    } else {
                        toaster.error('', (data.errors || [])[0] || $translate.instant('Admin.Js.ErrorWhileSaving'));
                    }
                });
        };
    };
    ProductGiftsCtrl.$inject = ['$http', 'SweetAlert', 'toaster', '$translate'];
    ng.module('productGifts', ['offersSelectvizr'])
        .controller('ProductGiftsCtrl', ProductGiftsCtrl)
        .component('productGifts', {
            templateUrl: productGiftsTemplate,
            controller: ProductGiftsCtrl,
            bindings: {
                productId: '@',
            },
        });
})(window.angular);
