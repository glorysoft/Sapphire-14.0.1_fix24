import { faker } from '@faker-js/faker';
import type { WishlistCountResponseType, WishlistCountType, OfferIdType } from '../wishlist.module';
import type { IWishlistControlCtrl } from '../controllers/WishlistControlController';

export const getOfferId = (): number => faker.number.int({
        min: 1,
        max: 1000,
    });

export const getWishlistResponseData = (): WishlistCountResponseType => {
    const count = faker.number.int({
        min: 1,
        max: 1000,
    });
    return {
        Count: count,
        CountString: count.toString(),
    };
};

export const getWishlistData = (): WishlistCountType => {
    const count = faker.number.int({
        min: 1,
        max: 1000,
    });
    return {
        count,
        countString: count.toString(),
    };
};

export const getWishlistResponseErrorText = (): string => faker.hacker.phrase();

export const getWishlistResponseStatus = (): boolean => faker.datatype.boolean(Math.random());

export const getWishlistScope = (): IWishlistControlCtrl => ({
        dirty: faker.datatype.boolean(),
        isAdded: faker.datatype.boolean(),
        add(offerId: OfferIdType, state: boolean) {
            return Promise.resolve(getWishlistResponseData());
        },
        remove(offerId: OfferIdType, state: boolean) {
            return Promise.resolve(getWishlistResponseData());
        },
        change(offerId: OfferIdType, state: boolean) {
            return Promise.resolve(getWishlistResponseData());
        },
        checkStatus(offerId: OfferIdType) {
            return Promise.resolve();
        },
    });
