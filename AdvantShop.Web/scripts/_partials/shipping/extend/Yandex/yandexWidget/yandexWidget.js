import yandexWidgetTemplate from './yandexWidget.tpl.html';
import './styles.scss';

(function(ng) {
    //https://conscious-woodwind-547.notion.site/8da2db9cbb214498a7c8e5037e0c84ae
    ng.module('yandexDeliveryWidget', [])
        .controller('YandexDeliveryWidgetCtrl', [
            '$http',
            '$scope',
            'shippingService',
            'modalService',
            'checkoutService',
            'zoneService',
            'toaster',
            '$translate',
            'isMobileService',
            function($http, $scope, shippingService, modalService, checkoutService, zoneService, toaster, $translate, isMobileService) {
                const ctrl = this;
                ctrl.isMobile = isMobileService.getValue();
                const onPointSelectedHandler = (event) => {
                    ctrl.processPoint(event.detail);
                };

                ctrl.init = function() {
                    ctrl.modalName = `modalYandexWidget${ctrl.yandexShipping.MethodId}`;
                    ctrl.widgetDivId = `yaWidget${ctrl.yandexShipping.MethodId}`;
                    if (!window.isWidgetLoaded) {
                        jQuery.ajax({
                            dataType: 'script',
                            cache: false,
                            url: 'https://widget-pvz.dostavka.yandex.net/widget.js',
                        });
                        window.isWidgetLoaded = true;
                    }

                    ctrl.initWidget();
                };

                ctrl.initWidget = function() {

                    $scope.$on('$destroy', () => {
                        document.removeEventListener('YaNddWidgetPointSelected', onPointSelectedHandler);
                    });

                    document.addEventListener('YaNddWidgetPointSelected', onPointSelectedHandler);

                    shippingService.fireTemplateReady($scope);
                };

                ctrl.showModal = function() {
                    const styles = !ctrl.isMobile ? 'width:1000px; height:500px;' : '';
                    const divWidgetContainer = $(`<div style="${styles}"><div id="${ctrl.widgetDivId}"></div></div>`);
                    modalService.renderModal(
                        ctrl.modalName,
                        null,
                        divWidgetContainer.prop('outerHTML'),
                        null,
                        {
                            callbackOpen: 'yandexWidget.YandexWidgetOpenModal()',
                            zIndex: 1051,
                            destroyOnClose: true,
                        },
                        {
                            yandexWidget: {
                                YandexWidgetOpenModal() {
                                    window.YaDelivery ? ctrl.startWidget() : document.addEventListener('YaNddWidgetLoad', ctrl.startWidget);
                                },
                            },
                        },
                        $scope,
                    );

                    modalService.getModal(ctrl.modalName)
                        .then((modal) => {
                            modal.modalScope.open();
                        });
                };

                ctrl.startWidget = function() {
                    const deliveryTypes = [];
                    if (ctrl.yandexWidgetConfigData.deliveryPVZ) {
                        deliveryTypes.push('pickup_point');
                    }
                    if (ctrl.yandexWidgetConfigData.deliveryPostamat) {
                        deliveryTypes.push('terminal');
                    }

                    const containerId = ctrl.widgetDivId; // Идентификатор HTML-элемента (контейнера),
                    const params = {
                        city: ctrl.yandexWidgetConfigData.city,
                        size: {
                            height: '500px',
                            width: '100%',
                        },
                        show_select_button: true, // Отображение кнопки выбора ПВЗ (false - скрыть кнопку, true - показать кнопку)
                        filter: {
                            type: deliveryTypes,
                            // Способ оплаты
                            payment_methods: [
                                'already_paid', // Доступен для доставки предоплаченных заказов
                                'card_on_receipt', // Доступна оплата картой при получении
                            ],
                        },
                    };

                    //window.document.getElementById(ctrl.widgetDivId).innerHTML = '';

                    window.YaDelivery.createWidget({
                        containerId,
                        params,
                    });
                };

                ctrl.processPoint = function(data) {
                    if (typeof data === 'string') {
                        data = new Function(`return ${delivery}`)();
                    }

                    // var selectedPoint = [];

                    ctrl.yandexShipping.PickpointId = data.id;
                    ctrl.yandexShipping.PickpointAddress = data.address.full_address;

                    // selectedPoint.Address = data.address.full_address;
                    // selectedPoint.Description = data.address.comment;
                    // selectedPoint.Code = data.id;
                    //
                    // ctrl.yandexShipping.SelectedPoint = selectedPoint;
                    const pickPointCity = data.address.locality;
                    const pickPointRegion = data.address.region;
                    const isChangedAddress =
                        (ctrl.yandexWidgetConfigData.skipCheckCity == null || !ctrl.yandexWidgetConfigData.skipCheckCity) &&
                        ctrl.yandexWidgetConfigData.city?.toLowerCase() !== pickPointCity?.toLowerCase();
                    const errorMsg = !ctrl.yandexIsAdmin
                        ? `${$translate.instant('Js.Shipping.YandexWidget.AddressError')}: ${pickPointCity}`
                        : `${$translate.instant('Admin.Js.Shipping.YandexWidget.ChangeAddressError')}: ${pickPointCity}`;

                    const executeCallbackAndClose = (close = true) => {
                        ctrl.yandexCallback({
                            event: 'yandexWidget',
                            field: ctrl.yandexShipping.PickpointId || 0,
                            shipping: ctrl.yandexShipping,
                        });
                        if (close) {
                            modalService.close(ctrl.modalName);
                        }
                    };

                    const handleAddressChangeForUnregisterUser = () => {
                        const beforeShipping = ng.copy(ctrl.yandexShipping);
                        const callBackFunction = function() {
                            ctrl.yandexShipping.PickpointId = beforeShipping.PickpointId;
                            ctrl.yandexShipping.PickpointAddress = beforeShipping.PickpointAddress;
                            executeCallbackAndClose(false);
                            checkoutService.removeCallback('address', callBackFunction);
                        };

                        // после setCurrentZone сработает обновление списка доставок в checkout,
                        // по завершению чего будет вызван Callback 'address'
                        checkoutService.addCallback('address', callBackFunction);
                        zoneService.getCurrentZone().then((zoneData) => {
                            zoneService.setCurrentZone(pickPointCity, null, zoneData.CountryId, pickPointRegion, zoneData.CountryName, null);
                            modalService.close(ctrl.modalName);
                        });
                    };

                    if (!ctrl.yandexIsAdmin) {
                        if (isChangedAddress) {
                            if (ctrl.yandexContact.ContactId) {
                                //зарегенный пользователь
                                toaster.pop('error', errorMsg);
                                return;
                            }
                            handleAddressChangeForUnregisterUser();
                        } else {
                            executeCallbackAndClose();
                        }
                    } else {
                        if (isChangedAddress) {
                            toaster.pop('error', errorMsg);
                            return;
                        }

                        executeCallbackAndClose();
                    }
                };
            },
        ])
        .directive('yandex', [
            'urlHelper',
            function(urlHelper) {
                return {
                    scope: {
                        yandexShipping: '=',
                        yandexCallback: '&',
                        yandexContact: '=',
                        yandexIsAdmin: '<?',
                        yandexIsSelected: '=',
                        yandexWidgetConfigData: '=',
                    },
                    controller: 'YandexDeliveryWidgetCtrl',
                    controllerAs: 'yandexDeliveryWidget',
                    bindToController: true,
                    templateUrl: yandexWidgetTemplate,
                    link(scope, element, attrs, ctrl) {
                        ctrl.init();
                    },
                };
            },
        ]);
})(window.angular);
