import { vi, describe, beforeEach, it, expect, afterEach } from 'vitest';
import '../../../_common/urlHelper/urlHelperService.module.js';
import '../customOptions.module.js';
import { createTestApp } from '../../../../tests/mocks/angularjs-mocks.ts';

describe('customOptionsService', () => {
    let customOptionsService;

    document.head.innerHTML = `<base href="http://example.net/" />`;

    beforeEach(() => {
        const { $injector } = createTestApp(['urlHelper', 'customOptions']);
        customOptionsService = $injector.get('customOptionsService');
    });

    describe('isEqualCustomOptions', () => {
        it('should return true, when options with once id', () => {
            expect(
                customOptionsService.isEqualCustomOptions(
                    [
                        {
                            CustomOptionId: 1,
                            OptionAmount: 2,
                            OptionTitle: 'test1',
                            OptionId: 2,
                        },
                        {
                            CustomOptionId: 1,
                            OptionAmount: 3,
                            OptionTitle: 'test1',
                            OptionId: 3,
                        },
                    ],
                    [
                        {
                            CustomOptionId: 1,
                            OptionAmount: 2,
                            OptionTitle: 'test1',
                            OptionId: 2,
                        },
                        {
                            CustomOptionId: 1,
                            OptionAmount: 3,
                            OptionTitle: 'test1',
                            OptionId: 3,
                        },
                    ],
                ),
            ).toBeTruthy();
        });
        it('should compare title if amount is null', () => {
            expect(
                customOptionsService.isEqualCustomOptions(
                    [
                        {
                            CustomOptionId: 1,
                            OptionTitle: 'test1',
                            OptionId: 2,
                        },
                        {
                            CustomOptionId: 1,
                            OptionTitle: 'test2',
                            OptionId: 3,
                        },
                    ],
                    [
                        {
                            CustomOptionId: 1,
                            OptionTitle: 'test1',
                            OptionId: 2,
                        },
                        {
                            CustomOptionId: 1,
                            OptionTitle: 'test2',
                            OptionId: 3,
                        },
                    ],
                ),
            ).toBeTruthy();
        });
        it('should return false', () => {
            expect(customOptionsService.isEqualCustomOptions([{ CustomOptionId: 1 }], [{ CustomOptionsId: 99 }])).toBeFalsy();
        });

        it('should return false, when options with once id and different title or amount', () => {
            expect(
                customOptionsService.isEqualCustomOptions(
                    [
                        {
                            CustomOptionId: 1,
                            OptionTitle: 'test1',
                            OptionId: 3,
                        },
                        {
                            CustomOptionId: 1,
                            OptionTitle: 'test2',
                            OptionId: 4,
                        },
                    ],
                    [
                        {
                            CustomOptionId: 1,
                            OptionTitle: 'test1',
                            OptionId: 3,
                        },
                        {
                            CustomOptionId: 1,
                            OptionTitle: 'test3',
                            OptionId: 4,
                        },
                    ],
                ),
            ).toBeFalsy();

            expect(
                customOptionsService.isEqualCustomOptions(
                    [
                        {
                            CustomOptionId: 1,
                            OptionTitle: 'test1',
                            OptionAmount: 2,
                            OptionId: 3,
                        },
                        {
                            CustomOptionId: 1,
                            OptionTitle: 'test2',
                            OptionAmount: 2,
                            OptionId: 4,
                        },
                    ],
                    [
                        {
                            CustomOptionId: 1,
                            OptionTitle: 'test1',
                            OptionAmount: 5,
                            OptionId: 3,
                        },
                        {
                            CustomOptionId: 1,
                            OptionTitle: 'test2',
                            OptionAmount: 5,
                            OptionId: 4,
                        },
                    ],
                ),
            ).toBeFalsy();
        });
    });
});
