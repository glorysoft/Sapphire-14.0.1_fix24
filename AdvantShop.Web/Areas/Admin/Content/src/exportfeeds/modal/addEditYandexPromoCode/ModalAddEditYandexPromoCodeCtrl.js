(function (ng) {
    

    const ModalAddEditYandexPromoCodeCtrl = function ($uibModalInstance, $http, toaster, $translate, $window) {
        const ctrl = this;
        ctrl.warning = '';

        ctrl.$onInit = function () {
            const params = ctrl.$resolve.value;
            ctrl.ExportFeedId = params.ExportFeedId;
            ctrl.PromoID = params.PromoID != null ? params.PromoID : null;
            ctrl.mode = ctrl.PromoID != null ? 'edit' : 'add';
            ctrl.promo = {};
            ctrl.fetchCoupons();
        };

        ctrl.fetchCoupons = function () {
            ctrl.warning = '';
            $http.post('coupons/GetCoupons').then((response) => {
                if (response.data != null) {
                    if (response.data.DataItems.length == 0) {
                        toaster.pop('error', 'Ошибка', $translate.instant('Admin.Js.AddEditYandexPromo.ErrorGettingCouponsCount'));
                    }
                    if (
                        response.data.DataItems.filter((elem) => elem.Code.length > 20).length > 0
                    ) {
                        ctrl.warning = $translate.instant('Admin.Js.AddEditYandexPromo.WarningSomeCouponsFiltered');
                    }
                    ctrl.coupons = response.data.DataItems.filter((elem) => elem.Code.length <= 20);
                    if (
                        response.data.DataItems.length != 0 &&
                        ctrl.coupons.find((element) => element.Enabled) == null
                    ) {
                        toaster.pop('error', 'Внимание', $translate.instant('Admin.Js.AddEditYandexPromo.ErrorGettingCouponsAllDisabled'));
                    }
                    ctrl.promo.Coupon = ctrl.coupons.find((element) => element.Enabled);

                    if (ctrl.mode == 'edit') {
                        $http
                            .post('exportfeeds/GetYandexPromo', {
                                promoID: ctrl.PromoID,
                                exportFeedId: ctrl.ExportFeedId,
                            })
                            .then((responce) => {
                                ctrl.promo = responce.data;
                                let coupon = response.data.DataItems.find((element) => element.CouponId == responce.data.CouponId);
                                if (coupon === undefined) {
                                    ctrl.promo.Coupon = {};
                                    ctrl.warning = $translate.instant('Admin.Js.AddEditYandexPromo.WarningCouponWasDeleted');
                                } else {
                                    ctrl.promo.Coupon = coupon;
                                    coupon = ctrl.coupons.find((element) => element.CouponId == responce.data.CouponId);
                                    if (coupon === undefined) {
                                        ctrl.promo.Coupon.Enabled = false;
                                        ctrl.coupons.push(ctrl.promo.Coupon);
                                        ctrl.warning = $translate.instant('Admin.Js.AddEditYandexPromo.WarningCouponTooLong');
                                    }
                                }
                            });
                    }
                } else {
                    toaster.pop('error', 'Ошибка', $translate.instant('Admin.Js.AddEditYandexPromo.ErrorGettingCoupons'));
                }
            });
        };

        ctrl.save = function () {
            let PromoCode = {
                Type: 'PromoCode',
                Name: ctrl.promo.Name,
                Description: ctrl.promo.Description,
                PromoUrl: ctrl.promo.PromoUrl,
                CouponId: ctrl.promo.Coupon.CouponId,
                PromoID: ctrl.PromoID,
            };
            $http
                .post('exportfeeds/verifyyandexpromo', {
                    exportFeedId: ctrl.ExportFeedId,
                    model: PromoCode,
                    editing: ctrl.mode == 'edit',
                })
                .then((responce) => {
                    if (responce.data != null) {
                        if (responce.data.result == true) {
                            PromoCode = responce.data.promo;
                            $uibModalInstance.close(PromoCode);
                        } else {
                            toaster.pop('error', 'Ошибка', responce.data.errors);
                            //ctrl.error = responce.data.errors;
                        }
                    }
                });
        };

        ctrl.close = function () {
            $uibModalInstance.dismiss('cancel');
        };
    };

    ModalAddEditYandexPromoCodeCtrl.$inject = ['$uibModalInstance', '$http', 'toaster', '$translate', '$window'];

    ng.module('uiModal').controller('ModalAddEditYandexPromoCodeCtrl', ModalAddEditYandexPromoCodeCtrl);
})(window.angular);
