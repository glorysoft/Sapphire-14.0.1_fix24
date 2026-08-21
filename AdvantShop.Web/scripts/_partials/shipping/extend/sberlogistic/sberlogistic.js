import sberlogisticTemplate from './sberlogistic.tpl.html';
(function (ng) {
    

    angular
        .module('sberlogistic', [])
        .controller('SberlogisticCtrl', [
            '$http',
            '$scope',
            'modalService',
            '$element',
            'shippingService',
            function ($http, $scope, modalService, $element, shippingService) {
                const ctrl = this;

                ctrl.$onInit = function () {
                    $element.on('$destroy', () => {
                        modalService.destroy(ctrl.modalId);
                        if (window.JCShiptorWidgetPvz && window.JCShiptorWidgetPvz[ctrl.widgetId]) {
                            window.JCShiptorWidgetPvz[ctrl.widgetId].destroy();
                            window.JCShiptorWidgetPvz[ctrl.widgetId] = null;
                        }
                    });
                };

                ctrl.init = function () {
                    ctrl.modalId = `modalSberlogisticWidget${  ctrl.sberlogisticShipping.MethodId}`;
                    ctrl.widgetId = `shiptor_widget_pvz${  ctrl.sberlogisticShipping.MethodId}`;
                    if (!window.isSberlogisticLoaded) {
                        window.isSberlogisticLoaded = true;

                        jQuery.ajax({
                            dataType: 'script',
                            cache: true,
                            url: 'https://widget.shiptor.ru/embed/widget-pvz.js',
                        });
                    }

                    ctrl.initModal();
                };

                ctrl.initModal = function () {
                    shippingService.fireTemplateReady($scope);

                    const divgWidgetContainer = $(
                        `<div id="${  ctrl.widgetId  }" class="_shiptor_widget _sbl_widget" style="height:100%; width:100%;"></div>`,
                    );
                    Object.keys(ctrl.sberlogisticShipping.WidgetConfigData).map((objectKey) => {
                        divgWidgetContainer.attr(objectKey, ctrl.sberlogisticShipping.WidgetConfigData[objectKey]);
                    });

                    modalService.renderModal(
                        ctrl.modalId,
                        null,
                        divgWidgetContainer.prop('outerHTML'),
                        null,
                        {
                            modalClass: 'shipping-dialog',
                            callbackInit: 'sberlogistic.SberlogisticWidgetInitModal()',
                            callbackOpen: 'sberlogistic.SberlogisticWidgetOpenModal()',
                            callbackClose: 'sberlogistic.SberlogisticWidgetCloseModal()',
                        },
                        {
                            sberlogistic: {
                                SberlogisticWidgetInitModal () {},
                                SberlogisticWidgetOpenModal () {
                                    if (ctrl.beforeWidgetConfigParams == null) {
                                        ctrl.beforeWidgetConfigParams = angular.copy(ctrl.sberlogisticShipping.WidgetConfigParams);
                                    }

                                    if (window.JCSberlogisticWidgetPvz && window.JCSberlogisticWidgetPvz[ctrl.widgetId]) {
                                        if (!angular.equals(ctrl.beforeWidgetConfigParams, ctrl.sberlogisticShipping.WidgetConfigParams)) {
                                            window.JCShiptorWidgetPvz[ctrl.widgetId].setParams(ctrl.sberlogisticShipping.WidgetConfigParams);
                                            window.JCShiptorWidgetPvz[ctrl.widgetId].refresh();
                                            ctrl.beforeWidgetConfigParams = angular.copy(ctrl.sberlogisticShipping.WidgetConfigParams);
                                        }
                                    } else {
                                        // повторно создаем контейнер, чтобы создать с обновленными атрибутами,
                                        // т.к.модальное окно еще не открывали и виджет не создавался
                                        const divgWidgetContainer = $(
                                            `<div id="${ 
                                                ctrl.widgetId 
                                                }" class="_shiptor_widget _sbl_widget" style="height:100%; width:100%;"></div>`,
                                        );
                                        Object.keys(ctrl.sberlogisticShipping.WidgetConfigData).map((objectKey) => {
                                            divgWidgetContainer.attr(objectKey, ctrl.sberlogisticShipping.WidgetConfigData[objectKey]);
                                        });

                                        $(`#${  ctrl.modalId}`)
                                            .find(`#${  ctrl.widgetId}`)
                                            .replaceWith(divgWidgetContainer.prop('outerHTML'));

                                        if (!window.JCShiptorWidgetPvz) {
                                            window.JCShiptorWidgetPvz = {};
                                        }

                                        window.JCShiptorWidgetPvz[ctrl.widgetId] = new ShiptorWidgetPvz({
                                            id: ctrl.widgetId,
                                        });
                                        window.JCShiptorWidgetPvz[ctrl.widgetId].init();
                                    }
                                    $(`#${  ctrl.modalId}`)
                                        .find(`#${  ctrl.widgetId}`)
                                        .on('onPvzSelect', ctrl.setSberlogisticPvz);
                                },
                                SberlogisticWidgetCloseModal () {
                                    $(`#${  ctrl.modalId}`)
                                        .find(`#${  ctrl.widgetId}`)
                                        .off('onPvzSelect');
                                },
                            },
                        },
                    );
                };

                ctrl.setSberlogisticPvz = function ($e) {
                    const detail = $e.originalEvent.detail;
                    const additionalData = {
                        Id: detail.id,
                        Code: detail.code,
                        Courier: detail.courier,
                        Cod: detail.cod,
                        Card: detail.card,
                        KladrId: detail.kladr_id,
                        ShippingMethod: detail.shipping_method,
                        Type: detail.type,
                    };

                    ctrl.sberlogisticShipping.PickpointId = detail.id;
                    ctrl.sberlogisticShipping.PickpointAddress = detail.prepare_address
                        ? [
                              detail.prepare_address.administrative_area,
                              detail.prepare_address.settlement,
                              detail.prepare_address.street,
                              `${detail.prepare_address.house  } ${  detail.prepare_address.block || ''}`,
                          ].join(', ')
                        : detail.address;
                    ctrl.sberlogisticShipping.PickpointAdditionalData = JSON.stringify(additionalData);
                    ctrl.sberlogisticShipping.PickpointAdditionalDataObj = additionalData;

                    ctrl.sberlogisticCallback({
                        event: 'sberlogisticWidget',
                        field: ctrl.sberlogisticShipping.PickpointId || 0,
                        shipping: ctrl.sberlogisticShipping,
                    });

                    modalService.close(ctrl.modalId);

                    $scope.$digest();
                };
            },
        ])
        .directive('sberlogistic', [
            'urlHelper',
            function (urlHelper) {
                return {
                    scope: {
                        sberlogisticShipping: '=',
                        sberlogisticCallback: '&',
                        sberlogisticIsSelected: '=',
                        sberlogisticContact: '=',
                    },
                    controller: 'SberlogisticCtrl',
                    controllerAs: 'sberlogistic',
                    bindToController: true,
                    templateUrl: sberlogisticTemplate,
                    link (scope, element, attrs, ctrl) {
                        ctrl.init();
                    },
                };
            },
        ]);
})(window.angular);
