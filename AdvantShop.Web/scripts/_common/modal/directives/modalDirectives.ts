import modalTemplate from '../templates/modal.html';
import { type IModalController, TARGETS_TRANSCLUDE, ModalController, TARGET_TRANSCLUDE_NAMES } from '../controllers/modalController';
import { type ModalWrapperController } from '../controllers/modalWrapperController';
import type {
    IAttributes,
    IAugmentedJQuery,
    IDirectiveFactory,
    IDocumentService,
    IScope,
    IWindowService,
    IParseService,
    ITimeoutService,
    ILocationService,
    IFormController,
} from 'angular';
import { IModalService } from '../services/modalService';
import { IModalOptions } from '../constant/modalConstant';

let modalIdIncrement = 0;
const transformName = 'transform',
    inIframe = (function () {
        try {
            return window.self !== window.top;
        } catch (_) {
            return true;
        }
    })();

type ModalControlDirective = IDirectiveFactory<IScope, IAugmentedJQuery, IAttributes, IModalController>;

export const modalControl: ModalControlDirective = /* @ngInject */ (
    $document: IDocumentService,
    $parse: IParseService,
    $timeout: ITimeoutService,
    modalService: IModalService,
    modalDefaultOptions: IModalOptions,
    $location: ILocationService,
) => ({
    restrict: 'EA',
    transclude: true,
    scope: true,
    replace: true,
    controller: 'ModalCtrl',
    controllerAs: 'modal',
    bindToController: true,
    templateUrl(_, attrs) {
        return attrs.templatePath || modalTemplate;
    },
     
    compile(cElement, cAttrs) {
        const isForm = cAttrs.isForm !== 'false';

        if (isForm) {
            cElement.wrapInner('<form name="form" novalidate="novalidate" class="modal__form"></form>');
        }

        return (scope, element, attrs, ctrl, transclude) => {
            if (typeof ctrl === 'undefined') {
                throw new Error('Not found controller "ModalCtrl"');
            }

            ctrl.id = attrs.id;

            if (typeof ctrl.id === 'undefined' || ctrl.id.length === 0) {
                ctrl.id = `modal_${modalIdIncrement}`;
                modalIdIncrement += 1;
                attrs.$set('id', ctrl.id);
            }

            if (modalService.hasModal(ctrl.id)) {
                return;
            }

            // @ts-expect-error form in template
            ctrl._form = scope.form as IFormController;

            ctrl.inIframe = inIframe;
            ctrl.modalClass = `${attrs.modalClass || modalDefaultOptions.modalClass} ${
                typeof attrs.appendModalClass !== 'undefined' ? attrs.appendModalClass : modalDefaultOptions.appendModalClass
            }`;
            ctrl.modalOverlayClass = attrs.modalOverlayClass;
            ctrl.isFloating = angular.isDefined(attrs.isFloating) ? attrs.isFloating === 'true' : modalDefaultOptions.isFloating;
            ctrl.crossEnable = angular.isDefined(attrs.crossEnable) ? attrs.crossEnable === 'true' : modalDefaultOptions.crossEnable;
            ctrl.backgroundEnable = angular.isDefined(attrs.backgroundEnable)
                ? attrs.backgroundEnable === 'true'
                : modalDefaultOptions.backgroundEnable;
            ctrl.closeOut = angular.isDefined(attrs.closeOut) ? attrs.closeOut === 'true' : modalDefaultOptions.closeOut;
            ctrl.startOpenDelay =
                angular.isDefined(attrs.startOpenDelay) && attrs.startOpenDelay.length > 0 ? parseFloat(attrs.startOpenDelay) : null;
            ctrl.callbackOpen = $parse(attrs.callbackOpen);
            ctrl.callbackClose = $parse(attrs.callbackClose);
            ctrl.callbackInit = $parse(attrs.callbackInit);
            ctrl.closeEsc = angular.isDefined(attrs.closeEsc) ? attrs.closeEsc === 'true' : modalDefaultOptions.closeEsc;
            ctrl.isShowFooter = angular.isDefined(attrs.isShowFooter) ? attrs.isShowFooter === 'true' : modalDefaultOptions.isShowFooter;
            ctrl.toBody = angular.isDefined(attrs.toBody) ? attrs.toBody === 'true' : modalDefaultOptions.toBody;
            ctrl.closePosition = angular.isDefined(attrs.closePosition) ? attrs.closePosition : modalDefaultOptions.closePosition;
            ctrl.zIndex = angular.isDefined(attrs.zIndex) ? parseInt(attrs.zIndex, 10) : modalDefaultOptions.zIndex;

            ctrl.closePositionClass = `adv-close-${ctrl.closePosition}`;
            ctrl.destroyOnClose = angular.isDefined(attrs.destroyOnClose) ? attrs.destroyOnClose === 'true' : false;

            ctrl.anchor = attrs.anchor || ctrl.id;
            ctrl.spyAddress = angular.isDefined(attrs.spyAddress) ? attrs.spyAddress === 'true' : false;

            const modalTransclude = element[0].querySelector('.js-modal-transclude');
            if (modalTransclude === null) {
                throw new Error(`modal: modalTransclude is null`);
            }
            const modalElementTransclude = angular.element(modalTransclude);

            if (typeof transclude !== 'undefined') {
                transclude(scope, (clone) => {
                    if (typeof clone !== 'undefined') {
                        modalElementTransclude.replaceWith(clone);
                    }
                });
            } else {
                throw new Error('Not found controller transclude in modal directive');
            }

            // const modalTranscludeBottom = element[0].querySelector('.js-transclude-bottom-modal');

            modalService.addStorage(attrs.id, element, ctrl);

            if (ctrl.toBody && element[0].parentNode !== document.body) {
                document.body.appendChild(element[0]);
            }

            if (typeof ctrl.callbackInit !== 'undefined') {
                ctrl.callbackInit(scope);
            }

            if (ctrl.startOpenDelay !== null) {
                $timeout(() => modalService.open(ctrl.id), ctrl.startOpenDelay);
            }

            if (ctrl.closeEsc === true) {
                $document.on('keyup', (event) => {
                    if (event.keyCode === 27 && ctrl.isOpen === true) {
                        //esc
                        ctrl.close();
                        scope.$apply();
                    }
                });
            }

            let modalIdInUrl;
            if ($location.hash()) {
                const hash = $location.hash();
                const splitedHash = $location.hash().split('?');
                modalIdInUrl = splitedHash.length > 0 ? splitedHash[0] : hash;
            }
            if (typeof modalIdInUrl === 'undefined') {
                const { modalId } = $location.search();
                modalIdInUrl = typeof modalId === 'string' ? modalIdInUrl : undefined;
            }

            if (ctrl.spyAddress === true && typeof ctrl.anchor !== 'undefined' && ctrl.anchor.length > 0 && modalIdInUrl === ctrl.anchor) {
                ctrl.open();
            }

            $document.on('click', () => {
                ctrl.setMousedownOnContent(false);
            });
        };
    },
});

type ModalHeader = IDirectiveFactory<IScope, IAugmentedJQuery, IAttributes, IModalController>;
export const modalHeader: ModalHeader = /* @ngInject */ ($document: IDocumentService, $window: IWindowService, domService) => ({
    restrict: 'EA',
    require: '^modalControl',
    transclude: true,
    replace: true,
    template: '<div data-ng-transclude class="modal-header js-modal-header"></div>',
    scope: true,
    link(_scope, element, _attrs, ctrl) {
        if (typeof ctrl === `undefined`) {
            throw new Error('Not found controller from modalControl for modal header directive');
        }

        ctrl.headerExist = true;

        const modalHeaderElement = element[0],
            modal = ctrl.getModalElement()[0];

        if (ctrl.isFloating === true) {
            const mouseStartPosition = { x: 0, y: 0 },
                transitionStartPosition = { x: 0, y: 0 },
                transitionMovePosition = { x: 0, y: 0 };
            let isFirstMove = true,
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                isMove = false,
                isModalForseFloatDisable = false;

            const start = function (event) {
                let computedStyleTransform, parsedTransform;

                if (
                    isModalForseFloatDisable === true ||
                    domService.closest(event.target, modal) === null ||
                    domService.closest(event.target, '.js-modal-header') === null
                ) {
                    return;
                }

                mouseStartPosition.x = event.pageX;
                mouseStartPosition.y = event.pageY;

                isMove = true;

                if (isFirstMove === true) {
                    isFirstMove = false;

                    computedStyleTransform = window.getComputedStyle(modal)[transformName];

                    if (computedStyleTransform.length > 0) {
                        if (computedStyleTransform === 'none') {
                            transitionStartPosition.x = 0;
                            transitionStartPosition.y = 0;
                        } else {
                            parsedTransform = JSON.parse(computedStyleTransform.replace(/^\w+\(/u, '[').replace(/\)$/u, ']'));

                            transitionStartPosition.x = parsedTransform[4];

                            transitionStartPosition.y = parsedTransform[5];
                        }
                    }
                }

                // @ts-expect-error call vanilla element
                $document[0].addEventListener('mousemove', move);
                // @ts-expect-error call vanilla element
                $document[0].addEventListener('touchmove', move, { passive: true });

                modalHeaderElement.addEventListener('mouseup', end);
                modalHeaderElement.addEventListener('touchend', end, { passive: true });
            };

            const move = function (event) {
                transitionMovePosition.x = transitionStartPosition.x + (event.pageX - mouseStartPosition.x);
                transitionMovePosition.y = transitionStartPosition.y + (event.pageY - mouseStartPosition.y);
                modal.style[ctrl.getTransformMethodString()] = ctrl.getTransformValue(transitionMovePosition.x, transitionMovePosition.y);
            };

            const end = function (event) {
                mouseStartPosition.x = event.pageX;
                mouseStartPosition.y = event.pageY;

                transitionStartPosition.x = transitionMovePosition.x;
                transitionStartPosition.y = transitionMovePosition.y;

                transitionMovePosition.x = 0;
                transitionMovePosition.y = 0;

                isMove = false;

                // @ts-expect-error call vanilla element
                $document[0].removeEventListener('mousemove', move);
                // @ts-expect-error call vanilla element
                $document[0].removeEventListener('touchmove', move);

                modalHeaderElement.removeEventListener('mouseup', end);
                modalHeaderElement.removeEventListener('touchend', end);
            };

            modalHeaderElement.addEventListener('mousedown', start);
            modalHeaderElement.addEventListener('touchstart', start, { passive: true });

            $window.matchMedia('(max-width: 30em)').addListener(() => {
                isModalForseFloatDisable = true;
            });

            $window.matchMedia('(min-width: 31em)').addListener(() => {
                isModalForseFloatDisable = false;
            });
        }
    },
});

type ModalFooter = IDirectiveFactory<IScope, IAugmentedJQuery, IAttributes, IModalController>;
export const modalFooter: ModalFooter = () => ({
    restrict: 'EA',
    require: '^modalControl',
    transclude: true,
    replace: true,
    template: '<div class="modal-footer" data-ng-show="modal.isShowFooter" data-ng-transclude></div>',
    scope: true,
});

type ModalOpen = IDirectiveFactory<IScope, IAugmentedJQuery, IAttributes>;
export const modalOpen: ModalOpen = /* @ngInject */ ($parse: IParseService, modalService: IModalService) => ({
    restrict: 'A',
    link(scope, element, attrs) {
        let callbackOpen, callbackClose;

        if (typeof attrs.modalOpenCallback !== 'undefined' && attrs.modalOpenCallback.length > 0) {
            callbackOpen = $parse(attrs.modalOpenCallback);
        }

        if (typeof attrs.modalOpenCallbackOnClose !== 'undefined' && attrs.modalOpenCallbackOnClose.length > 0) {
            callbackClose = $parse(attrs.modalOpenCallbackOnClose);
        }

        element.on('click', () => {
            modalService.getModal(attrs.modalOpen).then((modal) => {
                if (callbackOpen) {
                    callbackOpen(scope);
                }

                if (callbackClose) {
                    const oldFn = modal.modalScope.callbackClose;

                    modal.modalScope.callbackClose = function (...args) {
                        if (typeof oldFn !== 'undefined') {
                            oldFn.apply(this, args);
                        }
                        callbackClose(scope);
                    };
                }
            });

            const modalDataAdditional = $parse(attrs.modalDataAdditional)(scope);

            modalService.open(attrs.modalOpen, attrs.modalOpenSkipQueue === 'true', modalDataAdditional);

            scope.$apply();
        });
    },
});

type ModalClose = IDirectiveFactory<IScope, IAugmentedJQuery, IAttributes, IModalController>;

export const modalClose: ModalClose = /* @ngInject */ ($parse: IParseService, modalService: IModalService) => ({
    require: '?^modalControl',
    restrict: 'A',
    link(scope, element, attrs, ctrl) {
        const modalCtrl = ctrl;
        let callback;

        if (typeof attrs.modalCloseCallback !== 'undefined' && attrs.modalCloseCallback.length > 0) {
            callback = $parse(attrs.modalCloseCallback);
        }

        element.on('click', () => {
            if (callback) {
                callback(scope);
            }

            if (typeof attrs.modalClose !== 'undefined' && attrs.modalClose.length > 0) {
                modalService.close(attrs.modalClose);
            } else if (typeof modalCtrl !== 'undefined' && modalCtrl) {
                modalCtrl.close();
            }

            scope.$apply();
        });
    },
});

export type ModalContent = IDirectiveFactory<IScope, IAugmentedJQuery, IAttributes, IModalController>;

export const modalContent: ModalContent = () => ({
    require: '?^modalControl',
    restrict: 'A',
    link(_scope, element, _attrs, ctrl) {
        ctrl?.addModalContentElement(element);
    },
});

export const modalForm: ModalContent = () => ({
    require: '?^modalControl',
    restrict: 'A',
    link(_scope, element, _attrs, ctrl) {
        ctrl?.addModalFormElement(element);
    },
});

export const modalWrapper: IDirectiveFactory<IScope, IAugmentedJQuery, IAttributes, ModalWrapperController> = () => ({
    controller: 'ModalWrapperCtrl',
});

export const modalTranscludeBottom: IDirectiveFactory<IScope, IAugmentedJQuery, IAttributes, ModalWrapperController> = () => ({
    transclude: true,
    scope: true,
    replace: true,
    require: '^modalWrapper',
    link(scope, _element, _attrs, ctrl, transclude) {
        if (transclude && ctrl) {
            ctrl?.transcludeContent(
                scope,
                transclude,
                TARGETS_TRANSCLUDE[TARGET_TRANSCLUDE_NAMES.MODAL_BOTTOM],
                TARGET_TRANSCLUDE_NAMES.MODAL_BOTTOM,
            );
        }
    },
});
