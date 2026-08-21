(function (ng) {
    

    angular
        .module('mokkaPay', [])
        .controller('MokkaPayCtrl', [
            '$scope',
            'modalService',
            '$element',
            function ($scope, modalService, $element) {
                const ctrl = this;

                ctrl.$onInit = function () {
                    $element.on('$destroy', () => {
                        modalService.destroy(ctrl.modalId);
                    });
                };

                ctrl.init = function () {
                    ctrl.modalId = `modalMokkaPay-${  ctrl.mokkaOrderCode}`;
                    ctrl.initModal();
                    modalService.getModal(ctrl.modalId).then((modal) => {
                        modal.modalScope.open();
                    });
                };

                ctrl.initModal = function () {
                    modalService.renderModal(
                        ctrl.modalId,
                        null,
                        '',
                        null,
                        {
                            modalClass: 'shipping-dialog',
                            callbackOpen: 'mokkapay.MokkaPayWidgetOpenModal()',
                        },
                        {
                            mokkapay: {
                                MokkaPayWidgetOpenModal () {
                                    const modalContent = $(`#${  ctrl.modalId}`).find('.modal-content');
                                    if (!modalContent.find('iframe').length) {
                                        modalContent.empty().append(ctrl.createIframe().prop('outerHTML'));
                                    }
                                },
                            },
                        },
                    );
                };

                ctrl.createIframe = function () {
                    const iframeUrl = ctrl.mokkaPayUrl;
                    const divgWidgetContainer = $(
                        `<iframe title="Mokka widget" style="width: 100%; height: 100%; min-width: 35vw; min-height: 85vh; border: none; overflow: hidden" src="${ 
                            iframeUrl 
                            }">Браузер не поддерживает iframe</iframe>`,
                    );
                    return divgWidgetContainer;
                };
            },
        ])
        .directive('mokkaOrderPay', [
            function () {
                return {
                    scope: {
                        mokkaOrderCode: '<',
                        mokkaPayUrl: '<',
                    },
                    controller: 'MokkaPayCtrl',
                    controllerAs: 'mokkaPay',
                    bindToController: true,
                    link (scope, element, attrs, ctrl) {
                        element.on('click', () => {
                            ctrl.init();
                            scope.$apply();
                        });
                    },
                };
            },
        ]);
})(window.angular);
