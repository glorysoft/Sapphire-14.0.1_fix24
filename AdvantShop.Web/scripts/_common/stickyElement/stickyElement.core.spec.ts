import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { checkIsPinned, checkSticky } from './stickyElement.core';
import { StickyElementStorageManager } from './services/stickyElementStorageManager';
import type { StickyElementCallback, StickyElementScrollParent } from './stickyElement.types';

const scrollParent = window;

describe('checkIsPinned (top position)', () => {
    it('pins when scrollY exceeds point', () => {
        expect(checkIsPinned('top', 300, scrollParent, 301)).toBe(true);
    });

    it('does not pin when scrollY equals point', () => {
        expect(checkIsPinned('top', 300, scrollParent, 300)).toBe(false);
    });

    it('does not pin when scrollY is below point', () => {
        expect(checkIsPinned('top', 300, scrollParent, 299)).toBe(false);
    });

    describe('minimum 1px buffer when already pinned', () => {
        it('stays pinned at scrollY = point (buffer shifts threshold by 1)', () => {
            expect(checkIsPinned('top', 300, scrollParent, 300, true, 0)).toBe(true);
        });

        it('unpins at scrollY = point - 1', () => {
            expect(checkIsPinned('top', 300, scrollParent, 299, true, 0)).toBe(false);
        });
    });

    describe('hysteresis after height change', () => {
        it('stays pinned when scroll anchoring pushes scrollY back by diffHeight', () => {
            // point=300, hysteresis=30 → buffer=30 → threshold=270
            // scroll anchoring: 301 - 30 = 271 → 271 > 270 → still pinned
            expect(checkIsPinned('top', 300, scrollParent, 271, true, 30)).toBe(true);
        });

        it('unpins when scrollY drops below threshold with hysteresis', () => {
            // threshold = 300 - 30 = 270 → 270 > 270 = false
            expect(checkIsPinned('top', 300, scrollParent, 270, true, 30)).toBe(false);
        });
    });

    describe('buffer does not exceed point (defensive clamp)', () => {
        // iterationPoints больше не пишет hysteresis = diffHeight в storage,
        // поэтому реально такой сценарий не возникает. Тест оставлен как
        // защитный контракт checkIsPinned: даже при некорректно большом
        // hysteresis извне threshold не уйдёт ниже 0.
        it('clamps threshold at 0 when hysteresis > point', () => {
            expect(checkIsPinned('top', 100, scrollParent, 1, true, 500)).toBe(true);
            expect(checkIsPinned('top', 100, scrollParent, 0, true, 500)).toBe(false);
        });
    });

    describe('regression: dynamic-height pin without hysteresis', () => {
        // После пина с изменением высоты iterationPoints обновляет point только если
        // компенсация scrollBy/anchor загнала бы порог выше текущего scrollY (т.е.
        // без сдвига был бы немедленный unpin). В остальных случаях point остаётся
        // _point. checkIsPinned использует min 1px-буфер, threshold ≈ point - 1.
        it('below-fold sticky, scrollTo (scrollDelta=0): point=159, отлипает чуть ниже', () => {
            // offsetTop=159, scrollTo(0,200) без isUserScroll: компенсации нет,
            // point остаётся 159. Unpin при scrollY < 159.
            expect(checkIsPinned('top', 159, scrollParent, 200, true)).toBe(true);
            expect(checkIsPinned('top', 159, scrollParent, 159, true)).toBe(true);
            expect(checkIsPinned('top', 159, scrollParent, 158, true)).toBe(false);
        });

        it('below-fold sticky, wheel (scrollDelta=-104): point=55, отлипает ниже компенсированной точки', () => {
            // offsetTop=159, wheel-скролл: scrollY 200 → 96 (компенсация -104).
            // scrollYAfter=96 < _point=159 → point сдвигается до 55.
            expect(checkIsPinned('top', 55, scrollParent, 96, true)).toBe(true); // сразу после комп.
            expect(checkIsPinned('top', 55, scrollParent, 55, true)).toBe(true); // на границе ещё pinned
            expect(checkIsPinned('top', 55, scrollParent, 54, true)).toBe(false); // отлипание
        });

        it('trapped-at-top sticky (_point=0, scrollDelta=+64): point остаётся 0, pinned при любом scrollY > 0', () => {
            // offsetTop=0, wheel-скролл: элемент при пине уменьшается на 64 →
            // scrollBy(+64) → scrollY 100 → 164. scrollYAfter=164 >= _point=0 →
            // point НЕ сдвигается, остаётся 0. Иначе threshold уехал бы до 63,
            // и при возврате к scrollY=10 элемент бы ложно отлипал.
            expect(checkIsPinned('top', 0, scrollParent, 164, true)).toBe(true); // сразу после комп.
            expect(checkIsPinned('top', 0, scrollParent, 10, true)).toBe(true); // возврат к 10 — pinned
            expect(checkIsPinned('top', 0, scrollParent, 1, true)).toBe(true); // pinned пока scrollY > 0
            expect(checkIsPinned('top', 0, scrollParent, 0, true)).toBe(false); // unpin строго на верху
        });
    });

    describe('no buffer when unpinned', () => {
        it('does not apply buffer when prevState is false', () => {
            expect(checkIsPinned('top', 300, scrollParent, 300, false, 30)).toBe(false);
        });

        it('does not apply buffer when prevState is undefined', () => {
            expect(checkIsPinned('top', 300, scrollParent, 300, undefined, 30)).toBe(false);
        });
    });
});

describe('iterationPoints: восстановление _point после unpin (регрессия дрейфа порога)', () => {
    let storageManager: StickyElementStorageManager;
    let currentScrollY: number;
    let originalScrollByDescriptor: PropertyDescriptor | undefined;
    let originalScrollYDescriptor: PropertyDescriptor | undefined;

    beforeEach(() => {
        storageManager = new StickyElementStorageManager();
        currentScrollY = 0;

        originalScrollYDescriptor = Object.getOwnPropertyDescriptor(window, 'scrollY');
        Object.defineProperty(window, 'scrollY', {
            configurable: true,
            get: () => currentScrollY,
        });

        originalScrollByDescriptor = Object.getOwnPropertyDescriptor(window, 'scrollBy');
        Object.defineProperty(window, 'scrollBy', {
            configurable: true,
            writable: true,
            value: (options: ScrollToOptions | number) => {
                const top = typeof options === 'number' ? 0 : (options.top ?? 0);
                currentScrollY += top;
            },
        });
    });

    afterEach(() => {
        if (originalScrollYDescriptor) {
            Object.defineProperty(window, 'scrollY', originalScrollYDescriptor);
        }
        if (originalScrollByDescriptor) {
            Object.defineProperty(window, 'scrollBy', originalScrollByDescriptor);
        }
        document.body.innerHTML = '';
    });

    it('pin → unpin: после отлипания порог возвращается к исходному point', async () => {
        // ng-if-сценарий: при пине высота растёт, при unpin — возвращается.
        const element = document.createElement('div');
        document.body.appendChild(element);

        let isCurrentlyPinned = false;
        Object.defineProperty(element, 'offsetHeight', {
            configurable: true,
            get: () => (isCurrentlyPinned ? 200 : 100),
        });

        // eslint-disable-next-line no-shadow
        const callback: StickyElementCallback = (isPinned, scrollParent, scrollY) => {
            isCurrentlyPinned = isPinned;
            return Promise.resolve({ isPinned, scrollParent, scrollY });
        };

        const ORIGINAL_POINT = 159;
        const storage = storageManager.get('top');
        const storageValue = storage.createStoragePoint();
        storageValue.set(ORIGINAL_POINT, { items: [{ element, callback }] });
        storage.set(window as StickyElementScrollParent, storageValue);

        // Инициализация: scrollY=0, prevState undefined → isInitial-путь, высота не отслеживается.
        currentScrollY = 0;
        await checkSticky(storageManager, window as StickyElementScrollParent, true);

        // Пин: scrollY=200 > 159. Высота 100 → 200, scrollBy(-100), scrollY → 100.
        // scrollYAfter(100) < _point(159) → point сдвигается до 59 (существующее поведение).
        currentScrollY = 200;
        await checkSticky(storageManager, window as StickyElementScrollParent, true);

        const pointsAfterPin = storageValue.entries().map(([item]) => item);
        expect(pointsAfterPin.length).toBe(1);
        expect(pointsAfterPin[0]).toBeLessThan(ORIGINAL_POINT);

        // Unpin: scrollY=5 < shifted threshold. Высота 200 → 100, scrollBy(+100), scrollY → 105.
        // Без фикса: point остаётся 59 → следующий пин при scrollY > 59 (раньше исходного 159).
        // С фиксом: point восстанавливается к ORIGINAL_POINT.
        currentScrollY = 5;
        await checkSticky(storageManager, window as StickyElementScrollParent, true);

        const pointsAfterUnpin = storageValue.entries().map(([item]) => item);
        expect(pointsAfterUnpin).toEqual([ORIGINAL_POINT]);
    });

    it('user scroll during pin animation does not contaminate the threshold shift (oscillation regression)', async () => {
        // Непрерывный скролл колесом: пока идёт pin-анимация, пользователь докручивает
        // страницу ещё на 50px помимо нашей scrollBy-компенсации. Сдвиг порога должен
        // опираться только на компенсацию (-diffHeight), иначе на следующем проходе
        // элемент ложно меняет состояние.
        const element = document.createElement('div');
        document.body.appendChild(element);

        let isCurrentlyPinned = false;
        Object.defineProperty(element, 'offsetHeight', {
            configurable: true,
            get: () => (isCurrentlyPinned ? 200 : 100),
        });

        // eslint-disable-next-line no-shadow
        const callback: StickyElementCallback = (isPinned, scrollParent, scrollY) => {
            isCurrentlyPinned = isPinned;
            return Promise.resolve({ isPinned, scrollParent, scrollY });
        };

        const ORIGINAL_POINT = 159;
        const storage = storageManager.get('top');
        const storageValue = storage.createStoragePoint();
        storageValue.set(ORIGINAL_POINT, { items: [{ element, callback }] });
        storage.set(window as StickyElementScrollParent, storageValue);

        currentScrollY = 0;
        await checkSticky(storageManager, window as StickyElementScrollParent, true);

        // Подменяем scrollBy так, чтобы вместе с нашей компенсацией он имитировал
        // продолжающийся пользовательский скролл вверх на 50px (один раз за анимацию).
        let userScrollInjected = false;
        Object.defineProperty(window, 'scrollBy', {
            configurable: true,
            writable: true,
            value: (options: ScrollToOptions | number) => {
                const top = typeof options === 'number' ? 0 : (options.top ?? 0);
                currentScrollY += top;
                if (!userScrollInjected) {
                    userScrollInjected = true;
                    currentScrollY -= 50;
                }
            },
        });

        // Пин: scrollY=200 > 159. Высота 100→200, компенсация scrollBy(-100) → 100,
        // плюс пользовательские -50 → 50. diffHeight=100.
        // Корректный сдвиг порога: newPoint = 159 - diffHeight = 59.
        // Загрязнённый замер (scrollYAfter - scrollY = 50 - 200 = -150) дал бы 9.
        currentScrollY = 200;
        await checkSticky(storageManager, window as StickyElementScrollParent, true);

        const pointsAfterPin = storageValue.entries().map(([item]) => item);
        expect(pointsAfterPin).toEqual([59]);
    });
});

describe('checkIsPinned (bottom position)', () => {
    // For bottom: isPinned = scrollY < point - viewportHeight + buffer
    // happy-dom default innerHeight = 768

    it('pins when scrollY is below threshold', () => {
        // point=1500, viewportHeight=768 → threshold = 1500 - 768 = 732
        expect(checkIsPinned('bottom', 1500, scrollParent, 731)).toBe(true);
    });

    it('does not pin when scrollY equals threshold', () => {
        expect(checkIsPinned('bottom', 1500, scrollParent, 732)).toBe(false);
    });

    it('applies minimum buffer when already pinned', () => {
        // prevState=true, hysteresis=0 → buffer=1 → threshold = 732 + 1 = 733
        // scrollY=732 < 733 → still pinned
        expect(checkIsPinned('bottom', 1500, scrollParent, 732, true, 0)).toBe(true);
        // scrollY=733 < 733 → false
        expect(checkIsPinned('bottom', 1500, scrollParent, 733, true, 0)).toBe(false);
    });

    it('applies hysteresis buffer when already pinned', () => {
        // prevState=true, hysteresis=30 → buffer=30 → threshold = 732 + 30 = 762
        expect(checkIsPinned('bottom', 1500, scrollParent, 761, true, 30)).toBe(true);
        expect(checkIsPinned('bottom', 1500, scrollParent, 762, true, 30)).toBe(false);
    });
});
