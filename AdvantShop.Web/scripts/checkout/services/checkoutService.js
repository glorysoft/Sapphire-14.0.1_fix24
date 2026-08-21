/* @ngInject */
function checkoutService($http, toaster, $q, cartService) {
    let service = this,
        callbackStorage = {},
        contact;

    service.getContactFromCache = function () {
        return contact;
    };

    service.processContact = function (address) {
        return $http.post('/checkout/CheckoutProcessContactPost', { address, rnd: Math.random() }).then((response) => response.data);
    };

    service.saveContact = function (address, $httpOptions) {
        return $http.post('/checkout/CheckoutContactPost', { address, rnd: Math.random() }, $httpOptions).then((response) => {
            contact = address;
            return response.data;
        });
    };

    service.getShipping = function (preorderList, typeCalculationVariants, allowChangeSelectedShipping) {
        const params = { rnd: Math.random(), typeCalculationVariants, allowChangeSelectedShipping };
        if (preorderList != null) {
            params.preorderList = preorderList;
        }

        return $http.post('/checkout/CheckoutShippingJson', params).then((response) => response.data);
    };

    service.saveShipping = function (shipping, preorderList, typeCalculationVariants) {
        const params = { shipping, rnd: Math.random() };
        if (preorderList != null) {
            params.preorderList = preorderList;
        }
        if (typeCalculationVariants != null) {
            params.typeCalculationVariants = typeCalculationVariants;
        }

        return $http.post('/checkout/CheckoutShippingPost', params).then((response) => response.data);
    };

    service.getPayment = function (preorderList) {
        const params = { rnd: Math.random() };
        if (preorderList != null) {
            params.preorderList = preorderList;
        }

        return $http.post('/checkout/CheckoutPaymentJson', params).then((response) => response.data);
    };

    service.savePayment = function (payment, preorderList) {
        const params = { payment, rnd: Math.random() };
        if (preorderList != null) {
            params.preorderList = preorderList;
        }

        return $http.post('/checkout/CheckoutPaymentPost', params).then((response) => response.data);
    };

    service.getCheckoutCart = function () {
        return $http.get('/checkout/CheckoutCartJson', { params: { rnd: Math.random() } }).then((response) => response.data);
    };

    service.autorizeBonus = function (cardNumber) {
        return $http.post('/checkout/CheckoutBonusAutorizePost', { cardNumber, rnd: Math.random() }).then((response) => response.data);
    };

    service.toggleBonus = function (appliedBonuses) {
        return $http.post('/checkout/CheckoutBonusApplyPost', { appliedBonuses, rnd: Math.random() }).then((response) => {
            if (!response.data.result) {
                toaster.pop('error', '', response.data.msg);
            }
            return response.data;
        });
    };

    service.couponApplied = function () {
        return $http.post('/checkout/CheckoutCouponApplied', { irnd: Math.random() }).then((response) => response.data);
    };

    service.commentSave = function (message) {
        return $http.post('/checkout/CommentPost', { message, rnd: Math.random() }).then((response) => response.data);
    };

    service.saveDontCallBack = function (dontCallBack) {
        return $http.post('/checkout/saveDontCallBack', { dontCallBack, rnd: Math.random() }).then((response) => response.data);
    };

    service.saveCountDevices = function (countDevices) {
        return $http.post('/checkout/saveCountDevices', { countDevices, rnd: Math.random() }).then((response) => response.data);
    };

    service.getCheckoutAttachments = function () {
        return $http.get('/checkout/getCheckoutAttachments').then((response) => response.data);
    };

    service.deleteAttachment = function (id) {
        return $http.post('/checkout/deleteAttachment', { id }).then((response) => response.data);
    };

    service.saveAgreementForNewsletter = function (isAgreeForPromotionalNewsletter) {
        const defer = $q.defer();

        if (isAgreeForPromotionalNewsletter == null) {
            defer.resolve(null);
        } else {
            return $http
                .post('/checkout/saveAgreementForNewsletter', {
                    isAgreeForPromotionalNewsletter,
                })
                .then((response) => response.data);
        }
        return defer.promise;
    };

    service.saveNewCustomer = function (customer) {
        return $http.post('/checkout/CheckoutUserPost', { customer, rnd: Math.random() }).then((response) => response.data);
    };

    service.saveRecipient = function (customer) {
        return $http.post('/checkout/CheckoutRecipientPost', { customer, rnd: Math.random() }).then((response) => response.data);
    };

    service.saveCustomerRequiredFields = function (customer) {
        return $http.post('/checkout/checkoutUserRequiredFieldsPost', { customer, rnd: Math.random() }).then((response) => response.data);
    };

    service.saveWantBonusCard = function (wantBonusCard) {
        return $http.post('/checkout/saveWantBonusCard', { wantBonusCard, rnd: Math.random() }).then((response) => response.data);
    };

    // billing
    service.getBillingPayment = function (orderId) {
        return $http.post('/checkout/BillingPaymentJson', { rnd: Math.random(), orderId }).then((response) => response.data);
    };

    service.getBillingCart = function (orderId) {
        return $http.get('/checkout/BillingCartJson', { params: { orderId, rnd: Math.random() } }).then((response) => response.data);
    };

    service.saveBillingPayment = function (payment, orderId) {
        return $http.post('/checkout/BillingPaymentPost', { payment, orderId, rnd: Math.random() }).then((response) => response.data);
    };

    //events: address, shipping, payment, bonus, coupon, relationshipEnd
    service.addCallback = function (eventName, callback) {
        callbackStorage[eventName] = callbackStorage[eventName] || [];
        callbackStorage[eventName].push(callback);
    };

    service.removeCallback = function (eventName, callback) {
        let index;
        if (callbackStorage[eventName] != null && callbackStorage[eventName].length > 0) {
            index = callbackStorage[eventName].indexOf(callback);

            if (index !== -1) {
                callbackStorage[eventName].splice(index, 1);
            }
        }
    };

    service.processCallbacks = function (eventName, data) {
        if (callbackStorage[eventName] != null) {
            callbackStorage[eventName].forEach((fn) => {
                fn(data);
            });
        }
    };

    service.receivingMethodSave = function (receivingMethod) {
        return $http.post('/checkout/receivingMethodSave', { receivingMethod, rnd: Math.random() }).then((response) => response.data);
    };

    service.getGeoModeDeliveries = function (typeCalculationVariants) {
        const params = { rnd: Math.random(), typeCalculationVariants };

        return $http.post('/checkout/GetGeoModeDeliveries', params).then((response) => response.data);
    };

    service.updateCartAmount = function (items, queryParams) {
        return $http
            .post(
                '/checkout/updateCart',
                angular.extend(
                    {
                        items,
                        rnd: Math.random(),
                    },
                    queryParams || {},
                ),
            )
            .then((response) => {
                cartService.processCallback('update', response.data);
                return cartService.getData(false, queryParams);
            });
    };

    service.removeCartItem = function (shoppingCartItemId, queryParams) {
        return $http
            .post('/checkout/removeFromCart', angular.extend({ itemId: shoppingCartItemId }, queryParams || {}))
            .then((response) => cartService.getData(false, queryParams).then(() => response.data))
            .then((data) => {
                cartService.processCallback('remove', data);
                return data;
            });
    };

    service.getShippingPoints = function (cityId, options) {
        return $http.post('/location/getShippingPoints', { cityId }, options).then((response) => response.data);
    };
    service.getShippingPointsByBounds = function ({ bottomLeftLatitude, bottomLeftLongitude, topRightLatitude, topRightLongitude }, options) {
        return $http
            .post('/location/GetShippingPointsByBounds', { bottomLeftLatitude, bottomLeftLongitude, topRightLatitude, topRightLongitude }, options)
            .then((response) => response.data);
    };

    /**
     * Сохранить выбранный пункт самовывоза
     * @param shippingMethodId
     * @param pointId
     * @returns {selectedOption, reloadPage}
     */
    service.setGeoModePoint = (shippingMethodId, pointId) =>
        $http
            .post('/checkout/SetGeoModePoint', { shippingMethodId, pointId })
            .then((response) => {
                if (response.data && response.data.result) {
                    return response.data.obj;
                }
                throw response.data.errors.join('\n');
            })
            .catch((err) => {
                throw new Error(err.message || err);
            });

    service.setCalculationVariants = (typeCalculationVariants) =>
        $http
            .post('/checkout/setCalculationVariants', { typeCalculationVariants })
            .then((response) => {
                if (response.data && response.data.result) {
                    return response.data.result;
                }
                throw response.data.errors.join('\n');
            })
            .catch((err) => {
                throw new Error(err.message || err);
            });
}
export default checkoutService;
