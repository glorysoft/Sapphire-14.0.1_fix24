import {
    IStickyElementService,
    type IStickyElementStorage,
    PointValueTuple,
    StickyElementCallback,
    StickyElementElementRect,
    StickyElementPositionActivate,
    StickyElementPositionName,
    StickyElementScrollParent,
    StickyElementStoragePointValue,
} from '../stickyElement.types';
import { StickyElementStorageManager } from './stickyElementStorageManager';
import {
    checkSticky,
    getPosition,
    getScrollParentHeight,
    getScrollValue,
    isPositionActive,
    isWindow,
} from '@/scripts/_common/stickyElement/stickyElement.core';

export default class StickyElementService implements IStickyElementService {
    private lastUserScrollTime: number | undefined;
    private storageManager: StickyElementStorageManager;
    private scrollListeners = new Map<StickyElementScrollParent, () => void>();

    constructor() {
        this.storageManager = new StickyElementStorageManager();

        ['wheel', 'touchmove', 'keydown'].forEach((evt) => {
            window.addEventListener(
                evt,
                () => {
                    this.lastUserScrollTime = Date.now();
                },
                { passive: true },
            );
        });
    }

    private scrollCallback = (scrollParent: StickyElementScrollParent) => {
        const isUserScroll = typeof this.lastUserScrollTime === 'number' && Date.now() - this.lastUserScrollTime < 100;

        if (scrollParent._stickyInScrollProgress) {
            // Помечаем pending ТОЛЬКО для пользовательских событий: во время анимации
            // startHeightTracking вызывает scrollBy каждый кадр, и все эти scroll-события
            // без фильтра записывались бы в pending, провоцируя паразитный re-run.
            // Возле scrollY ≈ 0 это приводило к субпиксельному перепинниванию и сбросу скролла вниз.
            if (isUserScroll) {
                scrollParent._stickyScrollPending = true;
            }
            return;
        }

        scrollParent._stickyInScrollProgress = true;
        scrollParent._stickyScrollPending = false;

        checkSticky(this.storageManager, scrollParent, isUserScroll).then(() => {
            scrollParent._stickyInScrollProgress = false;
            if (scrollParent._stickyScrollPending) {
                scrollParent._stickyScrollPending = false;
                this.scrollCallback(scrollParent);
            }
        });
    };

    private createListener(scrollParent: StickyElementScrollParent) {
        const handler = () => {
            this.scrollCallback(scrollParent);
        };
        scrollParent.addEventListener('scroll', handler, { passive: true });
        this.scrollListeners.set(scrollParent, handler);
    }

    private removeListener(scrollParent: StickyElementScrollParent) {
        const handler = this.scrollListeners.get(scrollParent);
        if (handler) {
            scrollParent.removeEventListener('scroll', handler);
            this.scrollListeners.delete(scrollParent);
        }
    }

    private findScrollParent(element: HTMLElement | null): StickyElementScrollParent {
        if (!element || element === document.body) {
            return window; // If no scrollable parent found, return window (for document scrolling)
        }

        const style = window.getComputedStyle(element);

        // Check for overflow properties
        const { overflowX, overflowY } = style;

        const isScrollableY = overflowY === 'auto' || overflowY === 'scroll';
        const isScrollableX = overflowX === 'auto' || overflowX === 'scroll';

        // Check if content overflows the element's dimensions
        const hasOverflowY = element.scrollHeight > element.clientHeight;
        const hasOverflowX = element.scrollWidth > element.clientWidth;

        if ((isScrollableY && hasOverflowY) || (isScrollableX && hasOverflowX)) {
            return element; // This element is scrollable
        }

        // Recursively check the parent
        return this.findScrollParent(element.parentElement);
    }

    private parseValue(elementHeight: number, scrollParentHeight: number, value: StickyElementPositionActivate) {
        if (value === 'bottom-self') {
            return scrollParentHeight > elementHeight ? 0 : scrollParentHeight - elementHeight;
        }
        return undefined;
    }

    private calcValue(element: HTMLElement, scrollParent: StickyElementScrollParent, sumTopSticky: number): PointValueTuple {
        const propName = element.dataset.bottom ? 'bottom' : 'top';

        const propValue = element.dataset[propName];
        const propValueAsNumber = propValue ? parseFloat(propValue) : 0;
        let val: number | undefined;

        if (propValue && isPositionActive(propValue)) {
            val = this.parseValue(element.offsetHeight + sumTopSticky, getScrollParentHeight(scrollParent), propValue);
        }

        return [propName, typeof val === 'undefined' ? sumTopSticky + (isNaN(propValueAsNumber) ? 0 : propValueAsNumber) : val];
    }

    private getRectByParent(element: HTMLElement, scrollParent: StickyElementScrollParent): StickyElementElementRect {
        // Получаем позиции элемента и родителя относительно viewport
        const elementRect = element.getBoundingClientRect();
        const parentRect = !isWindow(scrollParent)
            ? scrollParent.getBoundingClientRect()
            : {
                  top: 0,
                  left: 0,
                  right: document.documentElement.offsetWidth,
                  bottom: document.documentElement.offsetHeight,
                  height: document.documentElement.offsetHeight,
                  width: document.documentElement.offsetWidth,
              };

        // Вычисляем расстояние от верха родителя до верха элемента
        return {
            top: elementRect.top - parentRect.top,
            left: elementRect.left - parentRect.left,
            right: elementRect.right - parentRect.right,
            bottom: elementRect.bottom,
            height: elementRect.height,
            width: elementRect.width,
        };
    }

    private getPointerTuple(
        storage: IStickyElementStorage,
        point: number,
        element: HTMLElement,
        scrollParent: StickyElementScrollParent,
    ): PointValueTuple {
        const sumSticky = this.getSumSticky(point, this.getRectByParent(element, scrollParent), storage, scrollParent);
        return this.calcValue(element, scrollParent, sumSticky ?? 0);
    }

    private setPointValue(propData: PointValueTuple, element: HTMLElement) {
        if (typeof propData !== 'undefined') {
            element.style[propData[0]] = `${propData[1]}px`;
        }

        return propData;
    }

    private calcPointValue(
        element: HTMLElement,
        scrollParent: StickyElementScrollParent,
        position: StickyElementPositionName,
        positionValue: number,
    ) {
        return this.getRectByParent(element, scrollParent)[position] + getScrollValue(scrollParent) + (position === 'bottom' ? positionValue : 0);
    }

    getSumSticky(
        pointLimit: number,
        elementRect: StickyElementElementRect,
        storage: IStickyElementStorage,
        scrollParent?: StickyElementScrollParent,
    ) {
        const _scrollParent = scrollParent ?? window;
        const storagePoints = storage.get(_scrollParent);

        if (typeof storagePoints === 'undefined') {
            return 0;
        }

        let sum = 0;

        for (const [point, { items }] of storagePoints.entries()) {
            if (point <= pointLimit) {
                sum += items.reduce((acc, cur) => {
                    const itemRect = cur.element.getBoundingClientRect();
                    let val = 0;
                    if (elementRect.left >= itemRect.left && elementRect.right <= itemRect.right) {
                        val = itemRect.height;
                    }
                    return acc + val;
                }, 0);
            } else {
                break;
            }
        }

        return sum;
    }

    getSumTopSticky(pointLimit: number, elementRect: StickyElementElementRect, scrollParent?: StickyElementScrollParent) {
        return this.getSumSticky(pointLimit, elementRect, this.storageManager.get('top'), scrollParent ?? window);
    }

    addElementToObserver(element: HTMLElement, callback: StickyElementCallback) {
        const position = getPosition(element);
        const scrollParent = this.findScrollParent(element);
        const storage = this.storageManager.get(position);
        let storageValue = storage.get(scrollParent);

        if (typeof storageValue === 'undefined') {
            this.createListener(scrollParent);
            storageValue = storage.createStoragePoint();
        }

        const _positionValueUnsafe = parseFloat(position);

        const positionValue = isNaN(_positionValueUnsafe) ? 0 : _positionValueUnsafe;

        const point = this.calcPointValue(element, scrollParent, position, positionValue);

        const pointCalcData = this.getPointerTuple(storage, point, element, scrollParent);

        this.setPointValue(pointCalcData, element);

        const storagePoints = storageValue.get(point);

        let newValue: StickyElementStoragePointValue | undefined;

        if (typeof storagePoints !== 'undefined') {
            newValue = { ...storagePoints };
            newValue.items = (newValue.items ?? []).concat([{ element, callback }]);
        } else {
            newValue = {
                items: [
                    {
                        element,
                        callback,
                    },
                ],
            };
        }

        if (!storageValue.has(point) && storageValue.size() > 0) {
            const newElementHeight = newValue.items[0].element.offsetHeight;
            for (const [_itemPoint, _itemData] of storageValue.entries()) {
                if (point > _itemPoint) {
                    break;
                }

                _itemData.items.forEach((item) => {
                    item.element.style.top = `${pointCalcData[1] + newElementHeight}px`;
                });
            }
        }

        storageValue.set(point, newValue);
        storage.set(scrollParent, storageValue);

        checkSticky(this.storageManager, scrollParent, false);

        //destroy functions
        return () => {
            const storageValueInDestroy = storage.get(scrollParent);
            if (typeof storageValueInDestroy === 'undefined') {
                return;
            }
            const pointData = storageValueInDestroy.get(point);
            if (typeof pointData === 'undefined') {
                return;
            }
            const index = pointData.items.findIndex((x) => x.element === element);
            if (index !== -1) {
                pointData.items.splice(index, 1);
            }
            if (pointData.items.length === 0) {
                storageValueInDestroy.delete(point);
            }

            const hasRemainingElements = this.storageManager.getAll().some(([, stor]) => {
                const storValue = stor.get(scrollParent);
                return storValue && storValue.size() > 0;
            });
            if (!hasRemainingElements) {
                this.removeListener(scrollParent);
            }
        };
    }
}
