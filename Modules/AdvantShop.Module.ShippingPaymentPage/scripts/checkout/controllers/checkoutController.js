/* @ngInject */
function CheckOutCtrl($http, $q, $sce, $rootScope, $timeout, $window, zoneService, checkoutService) {
    var ctrl = this, relationship, saveContactTimer, saveContactHttpTimer, processContactTimer, saveCustomerTimer;

        //ctrl.address = {};
        ctrl.Payment = {};
        ctrl.Shipping = {};
        ctrl.Cart = {};
        ctrl.isShowCouponInput = false;
        ctrl.newCustomer = {};
        ctrl.contact = {};
        ctrl.shippingLoading = true;
        ctrl.paymentLoading = true;

        relationship = {
            'address': function () {
                return ctrl.fetchShipping()
                    .then(ctrl.fetchPayment)
                    .then(ctrl.fetchCart)
                    .then(function (data) {
                        checkoutService.processCallbacks('address');
                        return data;
                    });
            },
            'shipping': function () {
                return ctrl.fetchPayment()
                    .then(ctrl.fetchCart)
                    .then(function (data) {
                        checkoutService.processCallbacks('shipping');
                        return data;
                    });
            },
            'payment': function () {
                return ctrl.fetchShipping()
                    .then(ctrl.fetchCart)
                    .then(function (data) {
                        checkoutService.processCallbacks('payment');
                        return data;
                    });
            },
            'bonus': function () {
                return ctrl.fetchShipping()
                    .then(ctrl.fetchPayment)
                    .then(ctrl.fetchCart)
                    .then(function (data) {
                        checkoutService.processCallbacks('bonus');
                        return data;
                    });
            },
            'coupon': function () {
                return ctrl.fetchShipping()
                    .then(ctrl.fetchPayment)
                    .then(ctrl.fetchCart)
                    .then(function (data) {
                        checkoutService.processCallbacks('coupon');
                        return data;
                    });
            }
        };

        ctrl.startShippingProgress = function () {
            ctrl.shippingLoading = true;
        };

        ctrl.stopShippingProgress = function () {
            ctrl.shippingLoading = false;
        };

        ctrl.startPaymentProgress = function () {
            ctrl.paymentLoading = true;
        };

        ctrl.stopPaymentProgress = function () {
            ctrl.paymentLoading = false;
        };

        ctrl.getAddress = function (contactsExits, useZone) {
            if (contactsExits === true) {
                ctrl.changeListAddress = function (address) {

                    ctrl.contact = address;

                    ctrl.startShippingProgress();
                    ctrl.startPaymentProgress();

                    ctrl.saveContact().then(function () {
                        ctrl.stopShippingProgress();
                        ctrl.stopPaymentProgress();
                    });
                };
            } else {
                zoneService.addCallback('set', function (data) {
                    ctrl.contact.Country = data.CountryName;
                    ctrl.contact.City = data.City;
                    ctrl.contact.Region = data.Region;
                    ctrl.contact.Zip = data.Zip;

                    ctrl.startShippingProgress();
                    ctrl.startPaymentProgress();

                    ctrl.processCity(data, 0).then(function () {
                        ctrl.stopShippingProgress();
                        ctrl.stopPaymentProgress();
                    });
                });

                if (useZone) {
                    zoneService.getCurrentZone().then(function (data) {
                        ctrl.contact.Country = data.CountryName;
                        ctrl.contact.City = data.City;
                        ctrl.contact.Region = data.Region;
                        ctrl.contact.Zip = data.Zip;

                        ctrl.processCity(data, 0).then(function () {
                            ctrl.stopShippingProgress();
                            ctrl.stopPaymentProgress();
                        });
                    });
                } else {
                    ctrl.startShippingProgress();
                    ctrl.startPaymentProgress();
                    ctrl.callRelationship('address').finally(function () {
                        ctrl.stopShippingProgress();
                        ctrl.stopPaymentProgress();
                    });
                }
            }
        };

        ctrl.changeShipping = function (shipping) {

            ctrl.startShippingProgress();
            ctrl.startPaymentProgress();

            if (ctrl.ngSelectShipping !== shipping) {
                ctrl.ngSelectShipping = shipping;
            }

            checkoutService.saveShipping(shipping)
                .then(function (response) {
                    ctrl.stopShippingProgress();
                    ctrl.stopPaymentProgress();
                    return ctrl.ngSelectShipping = angular.extend(ctrl.ngSelectShipping, response.selectShipping);
                })
                .then(ctrl.callRelationship.bind(ctrl, 'shipping'));
        };

        ctrl.changePayment = function (payment) {

            ctrl.startPaymentProgress();

            if (ctrl.ngSelectPayment !== payment) {
                ctrl.ngSelectPayment = payment;
            }

            checkoutService.savePayment(payment).then(ctrl.callRelationship.bind(ctrl, 'payment')).then(function () {
                ctrl.stopPaymentProgress();
            });
        };

        ctrl.fetchShipping = function () {

            return checkoutService.getShipping()
                .then(function (response) {

                    ctrl.ngSelectShipping = ctrl.getSelectedItem(response.option, response.selectShipping);

                    for (var i = 0, len = response.option.length; i < len; i++) {

                        if (response.option[i].ShippingPoints != null) {
                            response.option[i].SelectedPoint = response.option[i].SelectedPoint || response.option[i].ShippingPoints[0];
                        }
                    }

                    if (ctrl.ngSelectShipping == null) {
                        return ctrl.Shipping = null;
                    }

                    return ctrl.Shipping = response;
                });
        };

        ctrl.fetchPayment = function () {
            return checkoutService.getPayment()
                .then(function (response) {

                    ctrl.ngSelectPayment = ctrl.getSelectedItem(response.option, response.selectPayment);

                    return ctrl.Payment = response;
                });
        };

        ctrl.fetchCart = function () {
            return checkoutService.getCheckoutCart()
                .then(function (response) {
                    ctrl.showCart = true;
                    ctrl.isShowCouponInput = response.Certificate == null && response.Coupon == null;
                    if (ctrl.Cart.Discount != null) {
                        ctrl.Cart.Discount.Key = $sce.trustAsHtml(ctrl.Cart.Discount.Key);
                    }
                    if (ctrl.Cart.Coupon != null) {
                        ctrl.Cart.Coupon.Key = $sce.trustAsHtml(ctrl.Cart.Coupon.Key);
                    }

                    return ctrl.Cart = response;
                });
        };

        ctrl.getSelectedItem = function (array, selectedItem) {
            var item;

            for (var i = array.length - 1; i >= 0; i--) {
                if (array[i].Id === selectedItem.Id) {
                    //selectedItem имеет заполненные поля какие опции выбраны, поэтому объединяем
                    array[i] = angular.extend(array[i], selectedItem);
                    item = array[i];
                    break;
                }
            }

            return item;
        };

        ctrl.autorizeBonus = function (cardNumber) {
            return checkoutService.autorizeBonus(cardNumber).then(function () {
                return ctrl.callRelationship('bonus');
            });
        };

        ctrl.changeBonus = function (isApply) {
            return checkoutService.toggleBonus(isApply).then(ctrl.callRelationship.bind(ctrl, 'bonus'));
        };

        ctrl.applyCoupon = function () {
            ctrl.isShowCoupon = false;
            return checkoutService.couponApplied().then(ctrl.callRelationship.bind(ctrl, 'coupon'));
        };

        ctrl.deleteCard = function () {
            ctrl.isShowCoupon = true;
            return checkoutService.couponApplied().then(ctrl.callRelationship.bind(ctrl, 'coupon'));
        };

        ctrl.commentSave = function (message) {
            checkoutService.commentSave(message);
        };

        ctrl.saveNewCustomer = function (field, timeout) {
            if (saveCustomerTimer != null) {
                $timeout.cancel(saveCustomerTimer);
            }

            return saveCustomerTimer = $timeout(function () {
                if (field === 'email') {
                    window.PubSub.publish('customer.email', ctrl.newCustomer);
                }

                checkoutService.saveNewCustomer(ctrl.newCustomer).then(ctrl.fetchCart);
            }, timeout != null ? timeout : 700);
        };

        ctrl.saveWantBonusCard = function () {
            checkoutService.saveWantBonusCard(ctrl.wantBonusCard).then(ctrl.fetchCart);;
        };

        ctrl.saveContact = function (stopUpdateShipping, timeout) {

            if (saveContactTimer != null) {
                $timeout.cancel(saveContactTimer);
            }

            return saveContactTimer = $timeout(function () {
                var currentContact = ctrl.contact.length > 1 ? ctrl.contact[0] : ctrl.contact;

                if (saveContactHttpTimer != null) {
                    saveContactHttpTimer.resolve();
                }

                saveContactHttpTimer = $q.defer();

                return checkoutService.saveContact(currentContact, { timeout: saveContactHttpTimer.promise })
                        .then(function (data) {
                            saveContactHttpTimer = null;

                            if (stopUpdateShipping == null || stopUpdateShipping === false) {
                                ctrl.startShippingProgress();
                                ctrl.startPaymentProgress();

                                return ctrl.callRelationship('address', data).finally(function () {
                                    ctrl.stopShippingProgress();
                                    ctrl.stopPaymentProgress();
                                });
                            } else {
                                return $q.resolve(data);
                            }
                        });
            }, timeout != null ? timeout : 700);
        };

        ctrl.processCity = function (zone, timeout) {
            if (processContactTimer != null) {
                $timeout.cancel(processContactTimer);
            }

            return processContactTimer = $timeout(function () {
                var currentContact = ctrl.contact.length > 1 ? ctrl.contact[0] : ctrl.contact;
                if (zone != null) {
                    currentContact.District = zone.District;
                    currentContact.Region = zone.Region;
                    currentContact.Country = zone.CountryName || zone.Country;
                    currentContact.Zip = zone.Zip;
                };
                currentContact.byCity = zone == null;

                checkoutService.processContact(currentContact).then(function (data) {
                    if (data.result === true) {
                        currentContact.District = data.obj.District;
                        currentContact.Region = data.obj.Region;
                        currentContact.Country = data.obj.Country;
                        currentContact.Zip = data.obj.Zip;
                    }
                    ctrl.saveContact(null, 0);
                });
            }, timeout != null ? timeout : 700);
        };

        ctrl.processAddress = function (data, timeout) {
            if (processContactTimer != null) {
                $timeout.cancel(processContactTimer);
            }

            return processContactTimer = $timeout(function () {
                var currentContact = ctrl.contact.length > 1 ? ctrl.contact[0] : ctrl.contact;
                currentContact.byCity = false;
                if (data != null && data.Zip) {
                    currentContact.Zip = data.Zip;
                    ctrl.saveContact(null, 0);
                } else {
                    checkoutService.processContact(currentContact).then(function (data) {
                        if (data.result === true && data.obj.Zip) {
                            currentContact.Zip = data.obj.Zip;
                        }
                        ctrl.saveContact(null, 0);
                    });
                }
            }, timeout != null ? timeout : 700);
        };

        ctrl.submitOrder = function (event) {

            event.preventDefault();

            ctrl.confirmInProgress = true;

            checkoutService.saveContact(ctrl.contact)
                .then(function () {

                    if (ctrl.checkoutNewCustomerForm != null) {
                        checkoutService.saveNewCustomer(ctrl.newCustomer);
                    }

                    return checkoutService.saveShipping(ctrl.ngSelectShipping);
                })
                .then(function () {
                    return checkoutService.savePayment(ctrl.ngSelectPayment);
                })
                .then(function () {
                    return checkoutService.commentSave(ctrl.comment);
                }).
                then(function () {
                    //todo: remove this code
                    document.querySelector('.js-checkout-form').submit();
                })
                .catch(function () {
                    ctrl.confirmInProgress = false;
                });
        };

        ctrl.submitMobile = function () {
            if (ctrl.process) {
                return;
            }
            ctrl.process = true;

            $http.post('mobile/checkoutmobile/confirm', { name: ctrl.name, phone: ctrl.phone, email: ctrl.email, message: ctrl.message, rnd: Math.random() })
                .then(function (response) {
                    var data = response.data;

                    ctrl.responseOrderNo = data.orderNumber;
                    if (data.error == null || data.error == "") {
                        window.PubSub.publish("order_from_mobile");

                        setTimeout(function () {

                            if (data.redirectToUrl) {
                                window.location = data.url;

                            } else if (data.code == null || data.orderNumber == null) {
                                window.location = data.url;

                            } else {
                                window.location = window.location.pathname.replace('/index', '') + '/success?code=' + (data.code != null ? data.code : "");
                            }

                            ctrl.process = false;
                            $rootScope.$apply();
                        }, 2000);
                    } else {
                        ctrl.process = false;
                        console.log("Error " + data.error);

                        if (data.error == 'redirectToCart') {
                            window.location = data.url;
                        } else {
                            alert(data.error);
                        }
                    }
                },
                    function () {
                        console.log("Error");
                        ctrl.process = false;
                    });
        };

        ctrl.changeTempEmail = function (email) {
            $http.post("myaccount/updatecustomeremail", { email: email }).then(function (response) {

                if (response.data === true) {
                    ctrl.modalWrongNewEmail = false;
                    window.location.reload(true);
                } else {
                    ctrl.modalWrongNewEmail = true;
                }
            });
        };

        ctrl.callRelationship = function (name, data) {
            return relationship[name](data)
                .then(function (data) {
                    checkoutService.processCallbacks('relationshipEnd');
                    return data;
                });
        };

        ctrl.buyOneClickSuccessFn = function (result) {
            if (result.doGo === true && result.url != null) {
                $window.location.assign(result.url);
            }
        }
};

export default CheckOutCtrl;