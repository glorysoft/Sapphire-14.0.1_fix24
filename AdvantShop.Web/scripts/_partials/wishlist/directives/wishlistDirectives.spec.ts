import { describe, it, vi, expect } from 'vitest';
import { createTestApp } from '../../../../tests/mocks/angularjs-mocks';
import compareModule from '../wishlist.module';
import { getOfferId, getWishlistResponseStatus } from '../__mocks__/wishlist';
import { IWishlistService } from '@/scripts/_partials/wishlist/services/wishlistService';

describe('wishlistControl', () => {
    const getTestApp = () => createTestApp([compareModule]);
    it('should render compareControl',  () => {
        const { render, $injector } = getTestApp();
        const offerId = getOfferId();
        const { scope } = render(`<div wishlist-control="${offerId}"></div>`);
        const wishlistService: IWishlistService = $injector.get('wishlistService');
        const removeWishlistScopeMock = vi.spyOn(wishlistService, 'removeWishlistScope');
        scope.$destroy();
        expect(removeWishlistScopeMock).toHaveBeenCalled();
    });

    it('should check status after change offerId', () => {
        const { render, $injector } = getTestApp();
        const props = { offerId: getOfferId() };
        const wishlistService: IWishlistService = $injector.get('wishlistService');
        const { scope } = render(`<div wishlist-control="offerId"></div>`, props);
        const getStatusScopeMock = vi.spyOn(wishlistService, 'getStatus').mockReturnValue($injector.get('$q').resolve(getWishlistResponseStatus()));
        scope.offerId = getOfferId();
        scope.$apply();
        expect(getStatusScopeMock).toHaveBeenCalled();
    });
});
