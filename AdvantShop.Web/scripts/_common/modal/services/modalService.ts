import type { IAugmentedJQuery, ICompileService, IController, IDeferred, IPromise, IQService, IRootScopeService, IScope } from 'angular';
import type { IModalController } from '../controllers/modalController';
import { IModalOptions } from '../constant/modalConstant';

export interface IModalService {
    startWorking(): void;

    stopWorking(): void;

    isWorking(): boolean;

    existInQueue(modal: IModalController): boolean;

    addQueue(modal: IModalController): void;

    removeItemQueue(modal: IModalController): void;

    open(modalId: string, skipQueue?: boolean, modalDataAdditional?: unknown): void;

    close(modalId: string): IPromise<void>;

    destroy(modalId: string): void;

    setVisibleFooter(modalId: string, visible: boolean): void;

    addStorage(modalId: string, modalElement: IAugmentedJQuery, modalScope: IModalController): IModalsStorageValue;

    hasModal(modalId: string): boolean;

    getModal(modalId: string): IPromise<IModalsStorageValue>;

    renderAttrubutes(attrubutes: IModalOptions): string;

    renderModal(modalId: string, modalHeader, modalContent, modalFooter, options, parentScope);

    getNewZIndex(zIndex?: number): number;

    removeFromStorage(modalId: string): void;

    createOverlay(element: HTMLElement, zIndex: number): HTMLElement;
}

export interface IModalsStorageValue {
    modalElement: IAugmentedJQuery;
    modalScope: IModalController;
}

export type ModalArgumentParentScope = IScope | IController | Record<string, unknown>;

export class ModalService implements IModalService {
    private modals: Record<string, IModalsStorageValue | undefined> = {};
    private promises: Record<string, IDeferred<IModalsStorageValue | undefined> | undefined> = {};
    private queue: IModalController[] = [];
    private working = true;

    /* @ngInject */
    constructor(
        private $compile: ICompileService,
        private $rootScope: IRootScopeService,
        private $q: IQService,
        private modalDefaultOptions: IModalOptions,
    ) {}

    stopWorking() {
        this.working = false;
    }

    startWorking() {
        this.working = true;

        if (this.queue.length > 0) {
            this.open(this.queue[0].id, true);
        }
    }

    isWorking() {
        return this.working;
    }

    existInQueue(modal: IModalController): boolean {
        return this.queue.includes(modal);
    }

    addQueue(modal: IModalController) {
        this.queue.push(modal);
    }

    removeItemQueue(modal: IModalController) {
        const index = this.queue.indexOf(modal);

        if (index !== -1) {
            this.queue.splice(index, 1);
        }

        if (this.queue.length > 0) {
            const childModal = this.queue[this.queue.length - 1];
            if (!childModal.isOpen) {
                this.open(this.queue[this.queue.length - 1].id, true);
            }
        }
    }

    open(modalId: string, skipQueue = false, modalDataAdditional: unknown = undefined, forceOpen?: boolean): void {
        if (angular.isDefined(this.modals[modalId])) {
            this.modals[modalId]?.modalScope.open(skipQueue, modalDataAdditional, forceOpen);
        }
    }

    close(modalId: string): IPromise<void> {
        if (typeof this.modals[modalId] !== 'undefined') {
            return this.modals[modalId].modalScope.close();
        }
        return this.$q.reject(new Error(`Not found modal with id "${modalId}"`));
    }

    destroy(modalId: string) {
        if (angular.isDefined(this.modals[modalId])) {
            this.modals[modalId]?.modalScope.destroy();
            this.removeFromStorage(modalId);
        }
    }

    setVisibleFooter(modalId: string, visible: boolean) {
        if (angular.isDefined(this.modals[modalId])) {
            this.modals[modalId]?.modalScope.setVisibleFooter(visible);
        }
    }

    addStorage(modalId: string, modalElement: IAugmentedJQuery, modalScope: IModalController) {
        this.modals[modalId] = {
            modalElement,
            modalScope,
        };

        if (typeof this.promises[modalId] !== 'undefined') {
            this.promises[modalId].resolve(this.modals[modalId]);
            // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
            delete this.promises[modalId];
        }

        return this.modals[modalId];
    }

    hasModal(modalId: string) {
        return typeof this.modals[modalId] !== 'undefined';
    }

    getModal(modalId: string) {
        const defer = this.$q.defer<IModalsStorageValue>();

        if (this.hasModal(modalId)) {
            defer.resolve(this.modals[modalId]);
        } else {
            this.promises[modalId] = defer;
        }

        return defer.promise;
    }

    renderAttrubutes(attrubutes: IModalOptions) {
        const arrStrings: string[] = [];
        let tempString: string;
        let keyFormatted: string;

        for (const key in attrubutes) {
            if (Object.hasOwn(attrubutes, key)) {
                if (typeof attrubutes[key] === 'undefined' || attrubutes[key] === null) continue;

                keyFormatted = key[0].toLocaleLowerCase() + key.slice(1).replace(/[A-Z]/gu, (str) => `-${str.toLowerCase()}`);

                const isPrimitive = ['number', 'string', 'boolean'].includes(typeof attrubutes[key]);
                tempString = [keyFormatted, '=', '"', isPrimitive ? attrubutes[key] : JSON.stringify(attrubutes[key]).replaceAll('"', "'"), '"'].join(
                    '',
                );
                arrStrings.push(tempString);
            }
        }

        return arrStrings.join(' ');
    }

    /**
     *
     * @param {string} modalId Unique id for modal
     * @param {string} modalHeader String as html for header
     * @param {string} modalContent String as html for content
     * @param {string} modalFooter String as html for footer
     * @param {object} options Options for modal
     * @param {$scope} parentScope Parent scope for compile
     * @returns {JqueryElement} Form Element
     */
    renderModal(
        modalId: string,
        modalHeader?: string | null,
        modalContent?: string | null,
        modalFooter?: string | null,
        options?: IModalOptions,
        parentScope?: ModalArgumentParentScope,
    ) {
        if (angular.isUndefined(modalId) || modalId.length === 0) {
            throw Error('Modal "id" is required');
        }

        if (angular.isDefined(this.modals[modalId])) {
            return this.modals[modalId]?.modalElement;
        }

        const parentScopeAsAngularScope = typeof parentScope !== 'undefined' && parentScope instanceof this.$rootScope.constructor;
        //
        const _options: IModalOptions = { ...this.modalDefaultOptions, ...options, id: modalId };

        const scope: IScope = parentScopeAsAngularScope ? (parentScope as IScope) : this.$rootScope.$new();
        const blockStart = ['<modal-control ', this.renderAttrubutes(_options), '>'];
        const header =
            typeof modalHeader !== 'undefined' && modalHeader !== null
                ? ['<div class="modal-header" data-modal-header>', modalHeader, '</div>']
                : [' '];
        const content =
            typeof modalContent !== 'undefined' && modalContent !== null
                ? ['<div class="modal-content" data-modal-content>', modalContent, '</div>']
                : [' '];
        const footer =
            typeof modalFooter !== 'undefined' && modalFooter !== null
                ? ['<div class="modal-footer" data-modal-footer>', modalFooter, '</div>']
                : [' '];
        const blockEnd = ['</modal-control>'];
        const compileString = blockStart.join('') + header.join('') + footer.join('') + content.join('') + blockEnd.join('');
        const modalElement = angular.element(compileString).css('z-index', this.getNewZIndex(_options.zIndex));

        angular.element(document.body).append(modalElement);

        if (typeof parentScope !== 'undefined' && !parentScopeAsAngularScope) {
            angular.extend(scope, parentScope);
        }

        return this.$compile(modalElement)(scope);
    }

    getNewZIndex(zIndex?: number) {
        return (zIndex ?? this.modalDefaultOptions.zIndex ?? 0) * (this.queue.length + 1);
    }

    removeFromStorage(modalId: string) {
        //eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete this.modals[modalId];
    }

    //for mobile
    createOverlay(element: HTMLElement, zIndex: number): HTMLElement {
        const overlay = document.createElement('div');
        overlay.style.zIndex = zIndex.toString();
        overlay.classList.add('adv-modal-overlay');
        element.before(overlay);
        return overlay;
    }
}
