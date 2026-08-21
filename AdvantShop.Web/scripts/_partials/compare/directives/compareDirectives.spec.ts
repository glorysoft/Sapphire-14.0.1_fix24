import { describe, it, vi, expect } from 'vitest';
import compareModule from '../compare.module';
import { getCompareResponseStatus, getOfferId } from '../__mocks__/compare';
import { createTestApp } from '../../../../tests/mocks/angularjs-mocks';
import { ICompareService } from '@/scripts/_partials/compare/services/compareService';
import 'angularjs-toaster';
import 'angular-translate';

describe('compareControl', () => {
    const getTestApp = () => createTestApp([compareModule, 'toaster', 'pascalprecht.translate']);
    it('should render compareControl', () => {
        const { render, $injector } = getTestApp();
        const offerId = getOfferId();
        const { scope } = render(`<div compare-control="${offerId}"></div>`);
        const compareService: ICompareService = $injector.get('compareService');
        const removeCompareScopeMock = vi.spyOn(compareService, 'removeCompareScope');
        scope.$destroy();
        expect(removeCompareScopeMock).toHaveBeenCalled();
    });

    it('should check status after change offerId', () => {
        const { render, $injector } = getTestApp();
        const props = { offerId: getOfferId() };
        const { scope } = render(`<div compare-control="offerId"></div>`, props);
        const compareService: ICompareService = $injector.get('compareService');
        const getStatusScopeMock = vi.spyOn(compareService, 'getStatus').mockReturnValue($injector.get('$q').resolve(getCompareResponseStatus()));
        scope.offerId = getOfferId();
        scope.$apply();
        expect(getStatusScopeMock).toHaveBeenCalled();
    });
});
