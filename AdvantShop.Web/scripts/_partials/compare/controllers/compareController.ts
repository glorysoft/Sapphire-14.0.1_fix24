import type { ICompareService } from '../services/compareService';
import type { CompareCountResponseType, OfferIdType } from '../compare.module';
import { type IController, type IPromise, type translate, type IWindowService } from 'angular';
import { IToasterService } from 'ngtoaster';

export interface ICompareCtrl extends IController {
    isAdded: boolean | null;

    add(offerId: OfferIdType, state: boolean): IPromise<CompareCountResponseType>;

    remove(offerId: OfferIdType, state: boolean): IPromise<CompareCountResponseType>;

    change(offerId: OfferIdType, state: boolean): IPromise<CompareCountResponseType>;

    checkStatus(offerId: OfferIdType): IPromise<void>;
}

export default class CompareCtrl implements ICompareCtrl {
    /* @ngInject */
    constructor(
        private readonly compareService: ICompareService,
        private readonly toaster: IToasterService,
        private readonly $translate: translate.ITranslateService,
        private readonly $window: IWindowService,
    ) {}

    isAdded: boolean | null = null;
    add = (offerId: OfferIdType, state: boolean) =>
        this.compareService.add(offerId, state).then((result) => {
            this.toaster.success('', this.$translate.instant('Js.Compare.AddMessageLink'), undefined, undefined, () =>
                this.$window.location.assign('./compare'),
            );
            return result;
        });

    remove = (offerId: OfferIdType, state: boolean) => this.compareService.remove(offerId, state);

    change = (offerId: OfferIdType, state: boolean) => (this.isAdded ? this.add(offerId, state) : this.remove(offerId, state));

    checkStatus = (offerId: OfferIdType) =>
        this.compareService.getStatus(offerId).then((res) => {
            if (res !== null) {
                this.isAdded = res;
            }
        });
}
