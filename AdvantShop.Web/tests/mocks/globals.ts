import { Mock, vi } from 'vitest';

export const intersectionList: IntersectionObserverMock[] = [];

interface IntersectionObserverMock extends IntersectionObserver {
    takeRecord: Mock;
    observe: Mock;
    unobserve: Mock;
    disconnect: Mock;
    _callbackTest: IntersectionObserverCallback;
}

export type TestIntersectionObserverEntry = Omit<IntersectionObserverEntry, 'toJSON'> & {
    toJSON?: () => object;
};

vi.stubGlobal(
    'IntersectionObserver',
    vi.fn(
        // для vi.fn нельзя задать стрелочную функцию
        // eslint-disable-next-line prefer-arrow-callback
        function (callback: IntersectionObserverCallback) {
            const io: IntersectionObserverMock = {
                root: null,
                rootMargin: '0px 0px 0px 0px',
                thresholds: [0],
                observe: vi.fn(),
                unobserve: vi.fn(),
                disconnect: vi.fn(),
                takeRecord: vi.fn(),
                takeRecords: vi.fn(),
                _callbackTest: callback,
            };
            intersectionList.push(io);
            return io;
        },
    ),
);
