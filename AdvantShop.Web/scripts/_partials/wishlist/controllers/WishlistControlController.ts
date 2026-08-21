import type { IWishlistService } from '../services/wishlistService';
import type { OfferIdType, WishlistCountResponseType } from '../wishlist.module';
import type { IController, IPromise } from 'angular';

export interface IWishlistControlCtrl extends IController {
    dirty: boolean;
    isAdded: boolean | null;
    offerId?: number;

    add(offerId: OfferIdType, state: boolean): IPromise<WishlistCountResponseType>;

    remove(offerId: OfferIdType, state: boolean): IPromise<WishlistCountResponseType>;

    change(offerId: OfferIdType, state: boolean): IPromise<WishlistCountResponseType>;

    checkStatus(offerId: OfferIdType): IPromise<void>;
}

export default class WishlistControlCtrl implements IWishlistControlCtrl {
    /* @ngInject */
    constructor(readonly wishlistService: IWishlistService) {}

    dirty = false;
    isAdded: boolean | null = null;

    add = (offerId: OfferIdType, state: boolean) => this.wishlistService.add(offerId, state);

    remove = (offerId: OfferIdType, state: boolean) => this.wishlistService.remove(offerId, state);

    change = (offerId: OfferIdType, state: boolean) => {
        this.dirty = true;
        return this.isAdded ? this.add(offerId, state) : this.remove(offerId, state);
    };

    checkStatus = (offerId: OfferIdType) =>
        this.wishlistService.getStatus(offerId).then((res) => {
            if (res !== null) {
                this.isAdded = res;
            }
        });
}
