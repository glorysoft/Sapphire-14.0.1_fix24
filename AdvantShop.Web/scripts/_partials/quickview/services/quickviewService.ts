import type { ILocationService, ITimeoutService } from 'angular';
import quckviewModalTemplate from '../templates/quckviewModal.html';
import { IQuickViewCtrl } from '../controllers/quickviewController';
import { IModalService } from '../../../_common/modal/services/modalService';

export interface IQuickViewBaseParams {
    productId: number;
    typeView?: string;
    modalClass?: string | null;
    landingId?: number;
    hideShipping?: boolean;
    showLeadButton?: boolean;
    blockId?: number;
    showVideo?: boolean;
    modalId: string;
    onOpenModalCallback?: () => void;
    spyAddress?: boolean;
    descriptionMode?: 'none' | 'briefDescription' | 'fullDescription';
    offerId?: number;
    categoryId?: number;
}

export interface IQuickViewModalParams extends IQuickViewBaseParams {
    itemData: IQuickViewCtrl;
    colorId?: number;
    openFromHash?: boolean;
    sizeId?: number;
    cartAddType?: number;
}

export interface IQuickViewModalScope extends IQuickViewBaseParams {
    itemData: IQuickViewCtrl;
    url: string | null;
    onModalClose?: () => void;
    prev: (quickview: IQuickViewModalScope) => void;
    next: (quickview: IQuickViewModalScope) => void;
}

export interface IQuickViewUrlParams {
    productId: number;
    colorId?: number | null;
    typeView?: string;
    landingId?: number;
    hideShipping?: boolean;
    showLeadButton?: boolean;
    blockId?: number;
    showVideo?: boolean;
    sizeId?: number | null;
    descriptionMode?: string;
    cartAddType?: number;
    offerId?: number;
}

export interface IQuickviewService {
    dialogRender(parentScope: IQuickViewModalScope, skipQueue?: boolean): void;

    dialogOpen(modalParams: IQuickViewModalParams, skipQueue?: boolean): void;

    dialogClose(modalQuickViewId?: string): void;

    getUrl(params: IQuickViewUrlParams): string;

    goTo(quickview: IQuickViewModalScope, index: number): void;

    prev(quickview: IQuickViewCtrl): void;

    next(quickview: IQuickViewCtrl): void;

    dialogIsExist(modalQuickViewId: string): boolean;

    checkDialogOpenById(modalQuickViewId: string): boolean;

    needOpenDialog(modalQuickViewId: string): void;

    removeNeedOpenDialog(): void;

    setUrlSearch(modalParams: Omit<IQuickViewModalParams, 'itemData'>): void;
}

export class QuickviewService implements IQuickviewService {
    public needOpenDialogId: string | null = null;
    public dialogIdOpen?: string | null = null;

    /* @ngInject */
    constructor(
        private readonly modalService: IModalService,
        private readonly $location: ILocationService,
        private readonly $timeout: ITimeoutService,
        private readonly urlHelper,
        private readonly quickviewConfig,
    ) {
        this.modalService = modalService;
        this.$location = $location;
        this.urlHelper = urlHelper;
        this.quickviewConfig = quickviewConfig;
    }

    dialogRender(parentScope: IQuickViewModalScope, skipQueue?: boolean): void {
        this.modalService.renderModal(
            parentScope.modalId || 'modalQuickView',
            null,
            `<div data-ng-include="'${quckviewModalTemplate}'"></div>`,
            null,
            {
                isOpen: false,
                modalClass: `modal-quickview ${parentScope.modalClass || ''}`,
                backgroundEnable: true,
                modalOverlayClass: 'modal-quickview-wrap',
                spyAddress: parentScope.spyAddress,
                anchor: parentScope.modalId || 'modalQuickView',
                callbackOpen: parentScope.spyAddress ? 'quickview.onOpenModalCallback()' : '',
                callbackClose: 'quickview.onModalClose()',
                destroyOnClose: true,
            },
            { quickview: parentScope },
        );
        this.modalService.getModal(parentScope.modalId || 'modalQuickView').then((modal) => {
            modal.modalScope.open(skipQueue);
        });
    }

    getUrl({
        productId,
        colorId,
        typeView,
        landingId,
        hideShipping,
        showLeadButton,
        blockId,
        showVideo,
        sizeId,
        descriptionMode,
        cartAddType,
        offerId,
    }: IQuickViewUrlParams) {
        return `${this.quickviewConfig.url}?productId=${productId}${typeof colorId !== 'undefined' ? `&color=${colorId}` : ''}${
            typeof sizeId !== 'undefined' ? `&size=${sizeId}` : ''
        }${typeof typeView !== 'undefined' ? `&from=${typeView}` : ''}${typeof landingId !== 'undefined' ? `&landingId=${landingId}` : ''}${
            typeof hideShipping !== 'undefined' ? `&hideShipping=${hideShipping}` : ''
        }${typeof showLeadButton !== 'undefined' ? `&showLeadButton=${showLeadButton}` : ''}${
            typeof blockId !== 'undefined' ? `&blockId=${blockId}` : ''
        }${typeof showVideo !== 'undefined' ? `&showVideo=${showVideo}` : ''}${
            typeof descriptionMode !== 'undefined' ? `&descriptionMode=${descriptionMode}` : ''
        }${typeof cartAddType !== 'undefined' ? `&cartAddType=${cartAddType}` : ''}${
            typeof offerId !== 'undefined' ? `&offerId=${offerId}` : ''
        }&rnd=${Math.random()}`;
    }

    dialogOpen(modalParams: IQuickViewModalParams, skipQueue?: boolean) {
        this.dialogIdOpen = modalParams.modalId;
        const data: IQuickViewModalScope = {
            ...modalParams,
            url: this.getUrl(modalParams),
            next: (quickview) => this.next(quickview),
            prev: (quickview) => this.prev(quickview),
            onModalClose: () => {
                data.url = null;
                this.modalService.destroy('modalProductRotate');

                this.setUrlSearch({ modalId: undefined, colorId: undefined, sizeId: undefined });

                this.dialogIdOpen = null;
            },
        };

        if (!this.modalService.hasModal(modalParams.modalId)) {
            this.dialogRender(data, skipQueue);
        } else {
            this.modalService.open(modalParams.modalId, skipQueue);
        }

        this.$timeout(() => this.setUrlSearch(modalParams), 100);

        this.removeNeedOpenDialog();
    }

    setUrlSearch({ modalId, productId, colorId, sizeId, categoryId }: Partial<Omit<IQuickViewModalParams, 'itemData'>>) {
        this.$location.search('modalId', modalId ?? null);
        this.$location.search('productId', productId ?? null);
        this.$location.search('colorId', colorId ?? null);
        this.$location.search('sizeId', sizeId ?? null);
        this.$location.search('categoryId', categoryId ?? null);
    }

    dialogClose(modalQuickViewId = 'modalQuickView') {
        if(this.modalService.hasModal(modalQuickViewId)){
            this.modalService.close(modalQuickViewId);
        }
        this.dialogIdOpen = null;
    }

    goTo(quickview: IQuickViewModalScope, index: number) {
        if (
            typeof quickview.itemData.siblings !== 'undefined' &&
            quickview.itemData.siblings !== null &&
            typeof quickview.itemData.siblings[index] !== 'undefined'
        ) {
            quickview.productId = quickview.itemData.siblings[index];
            quickview.offerId = undefined;
            quickview.url = this.getUrl({
                ...quickview,
                sizeId: null,
                colorId: null,
            });
            this.setUrlSearch(quickview);
        }
    }

    prev(quickview) {
        this.modalService.destroy('modalProductRotate');
        this.goTo(quickview, quickview.itemData.siblings.indexOf(quickview.productId) - 1);
    }

    next(quickview) {
        this.modalService.destroy('modalProductRotate');
        this.goTo(quickview, quickview.itemData.siblings.indexOf(quickview.productId) + 1);
    }

    dialogIsExist(modalQuickViewId: string) {
        return this.modalService.hasModal(modalQuickViewId) || this.needOpenDialogId !== null;
    }

    checkDialogOpenById(modalQuickViewId: string) {
        return this.dialogIdOpen === modalQuickViewId;
    }

    needOpenDialog(modalQuickViewId: string) {
        this.needOpenDialogId = modalQuickViewId;
    }

    removeNeedOpenDialog() {
        this.needOpenDialogId = null;
    }
}

export default QuickviewService;
