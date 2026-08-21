import { PubSub } from '../../_common/PubSub/PubSub.js';

/* @ngInject */
function CheckOutCtrl(
    $http,
    $q,
    $sce,
    $rootScope,
    $timeout,
    $window,
    toaster,
    zoneService,
    checkoutService,
    cartService,
    cartConfig,
    $location,
    Upload,
    SweetAlert,
    $translate,
    advCacheService,
    geoModeService,
) {
    let ctrl = this,
        relationship,
        saveContactTimer,
        saveContactHttpTimer,
        processContactTimer,
        saveCustomerTimer,
        processCompanyNameTimer,
        saveRecipientTimer,
        saveCustomerRequiredFieldsTimer;

    const cacheStorageShipping = new Map();
    const cacheStoragePayment = new Map();
    const cacheStorageCart = new Map();

    const cacheStorageShippingSelected = new Map();
    const cacheStoragePaymentSelected = new Map();

    ctrl.$onInit = function () {
        //ctrl.address = {};
        ctrl.Payment = {};
        ctrl.Shipping = {};
        ctrl.Cart = {};
        ctrl.isShowCouponInput = false;
        ctrl.newCustomer = {};
        ctrl.contact = {};
        ctrl.shippingLoading = true;
        ctrl.paymentLoading = true;

        ctrl.typeCalculationVariants = 'all';

        cartService.addCallback(cartConfig.callbackNames.update, () => {
            ctrl.callRelationship('address');
        });
        cartService.addCallback(cartConfig.callbackNames.remove, (cart, params) => {
            if (params.TotalItems === 0) {
                const locationParams = $location.search();
                const { lpId } = locationParams;
                if (lpId != null) {
                    $window.location.reload();
                } else {
                    $window.location.assign('cart');
                }
            } else {
                ctrl.callRelationship('address');
            }
        });
        cartService.addCallback(cartConfig.callbackNames.clear, (cart) => {
            $location.path('cart');
        });
    };

    relationship = {
        address() {
            return ctrl
                .fetchShipping()
                .then(ctrl.fetchPayment)
                .then(ctrl.fetchCart)
                .then((data) => {
                    checkoutService.processCallbacks('address');
                    return data;
                });
        },
        shipping() {
            return ctrl
                .fetchPayment()
                .then(ctrl.fetchCart)
                .then((data) => {
                    checkoutService.processCallbacks('shipping');
                    return data;
                });
        },
        payment() {
            return ctrl
                .fetchShipping()
                .then(ctrl.fetchCart)
                .then((data) => {
                    checkoutService.processCallbacks('payment');
                    return data;
                });
        },
        bonus() {
            return ctrl
                .fetchShipping()
                .then(ctrl.fetchPayment)
                .then(ctrl.fetchCart)
                .then((data) => {
                    checkoutService.processCallbacks('bonus');
                    return data;
                });
        },
        coupon() {
            return ctrl
                .fetchShipping()
                .then(ctrl.fetchPayment)
                .then(ctrl.fetchCart)
                .then((data) => {
                    checkoutService.processCallbacks('coupon');
                    return data;
                });
        },
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

    ctrl.startAddressListProgress = function () {
        ctrl.addressListLoading = true;
    };

    ctrl.stopAddressListProgress = function () {
        ctrl.addressListLoading = false;
    };

    ctrl.getAddress = function (contactsExits, useZone, prefetchData) {
        if (contactsExits === true) {
            ctrl.changeListAddress = function (address) {
                ctrl.contact = address;
                ctrl.startShippingProgress();
                ctrl.startPaymentProgress();
                ctrl.startAddressListProgress();

                ctrl.saveContact()
                    .then(() => ctrl.resetLastModified())
                    .then(() => {
                        zoneService.getCurrentZone().then((data) => {
                            if (data != null && data.City !== address.City) {
                                zoneService.setCurrentZone(address.City, address, address.CountryId, address.Region, address.Country, address.Zip, address.District).then((zone) => {
                                    if (zone?.ReloadPage) {
                                        location.reload();
                                    }
                                });
                            }
                        });
                    })
                    .then(() => {
                        ctrl.stopShippingProgress();
                        ctrl.stopPaymentProgress();
                    })
                    .catch((error) => {
                        console.error(error);
                    })
                    .finally(() => {
                        ctrl.stopAddressListProgress();
                    });
            };

            ctrl.removeAddress = function (addressSelected) {
                ctrl.changeListAddress(addressSelected);
            };
        } else {
            zoneService.addCallback('set', (data) => {
                ctrl.contact.Country = data.CountryName;
                ctrl.contact.City = data.City;
                ctrl.contact.Region = data.Region;
                ctrl.contact.Zip = data.Zip;

                ctrl.startShippingProgress();
                ctrl.startPaymentProgress();

                ctrl.processCity(data, 0).then(() => {
                    ctrl.stopShippingProgress();
                    ctrl.stopPaymentProgress();
                });
            });

            if (useZone) {
                zoneService.getCurrentZone().then((data) => {
                    ctrl.contact ||= {};
                    ctrl.contact = Object.assign(ctrl.contact, prefetchData);
                    ctrl.contact.Country = data.CountryName;
                    ctrl.contact.City = data.City;
                    ctrl.contact.Region = data.Region;
                    ctrl.contact.Zip = data.Zip;

                    ctrl.processCity(data, 0).then(() => {
                        ctrl.stopShippingProgress();
                        ctrl.stopPaymentProgress();
                    });
                });
            } else {
                ctrl.startShippingProgress();
                ctrl.startPaymentProgress();
                ctrl.callRelationship('address').finally(() => {
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

        checkoutService
            .saveShipping(shipping, null, ctrl.typeCalculationVariants)
            .then((response) => {
                ctrl.stopShippingProgress();
                ctrl.stopPaymentProgress();
                return (ctrl.ngSelectShipping = angular.extend(ctrl.ngSelectShipping, response.selectShipping));
            })
            .then(ctrl.callRelationship.bind(ctrl, 'shipping'))
            .then(() => {
                // для виджета доставки ставим куку, чтобы запоминать актуальный
                // пункт самовывоза
                if (shipping.ShippingType === 'PointDelivery' && ctrl.enableGeoMode) {
                    geoModeService.setShippingPointCookie({
                        shippingOptionId: shipping.Id,
                        pointId: shipping.SelectedPoint?.Id,
                    });
                }
            })
            .then(() => ctrl.resetLastModified());
    };

    ctrl.changePayment = function (payment) {
        ctrl.startPaymentProgress();

        if (ctrl.ngSelectPayment !== payment) {
            ctrl.ngSelectPayment = payment;
        }

        checkoutService
            .savePayment(payment)
            .then(ctrl.callRelationship.bind(ctrl, 'payment'))
            .then(() => {
                ctrl.stopPaymentProgress();
            })
            .then(() => ctrl.resetLastModified());
    };

    ctrl.changePaymentDetails = function (payment) {
        ctrl.startPaymentProgress();

        if (ctrl.ngSelectPayment !== payment) {
            ctrl.ngSelectPayment = payment;
        }

        checkoutService.savePayment(payment).then(() => {
            ctrl.stopPaymentProgress();
        });
    };

    ctrl.fetchShipping = function () {
        return checkoutService
            .getShipping(null, ctrl.typeCalculationVariants)
            .then(fetchTypeCalculationVariants)
            .then((response) => {
                ctrl.ngSelectShipping = ctrl.getSelectedItem(response.option, response.selectShipping);

                const selectedPoint = ctrl.ngSelectShipping?.SelectedPoint;
                response.option?.forEach((option) => {
                    const points = option.ShippingPoints;
                    if (selectedPoint != null) {
                        if (Array.isArray(points)) {
                            option.SelectedPoint = points.find((it) => it.Id === selectedPoint.Id);
                        }
                    }
                    // else if (Array.isArray(points)) {
                    //     option.SelectedPoint = points.length === 1 ? points[0] : null;
                    // }
                });

                if (response.typeCalculationVariants != null) {
                    ctrl.typeCalculationVariants = response.typeCalculationVariants;
                }

                cacheStorageShipping.set(ctrl.typeCalculationVariants, response);

                if (ctrl.ngSelectShipping == null) {
                    return (ctrl.Shipping = null);
                }
                return (ctrl.Shipping = response);
            });
    };

    function fetchTypeCalculationVariants(getShippingResponse) {
        if (getShippingResponse.typeCalculationVariants == null) {
            const defer = $q.defer(),
                { promise } = defer;
            defer.resolve(getShippingResponse);
            ctrl.showSplitShippingByType = false;
            return promise;
        }

        let type = getShippingResponse.typeCalculationVariants;
        if (type == 'courier') {
            type = 'self-delivery';
        } else {
            type = 'courier';
        }
        let showSplitShippingByType = true;
        if (getShippingResponse.option == null || getShippingResponse.option.length == 0) {
            showSplitShippingByType = false;
        }
        return checkoutService.getShipping(null, type, !showSplitShippingByType).then((response) => {
            if (response.option == null || response.option.length == 0) {
                if (showSplitShippingByType) ctrl.typeCalculationVariants = getShippingResponse.typeCalculationVariants;
                showSplitShippingByType = false;
            } else if (!showSplitShippingByType) {
                ctrl.typeCalculationVariants = response.typeCalculationVariants;
                getShippingResponse = response;
            }
            ctrl.showSplitShippingByType = showSplitShippingByType;
            return getShippingResponse;
        });
    }

    ctrl.fetchPayment = function () {
        return checkoutService.getPayment().then((response) => {
            ctrl.ngSelectPayment = ctrl.getSelectedItem(response.option, response.selectPayment);

            cacheStoragePayment.set(ctrl.typeCalculationVariants, response);

            return (ctrl.Payment = response);
        });
    };

    ctrl.fetchCart = function () {
        return checkoutService.getCheckoutCart().then((response) => {
            ctrl.showCart = true;
            ctrl.isShowCouponInput = response.Certificate == null && response.Coupon == null;
            if (ctrl.Cart.Discount != null) {
                ctrl.Cart.Discount.Key = $sce.trustAsHtml(ctrl.Cart.Discount.Key);
            }
            if (ctrl.Cart.Coupon != null) {
                ctrl.Cart.Coupon.Key = $sce.trustAsHtml(ctrl.Cart.Coupon.Key);
            }

            cacheStorageCart.set(ctrl.typeCalculationVariants, response);

            if (ctrl.shoppingCart != null) {
                ctrl.shoppingCart.refresh();
            }

            return (ctrl.Cart = response);
        });
    };

    ctrl.getSelectedItem = function (array, selectedItem) {
        let item;

        for (let i = array.length - 1; i >= 0; i--) {
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
        return checkoutService.autorizeBonus(cardNumber).then(() => ctrl.callRelationship('bonus'));
    };

    ctrl.changeBonus = function (appliedBonuses) {
        return checkoutService
            .toggleBonus(appliedBonuses)
            .then((response) => {
                ctrl.appliedBonuses = response.appliedBonuses || ctrl.appliedBonuses;
            })
            .then(ctrl.callRelationship.bind(ctrl, 'bonus'));
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

    ctrl.saveDontCallBack = function () {
        checkoutService.saveDontCallBack(ctrl.dontCallBack);
    };

    ctrl.saveCountDevices = function () {
        checkoutService.saveCountDevices(ctrl.countDevices);
    };

    ctrl.getCheckoutAttachments = function () {
        checkoutService.getCheckoutAttachments().then((data) => {
            ctrl.attachments = data.Attachments;
            ctrl.filesHelpText = data.FilesHelpText;
            ctrl.allowedFileExtensions = data.AllowedFileExtensions;
        });
    };

    ctrl.selectedFiles = function ($files, $file, $newFiles, $duplicateFiles, $invalidFiles, $event) {
        if ($files && $files.length > 0) {
            let exceededLimit = false;
            if (ctrl.attachments && ctrl.attachments.length + $files.length > 10) {
                exceededLimit = true;
                $files.splice(10 - ctrl.attachments.length);
            }
            ctrl.loadingFiles = true;
            Upload.upload({
                url: '/checkout/uploadAttachments',
                file: $files,
            }).then((response) => {
                const { data } = response;
                if (exceededLimit) toaster.error($translate.instant('Js.Checkout.File.ExceededLimit'));
                if (data.result) {
                    for (const i in data.obj) {
                        if (data.obj[i].Result === true) {
                            ctrl.attachments.push(data.obj[i].Attachment);
                            toaster.success(
                                $translate.instant('Js.Checkout.File') +
                                    data.obj[i].Attachment.FileName +
                                    $translate.instant('Js.Checkout.FileWasAdded'),
                            );
                        } else {
                            toaster.error(
                                $translate.instant('Js.ErrorLoading'),
                                (data.obj[i].Attachment != null ? `${data.obj[i].Attachment.FileName}: ` : '') + data.obj[i].Error,
                            );
                        }
                    }
                } else if (data.errors) {
                    data.errors.forEach((error) => {
                        toaster.error(error);
                    });
                } else {
                    toaster.error($translate.instant('Js.ErrorLoading'));
                }
                $files.splice(0);
                ctrl.loadingFiles = false;
            });
        } else if ($invalidFiles.length > 0) {
            toaster.pop('error', $translate.instant('Js.ErrorLoading'), $translate.instant('Js.Order.FileDoesNotMeet'));
            ctrl.loadingFiles = false;
        } else {
            ctrl.loadingFiles = false;
        }
    };

    ctrl.deleteAttachment = function (id, index) {
        SweetAlert.confirm($translate.instant('Js.AreYouSureDelete'), {
            title: $translate.instant('Js.Deleting'),
        }).then((result) => {
            if (result === true || result.value) {
                checkoutService.deleteAttachment(id).then((data) => {
                    if (data) {
                        ctrl.attachments.splice(index, 1);
                        toaster.pop('success', '', $translate.instant('Js.Order.SuccessfullyDeleted'));
                    } else {
                        toaster.pop('error', $translate.instant('Js.DeletingError'));
                    }
                });
            }
        });
    };

    ctrl.saveAgreementForNewsletter = function () {
        checkoutService.saveAgreementForNewsletter(ctrl.isAgreeForPromotionalNewsletter);
    };

    ctrl.saveNewCustomer = function (field, timeout) {
        if (saveCustomerTimer != null) {
            $timeout.cancel(saveCustomerTimer);
        }

        return (saveCustomerTimer = $timeout(
            () => {
                if (field === 'email') {
                    PubSub.publish('customer.email', ctrl.newCustomer);
                }

                ctrl.newCustomer.CustomerType = ctrl.customerType;
                checkoutService.saveNewCustomer(ctrl.newCustomer).then(ctrl.fetchCart).then(ctrl.fetchPayment);
            },
            timeout != null ? timeout : 700,
        ));
    };

    ctrl.saveRecipient = function (timeout) {
        if (saveRecipientTimer != null) {
            $timeout.cancel(saveRecipientTimer);
        }

        return (saveRecipientTimer = $timeout(
            () => {
                checkoutService.saveRecipient(ctrl.newCustomer);
            },
            timeout != null ? timeout : 700,
        ));
    };

    ctrl.saveCustomerRequiredFields = function (timeout) {
        if (saveCustomerRequiredFieldsTimer != null) {
            $timeout.cancel(saveCustomerRequiredFieldsTimer);
        }

        return (saveCustomerRequiredFieldsTimer = $timeout(
            () => {
                checkoutService.saveCustomerRequiredFields(ctrl.newCustomer);
            },
            timeout != null ? timeout : 700,
        ));
    };

    ctrl.saveWantBonusCard = function () {
        checkoutService.saveWantBonusCard(ctrl.wantBonusCard).then(ctrl.fetchCart);
    };

    ctrl.saveContact = function (stopUpdateShipping, timeout) {
        if (saveContactTimer != null) {
            $timeout.cancel(saveContactTimer);
        }

        return (saveContactTimer = $timeout(
            () => {
                const currentContact = ctrl.contact?.length > 1 ? ctrl.contact[0] : ctrl.contact;

                if (currentContact == null) {
                    return null;
                }

                if (saveContactHttpTimer != null) {
                    saveContactHttpTimer.resolve();
                }

                saveContactHttpTimer = $q.defer();

                return checkoutService.saveContact(currentContact, { timeout: saveContactHttpTimer.promise }).then((data) => {
                    saveContactHttpTimer = null;

                    cacheStorageShipping.clear();
                    cacheStoragePayment.clear();
                    cacheStorageCart.clear();

                    cacheStorageShippingSelected.clear();
                    cacheStoragePaymentSelected.clear();

                    if (stopUpdateShipping == null || stopUpdateShipping === false) {
                        ctrl.startShippingProgress();
                        ctrl.startPaymentProgress();

                        return ctrl.callRelationship('address', data).finally(() => {
                            ctrl.stopShippingProgress();
                            ctrl.stopPaymentProgress();
                        });
                    }
                    return $q.resolve(data);
                });
            },
            timeout != null ? timeout : 700,
        ));
    };

    ctrl.processCity = function (zone, timeout) {
        if (processContactTimer != null) {
            $timeout.cancel(processContactTimer);
        }

        return (processContactTimer = $timeout(
            () => {
                const currentContact = ctrl.contact?.length > 1 ? ctrl.contact[0] : ctrl.contact;
                if (zone != null) {
                    currentContact.District = zone.District;
                    currentContact.Region = zone.Region;
                    currentContact.Country = zone.CountryName || zone.Country;
                    currentContact.Zip = zone.Zip;
                }

                currentContact.byCity = zone == null;

                return checkoutService
                    .processContact(currentContact)
                    .then((data) => {
                        if (data.result === true) {
                            currentContact.District = data.obj.District;
                            currentContact.Region = data.obj.Region;
                            currentContact.Country = data.obj.Country;
                            currentContact.Zip = data.obj.Zip;
                        }
                        return currentContact;
                    })
                    .then(() => ctrl.saveContact(null, 0));
            },
            timeout != null ? timeout : 700,
        ));
    };

    ctrl.processAddress = function (data, timeout) {
        if (processContactTimer != null) {
            $timeout.cancel(processContactTimer);
        }

        return (processContactTimer = $timeout(
            () => {
                const currentContact = ctrl.contact?.length > 1 ? ctrl.contact[0] : ctrl.contact;
                currentContact.byCity = false;
                if (data != null && data.Zip) {
                    currentContact.Zip = data.Zip;
                    ctrl.saveContact(null, 0);
                } else {
                    checkoutService.processContact(currentContact).then((data) => {
                        if (data.result === true && data.obj.Zip) {
                            currentContact.Zip = data.obj.Zip;
                        }
                        ctrl.saveContact(null, 0);
                    });
                }
            },
            timeout != null ? timeout : 700,
        ));
    };

    ctrl.submitOrder = function (event) {
        event.preventDefault();

        ctrl.confirmInProgress = true;

        checkoutService
            .saveContact(ctrl.contact)
            .then(() => {
                if (ctrl.checkoutNewCustomerForm != null) {
                    ctrl.newCustomer.CustomerType = ctrl.customerType;
                    checkoutService.saveNewCustomer(ctrl.newCustomer);
                }

                return checkoutService.saveShipping(ctrl.ngSelectShipping);
            })
            .then(() => checkoutService.savePayment(ctrl.ngSelectPayment))
            .then(() => checkoutService.commentSave(ctrl.comment))
            .then(() => checkoutService.saveAgreementForNewsletter(ctrl.isAgreeForPromotionalNewsletter))
            .then(() => {
                //todo: remove this code
                document.querySelector('.js-checkout-form').submit();
            })
            .catch(() => {
                ctrl.confirmInProgress = false;
            });
    };

    ctrl.submitMobile = function () {
        if (ctrl.process) {
            return;
        }
        ctrl.process = true;

        $http
            .post('mobile/checkoutmobile/confirm', {
                name: ctrl.name,
                phone: ctrl.phone,
                email: ctrl.email,
                message: ctrl.message,
                rnd: Math.random(),
            })
            .then(
                (response) => {
                    const { data } = response;

                    ctrl.responseOrderNo = data.orderNumber;
                    if (data.error == null || data.error == '') {
                        PubSub.publish('order_from_mobile');

                        setTimeout(() => {
                            if (data.redirectToUrl) {
                                window.location = data.url;
                            } else if (data.code == null || data.orderNumber == null) {
                                window.location = data.url;
                            } else {
                                window.location = `${window.location.pathname.replace('/index', '')}/success?code=${data.code != null ? data.code : ''}`;
                            }

                            ctrl.process = false;
                            $rootScope.$apply();
                        }, 2000);
                    } else {
                        ctrl.process = false;
                        console.log(`Error ${data.error}`);

                        if (data.error == 'redirectToCart') {
                            window.location = data.url;
                        } else {
                            alert(data.error);
                        }
                    }
                },
                () => {
                    console.log('Error');
                    ctrl.process = false;
                },
            );
    };

    ctrl.changeTempEmail = function (email) {
        $http.post('myaccount/updatecustomeremail', { email }).then((response) => {
            if (response.data === true) {
                ctrl.modalWrongNewEmail = false;
                window.location.reload(true);
            } else {
                ctrl.modalWrongNewEmail = true;
            }
        });
    };

    ctrl.callRelationship = function (name, data) {
        return relationship[name](data).then((data) => {
            checkoutService.processCallbacks('relationshipEnd');
            return data;
        });
    };

    ctrl.buyOneClickSuccessFn = function (result) {
        if (result.doGo === true && result.url != null) {
            $window.location.assign(result.url);
        }
    };

    ctrl.processCompanyName = function (item) {
        if (processCompanyNameTimer != null) {
            $timeout.cancel(processCompanyNameTimer);
        }

        return (processCompanyNameTimer = $timeout(
            () => {
                if (item != null && item.CompanyData) {
                    ctrl.newCustomer.CustomerFields.forEach((field) => {
                        if (field.FieldAssignment == 1) field.Value = item.CompanyData.CompanyName;
                        else if (field.FieldAssignment == 2) field.Value = item.CompanyData.LegalAddress;
                        else if (field.FieldAssignment == 3) field.Value = item.CompanyData.INN;
                        else if (field.FieldAssignment == 4) field.Value = item.CompanyData.KPP;
                        else if (field.FieldAssignment == 5) field.Value = item.CompanyData.OGRN;
                        else if (field.FieldAssignment == 6) field.Value = item.CompanyData.OKPO;
                    });
                } else if (item != null && item.BankData) {
                    ctrl.newCustomer.CustomerFields.forEach((field) => {
                        if (field.FieldAssignment == 7) field.Value = item.BankData.BIK;
                        else if (field.FieldAssignment == 8) field.Value = item.BankData.BankName;
                        else if (field.FieldAssignment == 9) field.Value = item.BankData.CorrespondentAccount;
                    });
                }
            },
            item != null ? 0 : 700,
        ));
    };

    ctrl.changeShippingType = function (type) {
        cacheStorageShippingSelected.set(ctrl.typeCalculationVariants, ctrl.ngSelectShipping);
        cacheStoragePaymentSelected.set(ctrl.typeCalculationVariants, ctrl.ngSelectPayment);

        if (ctrl.typeCalculationVariants != type) if (type == 'courier') ctrl.changeReceivingMethod(null);

        ctrl.typeCalculationVariants = type;

        if (cacheStorageShipping.has(type)) {
            ctrl.Shipping = cacheStorageShipping.get(type);
            ctrl.ngSelectShipping = cacheStorageShippingSelected.get(type);

            ctrl.Payment = cacheStoragePayment.get(type);
            ctrl.ngSelectPayment = cacheStoragePaymentSelected.get(type);

            ctrl.Cart = cacheStorageCart.get(type);

            checkoutService
                .setCalculationVariants(ctrl.typeCalculationVariants)
                .catch((error) => {
                    console.error(error);
                })
                .finally(() => {
                    checkoutService.processCallbacks('shipping');
                });
        } else {
            ctrl.startShippingProgress();
            ctrl.startPaymentProgress();
            ctrl.callRelationship('address').finally(() => {
                ctrl.stopShippingProgress();
                ctrl.stopPaymentProgress();
            });
        }
    };

    ctrl.updateCartAmount = function (value, itemId) {
        const item = {
            Key: itemId,
            Value: value,
        };

        checkoutService.updateCartAmount([item]).then(() => {
            PubSub.publish('cart.updateAmount');
        });
    };

    ctrl.removeCartItem = function (event, shoppingCartItemId) {
        event?.preventDefault();
        SweetAlert.confirm($translate.instant('Js.Cart.Removing.AreYouSureDelete'), {
            title: $translate.instant('Js.Cart.Removing'),
            cancelButtonText: $translate.instant('Js.ClearCart.Cancel'),
        }).then((result) => {
            if (result.isConfirmed) {
                checkoutService.removeCartItem(shoppingCartItemId).then((result) => {
                    PubSub.publish('cart.remove', result.offerId);
                });
            }
        });
    };

    ctrl.changeReceivingMethod = function (receivingMethod) {
        if (receivingMethod === ctrl.receivingMethod) return;
        ctrl.receivingMethod = receivingMethod;
        checkoutService.receivingMethodSave(receivingMethod);
    };

    ctrl.resetLastModified = async () => {
        await advCacheService.resetLastModified();
    };

    ctrl.onInitShoppingCart = function (cart) {
        ctrl.shoppingCart = cart;
    };

    ctrl.onCloseLoginModal = function () {
        ctrl.userUnRegType = 'newCustomer';
    };
}

export default CheckOutCtrl;
