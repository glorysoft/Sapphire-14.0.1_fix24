import { IAttributes, IAugmentedJQuery, type IController, type ILocationService, IParseService, type IQService, IScope } from 'angular';
import {IQuickViewModalParams, IQuickViewModalScope, IQuickviewService} from '../services/quickviewService';
import { IModalController } from '../../../_common/modal/controllers/modalController';
import { CartConfig } from '../../cart/cartConfigDefault';

export type IQuickViewModalParamsCtrl = Omit<IQuickViewModalParams, 'itemData'>;

export interface IQuickViewLocationSearch {
    modalId?: string;
    colorId?: number;
    sizeId?: number;
    productId?: number;
    offerId?: number;
    categoryId?: number;
}

export interface IQuickViewLocationSearchRaw {
    modalId?: string;
    colorId?: string;
    sizeId?: string;
    productId?: string;
    offerId?: string;
    categoryId?: string;
}

export interface IQuickViewCtrl extends IController {
    modalId: string;
    isSpyAddress?: boolean;
    productCtrl: any;
    siblings?: number[];
    modalIds: Record<string, string>;
    productId: number;
    addTrigger(productId: number): void;

    showModal(params: IQuickViewModalParamsCtrl): void;

    hideModal(): void;

    setSiblings(element: HTMLElement): void;

    onOpenModal(): void;

    onChangeSizeAndColor(data: any): void;

    addProductCtrl(productCtrl: any): void;

    getParamsRawFromUrl(): IQuickViewLocationSearchRaw | null;

    getParamsFromUrl(): IQuickViewLocationSearch | null;

    parseSearchParams(value: IQuickViewLocationSearchRaw): IQuickViewLocationSearch;

    isShowOnLoadPage(
        modalParams: Pick<IQuickViewModalParamsCtrl, 'modalId' | 'productId' | 'offerId' | 'categoryId'>,
        searchParams: IQuickViewLocationSearch,
    ): boolean;
}

export class QuickviewCtrl implements IQuickViewCtrl {
    private colorsAndSize: { colorId?: number; sizeId?: number } = {};
    private triggers: number[] = [];
    private cartAddTriggerName?: string;
    public siblings?: number[];
    public modalIds: Record<string, string> = {};
    public modalId = '';
    public isSpyAddress?: boolean;
    public productCtrl: any;
    public productId;
    public productViewItem: any;
    public modalControl: IModalController | undefined;
    public quickview: IQuickViewCtrl | undefined;
    public isInQuickViewModal = false;
    public quickViewModalParent: IQuickViewModalScope | undefined
    /* @ngInject */
    constructor(
        readonly quickviewService: IQuickviewService,
        readonly cartService,
        readonly cartConfig: CartConfig,
        readonly domService,
        readonly $location: ILocationService,
        readonly urlHelper,
        readonly $q: IQService,
        readonly $ocLazyLoad,
        readonly isMobileService,
        readonly $attrs: IAttributes,
        readonly $scope: IScope,
        readonly $parse: IParseService,
        readonly $element: IAugmentedJQuery,
    ) {}

    $onInit() {
        this.quickViewModalParent = this.getParentQuickViewModal();
        this.isInQuickViewModal = typeof this.quickViewModalParent !== 'undefined';
    }

    $postLink() {
        const { productViewItem, modalControl, quickview } = this;
        if (typeof productViewItem === 'undefined' || typeof modalControl === 'undefined' || typeof quickview === 'undefined') {
            throw new Error('Controllers unavailable for directive quickviewTrigger');
        }
        quickview.productId =
            productViewItem !== null && typeof productViewItem.productId !== 'undefined' && isNaN(quickview.productViewItem.productId) === false
                ? quickview.productViewItem.productId
                : this.$parse(this.$attrs.productId)(this.$scope);
        quickview.modalId = typeof this.$attrs.modalId !== 'undefined' ? this.$attrs.modalId : !this.isInQuickViewModal ? 'modalQuickView': `modalQuickView_${quickview.productId}`;
        quickview.isSpyAddress = this.$attrs.spyAddress === 'true';
        quickview.alone = typeof this.$attrs.alone !== 'undefined' ? this.$parse(this.$attrs.alone)(this.$scope) : undefined;


        quickview.offerId = typeof this.$attrs.offerId !== 'undefined' ? this.$parse(this.$attrs.offerId)(this.$scope) : undefined;
        quickview.categoryId = typeof this.$attrs.categoryId !== 'undefined' ? this.$parse(this.$attrs.categoryId)(this.$scope) : undefined;

        if (quickview.alone !== true && typeof quickview.siblings === 'undefined') {
            quickview.setSiblings(this.$element[0]);
        }

        const searchParams = quickview.getParamsFromUrl();

        const modalParams: IQuickViewModalParamsCtrl = {
            productId: quickview.productId,
            modalId: quickview.modalId,
            colorId: this.$parse(this.$attrs.colorId)(this.$scope) ?? searchParams?.colorId,
            sizeId: this.$parse(this.$attrs.sizeId)(this.$scope) ?? searchParams?.sizeId,
            offerId: quickview.offerId,
            categoryId: quickview.categoryId,
        };
        const showModal = () => {
            const _modalParams: IQuickViewModalParamsCtrl = {
                productId: quickview.productId,
                typeView: this.$attrs.quickviewTypeView,
                modalClass: this.$element[0].getAttribute('data-modal-class'),
                landingId: this.$attrs.landingId,
                hideShipping: this.$attrs.hideShipping,
                showLeadButton: this.$attrs.showLeadButton,
                blockId: this.$attrs.blockId,
                showVideo: typeof this.$attrs.showVideo !== 'undefined' ? this.$attrs.showVideo : null,
                modalId: quickview.modalId,
                openFromHash: quickview.openFromHash,
                colorId: this.$parse(this.$attrs.colorId)(this.$scope) ?? searchParams?.colorId,
                sizeId: this.$parse(this.$attrs.sizeId)(this.$scope) ?? searchParams?.sizeId,
                onOpenModalCallback: quickview.onOpenModal,
                spyAddress: quickview.isSpyAddress,
                descriptionMode: this.$attrs.descriptionMode,
                cartAddType: this.$attrs.cartAddType,
                offerId: quickview.offerId,
                categoryId: quickview.categoryId,
            };

            quickview.showModal(_modalParams);

            if (!this.isInQuickViewModal &&  modalControl !== null) {
                modalControl.close();
            }
        };

        if (searchParams !== null && quickview.isShowOnLoadPage(modalParams, searchParams)) {
            quickview.openFromHash = true;

            showModal();
            //scope.$digest();
        }

        this.$element[0].addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();

            showModal();

            this.$scope.$apply();
        });
    }

    getParentQuickViewModal(): IQuickViewModalScope | undefined{
        // @ts-expect-error не типизированный scope
        return this.$scope.$parent.quickview;
    }

    addTrigger(productId: number) {
        this.triggers.push(productId);
    }

    showModal(options: IQuickViewModalParamsCtrl) {
        /*ВЫЗЫВАЕТ АНГУЛЯР НЕСКОЛЬКОР РАЗ!!!!!!!!! Fly runtime*/

        if (!this.quickviewService.dialogIsExist(options.modalId)) {
            this.quickviewService.needOpenDialog(options.modalId);
            this.cartAddTriggerName = `quckview_${Date.now()}`;
            if (this.$attrs.cartAddType !== this.cartConfig.cartAddType.WithSpinbox) {
                this.cartService.addCallback(this.cartConfig.callbackNames.add, () => this.hideModal(), this.cartAddTriggerName);
            }
        }

        if (!this.quickviewService.checkDialogOpenById(options.modalId) || this.isInQuickViewModal) {
            this.quickviewService.dialogOpen({
                ...options,
                itemData: this,
            }, this.isInQuickViewModal);
        }
    }

    hideModal() {
        this.quickviewService.dialogClose();
        this.cartService.removeCallback(this.cartConfig.callbackNames.add, this.cartAddTriggerName);
    }

    setSiblings(element: HTMLElement) {
        let sibling, id, modalId;

        const items: HTMLCollection = this.domService.closest(element, '.js-products-view-block').parentNode.children;

        for (let i = 0, len = items.length - 1; i <= len; i++) {
            sibling = items[i].querySelector<HTMLElement>('.js-products-view-item');

            if (sibling === null && items[i].getAttribute('data-product-id') !== null) {
                sibling = items[i];
            }

            if (sibling !== null) {
                id = parseFloat(sibling.getAttribute('data-product-id'));
                modalId = sibling.getAttribute('data-modal-id') || sibling.querySelector('[data-quickview-trigger]')?.dataset.modalId;

                if (angular.isNumber(id)) {
                    this.siblings ??= [];
                    this.siblings.push(id);
                }
                if (modalId !== null) {
                    this.modalIds[id] = modalId;
                }
            }
        }
    }

    onChangeSizeAndColor = () => (data) => {
        if (this.isSpyAddress && typeof data !== 'undefined') {
            if (typeof data.ColorId !== 'undefined') {
                this.colorsAndSize.colorId = data.ColorId;
            }
            if (typeof data.SizeId !== 'undefined') {
                this.colorsAndSize.sizeId = data.SizeId;
            }
            this.quickviewService.setUrlSearch({ ...this, ...this.colorsAndSize });
        }
    };

    onOpenModal() {
        if (typeof this.productCtrl !== 'undefined') {
            this.onChangeSizeAndColor()(this.productCtrl.colorSelected);
            this.onChangeSizeAndColor()(this.productCtrl.sizeSelected);
        }
    }

    addProductCtrl(productCtrl) {
        this.productCtrl = productCtrl;
    }

    getParamsRawFromUrl(): IQuickViewLocationSearchRaw | null {
        const search = this.$location.search();

        if (search.modalId && search.modalId !== '') {
            return search;
        }

        const hash = this.$location.hash();

        if (hash !== '') {
            const splitedHash = hash.split('?');
            if (splitedHash.length === 0) {
                return null;
            }
            const hashAdditionalParams = this.urlHelper.getUrlParamsAsObject(splitedHash[1]);
            if (this.quickview?.modalId === splitedHash[0]) {
                this.$location.hash(null);
            }

            return { modalId: splitedHash[0], ...hashAdditionalParams } as IQuickViewLocationSearchRaw;
        }

        return null;
    }

    parseSearchParams(value: IQuickViewLocationSearchRaw): IQuickViewLocationSearch {
        const result: IQuickViewLocationSearch = {
            modalId: value.modalId,
        };

        if (typeof value.productId !== 'undefined') {
            result.productId = parseFloat(value.productId);
        }
        if (typeof value.offerId !== 'undefined') {
            result.offerId = parseFloat(value.offerId);
        }
        if (typeof value.categoryId !== 'undefined') {
            result.categoryId = parseFloat(value.categoryId);
        }
        if (typeof value.colorId !== 'undefined') {
            result.colorId = parseFloat(value.colorId);
        }
        if (typeof value.sizeId !== 'undefined') {
            result.sizeId = parseFloat(value.sizeId);
        }
        return result;
    }

    getParamsFromUrl() {
        const params = this.getParamsRawFromUrl();

        if (params === null) {
            return null;
        }

        return this.parseSearchParams(params);
    }

    isShowOnLoadPage(
        modalParams: Pick<IQuickViewModalParamsCtrl, 'modalId' | 'productId' | 'offerId' | 'categoryId'>,
        searchParams: IQuickViewLocationSearch,
    ) {
        return (
            searchParams !== null &&
            modalParams.modalId === searchParams.modalId &&
            (typeof modalParams.productId === 'undefined' || modalParams.productId === searchParams.productId) &&
            (typeof modalParams.offerId === 'undefined' || modalParams.offerId === searchParams.offerId) &&
            (typeof modalParams.categoryId === 'undefined' || modalParams.categoryId === searchParams.categoryId)
        );
    }
}

export default QuickviewCtrl;
