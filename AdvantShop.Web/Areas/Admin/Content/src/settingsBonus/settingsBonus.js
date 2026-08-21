const SettingsBonusCtrl = /* @ngInject */ function ($http, $translate, $q) {
    const ctrl = this;
    const NO_COUPON_OPTION = { CouponID: 0, Code: $translate.instant('Admin.Js.SettingsBonus.WithoutPromoCode') };
    ctrl.coupons = [NO_COUPON_OPTION];

    ctrl.loadCoupon = function (selectedId) {
        if (selectedId === 0){
            ctrl.selectedCouponObject = NO_COUPON_OPTION;
            return;
        }
        $http
            .get('settingsbonus/getSelectedCoupon', { params: { couponId: selectedId } })
            .then((response) => {
                ctrl.selectedCouponObject = response.data;
            });
    };

    ctrl.firstCallCoupons = function () {
        if (ctrl.couponsPage) return $q.resolve();
        ctrl.couponsPage = {};
        return ctrl.getCoupons();
    };

    ctrl.getCouponsByName = function (q) {
        ctrl.couponsPage = null;
        ctrl.coupons = (q === undefined || q === null || q === '') ? [NO_COUPON_OPTION] : [];
        return ctrl.getCoupons(q);
    };

    ctrl.getCoupons = function (q) {
        ctrl.couponsPage = ctrl.couponsPage || {};
        const currentPage = ctrl.couponsPage.page || 0;
        let newPage;

        if (ctrl.couponsPage.receivedAllCoupons || ctrl.loadingCoupons === true) {
            return $q.resolve();
        }
        newPage = currentPage + 1;
        ctrl.loadingCoupons = true;
        const params = {
            page: newPage,
            count: 100,
            q: q || null
        };

        return $http
            .get('settingsbonus/getCouponList', { params })
            .then((response) => {
                const data = response.data;
                if (data && data.length > 0) {
                    ctrl.coupons = ctrl.coupons ? ctrl.coupons.concat(data) : data;

                    if (data.length < params.count) {
                        ctrl.couponsPage.receivedAllCoupons = true;
                    }
                    ctrl.couponsPage.page = newPage;
                } else {
                    ctrl.couponsPage.receivedAllCoupons = true;
                }
                return data;
            })
            .finally(() => {
                ctrl.loadingCoupons = false;
            });
    };
};

angular.module('settingsBonus', []).controller('SettingsBonusCtrl', SettingsBonusCtrl);
