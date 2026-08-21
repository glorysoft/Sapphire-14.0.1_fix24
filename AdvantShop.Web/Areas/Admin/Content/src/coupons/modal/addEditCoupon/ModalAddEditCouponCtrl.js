(function (ng) {
    const ModalAddEditCouponCtrl = function ($uibModalInstance, $http, toaster, $translate) {
        const ctrl = this;

        ctrl.$onInit = function () {
            const params = ctrl.$resolve;
            ctrl.CouponId = params.CouponId != null ? params.CouponId : 0;
            ctrl.TriggerActionId = params.triggerActionId != null ? params.triggerActionId : null;
            ctrl.TriggerId = params.triggerId != null ? params.triggerId : null;
            ctrl.CouponMode = params.couponMode != null ? params.couponMode : 0;

            ctrl.mode = ctrl.CouponId != 0 ? 'edit' : 'add';

            ctrl.ShowUseStartDate = !ctrl.isTemplate();

            ctrl.getCouponData().then(() => {
                if (ctrl.mode == 'edit') {
                    ctrl.getCoupon(ctrl.CouponId);
                } else {
                    ctrl.getCouponCode();
                    ctrl.Value = 0;
                    ctrl.MinimalOrderPrice = 0;
                    ctrl.Enabled = true;
                    ctrl.IsMinimalOrderPriceFromAllCart = false;
                    ctrl.UsePosibleUses = true;
                    ctrl.UseExpirationDate = Boolean(!ctrl.isTemplate() || ctrl.CouponMode == 4);
                    ctrl.Type = ctrl.Types[0];
                    ctrl.CurrencyIso3 = ctrl.Currencies[0];
                    ctrl.AddingDate = new Date();
                    ctrl.CategoryIds = [];
                    ctrl.ProductsIds = [];
                    ctrl.OfferIds = [];
                    ctrl.CustomerGroupIds = [];
                    ctrl.PriceRuleIdsToNotApplyCoupon = [];
                    ctrl.Days = 14;
                    ctrl.UseStartDate = true; //!ctrl.isTemplate() ? true : false;
                    ctrl.ForFirstOrder = false;
                    ctrl.ShippingMethodIds = [];
                }
            });
        };

        ctrl.close = function () {
            $uibModalInstance.dismiss('cancel');
        };

        ctrl.getCoupon = function (id) {
            $http.get('coupons/getCoupon', { params: { couponId: id } }).then((response) => {
                const { data } = response;
                if (data != null) {
                    ctrl.CouponId = data.CouponId;
                    ctrl.Code = data.Code;
                    ctrl.Value = data.Value;
                    ctrl.Type = ctrl.Types.filter((x) => x.value == data.Type)[0];
                    ctrl.PossibleUses = data.PossibleUses;
                    ctrl.UsePosibleUses = ctrl.PossibleUses == 0;
                    ctrl.ForFirstOrder = data.ForFirstOrder;

                    ctrl.AddingDate = data.AddingDate;
                    ctrl.AddingDateFormatted = data.AddingDateFormatted;

                    ctrl.CurrencyIso3 = ctrl.Currencies.filter((x) => x.value == data.CurrencyIso3)[0];

                    ctrl.Enabled = data.Enabled;
                    ctrl.MinimalOrderPrice = data.MinimalOrderPrice;
                    ctrl.IsMinimalOrderPriceFromAllCart = data.IsMinimalOrderPriceFromAllCart;
                    ctrl.ActualUses = data.ActualUses;
                    ctrl.CategoryIds = data.CategoryIds;
                    ctrl.ProductsIds = data.ProductsIds;
                    ctrl.OfferIds = data.OfferIds;
                    ctrl.TriggerActionId = data.TriggerActionId;
                    ctrl.TriggerId = data.TriggerId;
                    ctrl.TriggerName = data.TriggerName;

                    ctrl.CouponMode = data.Mode;
                    ctrl.Days = data.Days || 14;

                    ctrl.ExpirationDate = data.ExpirationDate;
                    ctrl.UseExpirationDate = data.ExpirationDate == null && data.Days == null;

                    ctrl.PartnerId = data.PartnerId;
                    ctrl.PartnerName = data.PartnerName;

                    ctrl.StartDate = data.StartDate;
                    ctrl.UseStartDate = data.StartDate == null;

                    ctrl.CustomerGroupIds = data.CustomerGroupIds;
                    ctrl.PriceRuleIdsToNotApplyCoupon = data.PriceRuleIdsToNotApplyCoupon;

                    ctrl.GiftOfferId = data.GiftOfferId;
                    ctrl.GiftOfferError = data.GiftOfferError;
                    ctrl.OnlyInMobileApp = data.OnlyInMobileApp;
                    ctrl.ForFirstOrderInMobileApp = data.ForFirstOrderInMobileApp;
                    ctrl.OnlyOnCustomerBirthday = data.OnlyOnCustomerBirthday;
                    ctrl.DaysBeforeBirthday = data.DaysBeforeBirthday;
                    ctrl.DaysAfterBirthday = data.DaysAfterBirthday;
                    ctrl.Comment = data.Comment;
                    ctrl.IsAppliedToPriceWithDiscount = data.IsAppliedToPriceWithDiscount;
                    ctrl.ShippingMethodIds = data.ShippingMethodIds;
                    ctrl.IgnoreMinimalPriceForOrderAndDelivery = data.IgnoreMinimalPriceForOrderAndDelivery;
                }
            });
        };

        ctrl.getCouponCode = function (id) {
            return $http.get('coupons/getCouponCode', { params: { couponId: id } }).then((response) => {
                if (ctrl.CouponMode == 4) {
                    ctrl.Code = 'Шаблон партнерского купона';
                } else {
                    ctrl.Code = (ctrl.isTemplate() ? 'Шаблон купона ' : '') + response.data.code;
                }
            });
        };

        ctrl.getCouponData = function () {
            return $http.get('coupons/getCouponData').then((response) => {
                const { data } = response;

                ctrl.Types = data.types;
                ctrl.Currencies = data.currencies;
                ctrl.AddingDateFormatted = data.dateNow;
                ctrl.CustomerGroupList = data.customerGroupList;
                ctrl.PriceRules = data.priceRules;
                ctrl.ShippingMethods = data.shippingMethods;
            });
        };

        ctrl.selectCategories = function (result) {
            ctrl.CategoryIds = result.categoryIds;
        };

        ctrl.selectProducts = function () {
            $http.get('coupons/getCouponProducts', { params: { couponId: ctrl.CouponId, rnd: Math.random() } }).then((response) => {
                ctrl.ProductsIds = response.data.ids;
            });
        };

        ctrl.selectOffers = function () {
            $http.get('coupons/GetCouponOfferIds', { params: { couponId: ctrl.CouponId, rnd: Math.random() } }).then((response) => {
                ctrl.OfferIds = response.data.ids;
            });
        };

        ctrl.resetCategories = function () {
            if (ctrl.mode === 'add') {
                ctrl.CategoryIds = [];
            } else {
                $http.post('coupons/resetCouponCategories', { couponId: ctrl.CouponId }).then((response) => {
                    ctrl.CategoryIds = [];
                });
            }
        };

        ctrl.resetProducts = function () {
            if (ctrl.mode === 'add') {
                ctrl.ProductsIds = [];
            } else {
                $http.post('coupons/resetCouponProducts', { couponId: ctrl.CouponId }).then((response) => {
                    ctrl.ProductsIds = [];
                });
            }
        };

        ctrl.resetOffers = function () {
            if (ctrl.mode === 'add') {
                ctrl.OfferIds = [];
            } else {
                $http.post('coupons/resetCouponOffers', { couponId: ctrl.CouponId }).then((response) => {
                    ctrl.OfferIds = [];
                });
            }
        };

        ctrl.save = function () {
            const params = {
                CouponId: ctrl.CouponId,
                Code: ctrl.Code,
                Value: ctrl.Value,
                Type: ctrl.Type.value,
                PossibleUses: !ctrl.UsePosibleUses ? ctrl.PossibleUses : 0,
                ExpirationDate: !ctrl.UseExpirationDate && !ctrl.isTemplate() ? ctrl.ExpirationDate : null,
                AddingDate: ctrl.AddingDate,
                CurrencyIso3: ctrl.CurrencyIso3.value,
                Enabled: ctrl.Enabled,
                MinimalOrderPrice: ctrl.MinimalOrderPrice,
                IsMinimalOrderPriceFromAllCart: ctrl.IsMinimalOrderPriceFromAllCart,
                CategoryIds: ctrl.CategoryIds,
                ProductsIds: ctrl.ProductsIds,
                OfferIds: ctrl.OfferIds,
                TriggerActionId: ctrl.TriggerActionId,
                TriggerId: ctrl.TriggerId,
                Mode: ctrl.CouponMode,
                Days: !ctrl.UseExpirationDate && ctrl.isTemplate() ? ctrl.Days : null,
                StartDate: !ctrl.UseStartDate && !ctrl.isTemplate() ? ctrl.StartDate : null,
                ForFirstOrder: ctrl.ForFirstOrder,
                CustomerGroupIds: ctrl.CustomerGroupIds,
                GiftOfferId: ctrl.GiftOfferId,
                OnlyInMobileApp: ctrl.OnlyInMobileApp,
                ForFirstOrderInMobileApp: ctrl.ForFirstOrderInMobileApp,
                OnlyOnCustomerBirthday: ctrl.OnlyOnCustomerBirthday,
                DaysBeforeBirthday: ctrl.DaysBeforeBirthday,
                DaysAfterBirthday: ctrl.DaysAfterBirthday,
                Comment: ctrl.Comment,
                IsAppliedToPriceWithDiscount: ctrl.IsAppliedToPriceWithDiscount,
                PriceRuleIdsToNotApplyCoupon: ctrl.PriceRuleIdsToNotApplyCoupon,
                ShippingMethodIds: ctrl.ShippingMethodIds,
                IgnoreMinimalPriceForOrderAndDelivery: ctrl.IgnoreMinimalPriceForOrderAndDelivery
            };

            const url = ctrl.mode == 'add' ? 'coupons/addCoupon' : 'coupons/updateCoupon';

            $http.post(url, params).then((response) => {
                const { data } = response;
                if (data.result == true) {
                    toaster.pop('success', '', $translate.instant('Admin.Js.Coupons.ChangesSuccessfullySaved'));
                    $uibModalInstance.close(data.obj);
                } else {
                    toaster.pop('error', $translate.instant('Admin.Js.Coupons.Error'), data.errors);
                }
            });
        };

        ctrl.isTemplate = function () {
            return ctrl.CouponMode == 1 || ctrl.CouponMode == 3 || ctrl.CouponMode == 4;
        };

        ctrl.selectOffer = function (result) {
            ctrl.GiftOfferError = null;

            if (result && result.ids) {
                ctrl.GiftOfferId = result.ids[0];
            } else toaster.pop('error', 'Не удалось выбрать товар');
        };

        ctrl.checkSelectedItem = function (rowEntity) {
            return ctrl.GiftOfferId === rowEntity.OfferId;
        };

        ctrl.pluralize = function (count, forms) {
            count = Math.abs(count) % 100;
            const lastDigit = count % 10;

            if (count > 10 && count < 20) return $translate.instant(forms[2]); // 11–19
            if (lastDigit === 1) return $translate.instant(forms[0]); // 1
            if (lastDigit >= 2 && lastDigit <= 4) return $translate.instant(forms[1]); // 2–4
            return $translate.instant(forms[2]); // 5–9 или 0
        };
    };

    ModalAddEditCouponCtrl.$inject = ['$uibModalInstance', '$http', 'toaster', '$translate'];

    ng.module('uiModal').controller('ModalAddEditCouponCtrl', ModalAddEditCouponCtrl);
})(window.angular);
