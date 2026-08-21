import { IScope, IFormController, ILocationService, IWindowService, IAttributes, IAugmentedJQuery, IController, IQService, IPromise } from 'angular';
import { type IModalService } from '../services/modalService';
import {
    type IModalOptions,
    type ModalVariantsType,
    type ModalVariantValueType,
    type ModalOptionsDefault,
    type IModalConfig,
    modalVariants,
} from '../constant/modalConstant';

import { IModalSheetOptions, ModalSheet } from './modalSheet';

export const TARGET_TRANSCLUDE_NAMES = {
    MODAL_BOTTOM: 'modal-bottom-height',
} as const;

export const TARGETS_TRANSCLUDE = {
    [TARGET_TRANSCLUDE_NAMES.MODAL_BOTTOM]: 'js-transclude-bottom-modal',
} as const;

interface IModalConfigFactory {
    getModalConfig: () => IModalConfig;
}

export interface IModalController extends IModalOptions, IController {
    headerExist: boolean;

    mousedownOnContent: boolean;
    _form: IFormController;

    setMousedownOnContent(boolean: boolean): void;

    open(skipQueue?: boolean, modalDataAdditional?: unknown, forceOpen?: boolean): void;

    close(): IPromise<void>;

    destroy(): void;

    modalClickOut(event: MouseEvent): void;

    setVisibleFooter(visible: boolean): void;

    getModalScope(): IModalController;

    getModalElement(): IAugmentedJQuery;

    getTransformValue(x: number, y: number): string;

    getTransformMethodString(): string;

    addModalContentElement(element: IAugmentedJQuery): void;

    addModalFormElement(element: IAugmentedJQuery): void;

    hasParentModal(): boolean;
}

export class ModalController implements IModalController {
    id = '';
    isOpen = false;
    closeOut = false;
    isFloating = false;
    mousedownOnContent = false;
    isShowFooter = false;
    spyAddress = false;
    destroyOnClose = false;
    callbackClose?: (scope: IScope) => void;
    callbackOpen?: (scope: IScope) => void;
    anchor?: string;
    callbackInit?: ((scope: IScope) => void) | undefined;
    inIframe = false;
    modalClass = '';
    modalOverlayClass = '';
    crossEnable = false;
    backgroundEnable = false;
    startOpenDelay: number | null = null;
    closeEsc = false;
    _form!: IFormController;
    zIndex = 999;
    headerExist = false;
    closePositionClass = '';

    private modalDataAdditional: unknown;
    private modalSheet?: ModalSheet;
    modalVariant: ModalVariantValueType;
    modalVariants: ModalVariantsType;

    modalContentElement?: IAugmentedJQuery;
    modalFormElement?: IAugmentedJQuery;

    /* @ngInject */
    constructor(
        private $element: IAugmentedJQuery,
        private $attrs: IAttributes,
        private $location: ILocationService,
        private $scope: IScope,
        private $window: IWindowService,
        private modalDefaultOptions: ModalOptionsDefault,
        private modalService: IModalService,
        private readonly $q: IQService,
        private readonly modalConfigFactory: IModalConfigFactory,
    ) {
        this.close = this.close.bind(this);
        this.modalVariants = modalVariants;
        //modalVariant прописывается в app.js
        const modalConfig: IModalConfig = this.modalConfigFactory.getModalConfig();
        this.modalVariant = modalConfig.modalVariant;
    }

    $postLink() {
        const urlSearch = this.$location.search();

        if (urlSearch !== null && angular.isDefined(urlSearch.modal) && urlSearch.modal === this.$attrs.id) {
            this.setStateModal(true);
        } else {
            const state = angular.isDefined(this.$attrs.isOpen) ? this.$attrs.isOpen === 'true' : this.modalDefaultOptions.isOpen;
            if (state) {
                this.open();
            } else {
                this.setStateModal(state);
            }
        }
    }

    get isClosable() {
        return this.closeOut || this.crossEnable;
    }

    modalClickOut(event: MouseEvent) {
        if (this.closeOut && event.currentTarget === event.target && !this.isFloating && !this.mousedownOnContent) {
            this.close();
        }
    }

    setMousedownOnContent(value: boolean) {
        this.mousedownOnContent = value;
    }

    setVisibleFooter(visible: boolean) {
        this.isShowFooter = visible;
    }

    close(event?: Event, skipRemove?: boolean): Promise<void> {
        event?.preventDefault();
        const promise = Promise.resolve(this.modalVariant === this.modalVariants.SHEET ? this.modalSheet?.destroy() : null);
        return promise.then(() => {
            this.setStateModal(false);
            this.applyClose(skipRemove);
            return this.$q.resolve();
        });
    }

    applyClose(skipRemove?: boolean) {
        this.modalService.removeItemQueue(this);

        if (this.spyAddress) {
            this.$window.history.pushState('', '', this.$window.location.pathname);
        }

        if (this.callbackClose) {
            this.callbackClose(this.$scope);
        }
        if (this.destroyOnClose && !skipRemove) {
            this.modalService.removeFromStorage(this.id);
            this.$scope.$destroy();
            this.$element.remove();
        }
    }

    destroy() {
        this.close().then(() => {
            this.$element.remove();
            this.modalService.removeFromStorage(this.id);
        });
    }

    open(skipQueue?: boolean, modalDataAdditional?: unknown, forceOpen?: boolean) {
        const isExistInQueue = this.modalService.existInQueue(this);

        const isNeedOpen =
            !this.isOpen && (forceOpen || (this.modalService.isWorking() && (!isExistInQueue || skipQueue === true || this.hasParentModal())));

        if (isNeedOpen) {
            this.zIndex = this.modalService.getNewZIndex(this.zIndex);
            this.modalDataAdditional = modalDataAdditional;
            this.setStateModal(true);
            if (this.modalVariant === this.modalVariants.SHEET && this.modalFormElement) {
                const modalSheetOptions: IModalSheetOptions = {
                    element: this.$element[0],
                    $scope: this.$scope,
                    modalFormElement: this.modalFormElement[0],
                    close: this.close,
                    destroyOnClose: this.destroyOnClose,
                    isClosable: this.isClosable,
                    zIndex: this.zIndex,
                };
                this.modalSheet = new ModalSheet(modalSheetOptions);
            }

            if (this.spyAddress && typeof this.anchor !== 'undefined') {
                this.$location.search({ modalId: this.anchor });
            }

            if (this.callbackOpen) {
                this.callbackOpen(this.$scope);
            }
        }

        if (!isExistInQueue) {
            this.modalService.addQueue(this);
        }

        this.$element.css('z-index', this.zIndex);
    }

    getModalScope() {
        return this;
    }

    getModalElement() {
        return this.$element;
    }

    getTransformValue(x: number, y: number) {
        return `translate3d(${x.toFixed()}px,${y.toFixed()}px, 0px)`;
    }

    getTransformMethodString() {
        return 'transform';
    }

    addModalContentElement(element: IAugmentedJQuery): void {
        this.modalContentElement = element;
    }

    addModalFormElement(element: IAugmentedJQuery): void {
        this.modalFormElement = element;
    }

    setStateModal(state: boolean) {
        this.isOpen = state;
    }

    hasParentModal() {
        return this.$element.closest('.adv-modal').length > 0;
    }
}
