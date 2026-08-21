(function (window, document, $, ng) {
    

    function trackYaEvent(target) {
        try {
            const yaCounter = window[`yaCounter${  window.yaCounterId}`];
            yaCounter.reachGoal(target);
        } catch (err) {
            console.warn(`tracking yandex: ${  err.message}`);
        }
    }

    function trackGaEvent(category, action) {
        try {
            if (category == null || category.length == 0) {
                category = 'Advantshop_lp_events';
            }

            if (typeof ga != 'undefined') {
                ga('send', 'event', category, action, document.URL);
            }

            if (typeof dataLayer != 'undefined') {
                dataLayer.push({ event: action, eventCategory: category });
            }
        } catch (err) {
            console.warn(`tracking ga: ${  err.message}`);
        }
    }

    function trackEvent(params) {
        trackGaEvent(params.category, params.action);
        trackYaEvent(params.action);
    }

    const TrackingService = function () {
        const service = this;

        service.trackEvent = trackEvent;
        service.trackYaEvent = trackYaEvent;
        service.trackGaEvent = trackGaEvent;
    };

    const TrackingCtrl = function (trackingService) {
        const ctrl = this;

        ctrl.trackEvent = function () {
            trackingService.trackEvent.apply(ctrl, arguments);
        };
        ctrl.trackYaEvent = function () {
            trackingService.trackYaEvent.apply(ctrl, arguments);
        };
        ctrl.trackGaEvent = function () {
            trackingService.trackGaEvent.apply(ctrl, arguments);
        };
    };

    TrackingCtrl.$inject = ['trackingService'];

    ng.module('tracking', [])
        .service('trackingService', TrackingService)
        .controller('TrackingCtrl', TrackingCtrl)
        .directive('tracking', () => ({
                scope: true,
                controller: 'TrackingCtrl',
                controllerAs: 'tracking',
            }));

    document.addEventListener('DOMContentLoaded', () => {
        // Tracking events
        // Trigger example: $(document).trigger("add_to_cart");
        $(document)
            .on('add_to_cart', (e, url) => {
                try {
                    const path =
                        url.indexOf('products/') != -1
                            ? url.split('products/')[1]
                            : window.location.pathname.replace('products/', '').replace('/', '');
                    if (typeof ga != 'undefined') {
                        ga('send', 'pageview', `/addtocart/${  path}`);
                    }
                } catch (err) {
                    console.warn(`tracking: ${  err.message}`);
                }

                trackEvent({ action: 'addToCart' });
            })
            .on('order.add', () => {
                trackEvent({ action: 'order' });
            })
            .on('buy_one_click_pre', () => {
                trackEvent({ action: 'buyOneClickForm' });
            })
            .on('buy_one_click_confirm', () => {
                trackEvent({ action: 'buyOneClickConfirm' });
            })
            .on('send_feedback', () => {
                trackEvent({ action: 'sendFeedback' });
            })
            .on('send_preorder', () => {
                trackEvent({ action: 'sendPreOrder' });
            })
            .on('add_response', () => {
                trackEvent({ action: 'addResponse' });
            })
            .on('callback', () => {
                trackEvent({ action: 'callBack' });
            })
            .on('callback_request', () => {
                trackEvent({ action: 'callBackRequest' });
            })
            .on('module_callback', () => {
                trackEvent({ action: 'getCallBack' });
            })
            .on('order_from_mobile', () => {
                trackEvent({ action: 'orderFromMobile' });
            });

        $(document).on('cart.add', (e, offerId, productId, amount, attributesXml, cartId) => {
            if (window.dataLayer == null) {
                return false;
            }

            $.ajax({
                type: 'GET',
                async: false,
                dataType: 'json',
                data: {
                    offerId,
                    productId,
                    cartId,
                },
                url: 'landingTracking/getProductById',
                success (data) {
                    if (data != null && data.artno != null) {
                        window.dataLayer.push({
                            ecommerce: {
                                add: {
                                    products: [
                                        {
                                            id: data.artno,
                                            name: data.name,
                                            price: data.price,
                                            brand: data.brand,
                                            category: data.category,
                                            quantity: amount || data.amount,
                                        },
                                    ],
                                },
                            },
                        });
                    }
                },
            });
        });

        $(document).on('cart.remove', (e, offerId) => {
            if (window.dataLayer == null) {
                return false;
            }

            $.ajax({
                type: 'GET',
                async: false,
                dataType: 'json',
                data: {
                    offerid: offerId,
                },
                url: 'landingTracking/getProductByOfferId',
                success (data) {
                    if (data != null && data.artno != null) {
                        window.dataLayer.push({
                            ecommerce: {
                                remove: {
                                    products: [{ id: data.artno, name: data.name }],
                                },
                            },
                        });
                    }
                },
            });
        });
    });
})(window, document, window.jQuery, window.angular);
