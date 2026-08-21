import { faker } from '@faker-js/faker';
import type { CompareCountResponseType, CompareCountType, OfferIdType } from '../compare.module';
import type { ICompareCtrl } from '../controllers/compareController';

export const getOfferId = (): number => faker.number.int({
        min: 1,
        max: 1000,
    });

export const getCompareResponseData = (): CompareCountResponseType => ({
        Count: faker.number.int({
            min: 1,
            max: 1000,
        }),
        isComplete: true,
    });

export const getCompareData = (): CompareCountType => ({
        count: faker.number.int({
            min: 1,
            max: 1000,
        }),
        isComplete: true,
    });

export const getCompareResponseErrorText = (): string => faker.hacker.phrase();

export const getCompareResponseStatus = (): boolean => faker.datatype.boolean(Math.random());

export const getCompareScope = (): ICompareCtrl => ({
        isAdded: faker.datatype.boolean(),
        add(offerId: OfferIdType, state: boolean) {
            return Promise.resolve(getCompareResponseData());
        },
        remove(offerId: OfferIdType, state: boolean) {
            return Promise.resolve(getCompareResponseData());
        },
        change(offerId: OfferIdType, state: boolean) {
            return Promise.resolve(getCompareResponseData());
        },
        checkStatus(offerId: OfferIdType) {
            return Promise.resolve();
        },
    });
