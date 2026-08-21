import yandexdeliveryTemplate from './yandexdelivery.tpl.html';
import 'yandexdelivery.scss';

(function (ng) {
    

    ng.module('yandexdelivery', [])
        .controller('YandexDeliveryCtrl', [
            '$document',
            '$scope',
            'urlHelper',
            'shippingService',
            function ($document, $scope, urlHelper, shippingService) {
                const ctrl = this;

                ctrl.init = function () {
                    if (!window.isYandexDeliveryLoaded) {
                        window.isYandexDeliveryLoaded = true;

                        jQuery.getScript(ctrl.yandexDeliveryWidgetCodeYa, () => {
                            //$(document.body).append($('<link rel="stylesheet" type="text/css" />').attr('href', yandexdeliveryCss));

                            ydwidget.ready(() => {
                                shippingService.fireTemplateReady($scope);

                                yd$('body').prepend('<div id="ydwidget" class="yd-widget-modal"></div>');

                                ydwidget.initCartWidget({
                                    getCity () {
                                        const contact = ctrl.yandexDeliveryContact;
                                        if (contact != null && contact.City != null) {
                                            return { value: contact.City };
                                        }
                                        return false;
                                    },

                                    //id элемента-контейнера
                                    el: 'ydwidget',
                                    //общее количество товаров в корзине
                                    totalItemsQuantity () {
                                        return ctrl.yandexDeliveryAmount;
                                    },
                                    //общий вес товаров в корзине
                                    weight () {
                                        return ctrl.yandexDeliveryWeight;
                                    },
                                    //общая стоимость товаров в корзине
                                    cost () {
                                        return ctrl.yandexDeliveryCost;
                                    },
                                    //габариты и количество по каждому товару в корзине
                                    itemsDimensions () {
                                        return eval(ctrl.yandexDeliveryDimensions);
                                    },
                                    //обработка смены варианта доставки
                                    onDeliveryChange (delivery) {
                                        //если выбран вариант доставки, выводим его описание и закрываем виджет, иначе произошел сброс варианта,
                                        //очищаем описание
                                        if (delivery) {
                                            ctrl.setYaDeliveryAnswer(delivery);
                                            ydwidget.cartWidget.close();
                                        }
                                    },
                                    // Объявленная ценность заказа. Влияет на расчет стоимости в предлагаемых вариантах доставки.
                                    assessed_value: ctrl.yandexDeliveryShowAssessedValue ? ctrl.yandexDeliveryCost : 0,
                                    //'onlyPickuppoints': true, //old param
                                    onlyDeliveryTypes () {
                                        return ['pickup'];
                                    },
                                    createOrderFlag () {
                                        return false;
                                    },
                                    order: {
                                        //имя, фамилия, телефон, улица, дом, индекс
                                        recipient_first_name () {
                                            return '';
                                        },
                                        recipient_last_name () {
                                            return '';
                                        },
                                        recipient_phone () {
                                            return '';
                                        },
                                        deliverypoint_street () {
                                            return '';
                                        },
                                        deliverypoint_house () {
                                            return '';
                                        },
                                        deliverypoint_index () {
                                            return '';
                                        },
                                    },
                                    onLoad () {
                                        ctrl.customBind();
                                    },
                                });
                            });
                        });
                    }
                };

                ctrl.setYaDeliveryAnswer = function (delivery) {
                    if (typeof delivery === 'string') {
                        delivery = new Function(`return ${  delivery}`)();
                    }

                    const additionalData = {
                        direction: delivery.direction,
                        delivery: delivery.delivery_id,
                        price: delivery.costWithRules,
                        tariffId: delivery.tariffId,
                    };

                    if (delivery.settings != null && delivery.settings.to_yd_warehouse != null) {
                        additionalData.to_ms_warehouse = parseInt(delivery.settings.to_yd_warehouse);
                    }

                    let description = delivery.delivery.name;
                    if (delivery.full_address != null) {
                        description += `, ${  delivery.full_address}`;
                    }
                    if (delivery.days != null && delivery.days != '') {
                        description += `, ${  ctrl.prepareDeliveryTime(delivery.days, ctrl.yandexDeliveryShipping.ExtraDeliveryTime)  } дн`;
                    }

                    if (delivery.deliveryIntervalFormatted != null && delivery.deliveryIntervalFormatted != '') {
                        description += `, ${  delivery.deliveryIntervalFormatted}`;
                    }

                    ctrl.yandexDeliveryShipping.PickpointId = delivery.pickuppointId;
                    ctrl.yandexDeliveryShipping.PickpointAddress = description;
                    ctrl.yandexDeliveryShipping.PickpointAdditionalData = JSON.stringify(additionalData);
                    ctrl.yandexDeliveryShipping.TariffId = delivery.tariffId;

                    ctrl.yandexDeliveryCallback({
                        event: 'yandexDelivery',
                        field: ctrl.yandexDeliveryShipping.PickpointId || 0,
                        shipping: ctrl.yandexDeliveryShipping,
                    });

                    $scope.$digest();
                };

                ctrl.prepareDeliveryTime = function (days, extraTime) {
                    if (days == null || extraTime <= 0) {
                        return days;
                    }

                    try {
                        const arr = days.replace(' - ', '-').split('-');
                        if (arr.length == 2) {
                            return `${parseInt(arr[0]) + extraTime  }-${  parseInt(arr[1]) + extraTime}`;
                        } else if (arr.length == 1) {
                            return parseInt(arr[0]) + extraTime;
                        }
                    } catch (err) {
                        console.error(err.message);
                    }
                    return days;
                };

                ctrl.customBind = function () {
                    $document.on('click', '#cw_variants_header', function (event) {
                        if (event.target.id === 'cw_variants_header') {
                            const header = this;
                            if (header.classList.contains('yandexdelivery-custom-header--opened')) {
                                header.classList.remove('yandexdelivery-custom-header--opened');
                            } else {
                                header.classList.add('yandexdelivery-custom-header--opened');
                            }
                        }
                    });
                };
            },
        ])
        .directive('yandexDelivery', [
            'urlHelper',
            function (urlHelper) {
                return {
                    scope: {
                        yandexDeliveryShipping: '=',
                        yandexDeliveryCallback: '&',
                        yandexDeliveryWidgetCodeYa: '=',
                        yandexDeliveryShowAssessedValue: '=',
                        yandexDeliveryAmount: '=',
                        yandexDeliveryWeight: '=',
                        yandexDeliveryCost: '=',
                        yandexDeliveryDimensions: '=',
                        yandexDeliveryIsSelected: '=',
                        yandexDeliveryContact: '=',
                    },
                    controller: 'YandexDeliveryCtrl',
                    controllerAs: 'yandexDelivery',
                    bindToController: true,
                    templateUrl: yandexdeliveryTemplate,
                    link (scope, element, attrs, ctrl) {
                        ctrl.init();
                    },
                };
            },
        ]);
})(window.angular);
