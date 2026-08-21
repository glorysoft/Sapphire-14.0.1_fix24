import {
    ElementPrevData,
    isStickyElementPositionName,
    type IStickyElementStorage,
    IStickyElementStorageManager,
    IStickyElementStoragePoint,
    IWaitTransitionResult,
    PointValueItem,
    positionKeys,
    StickyElementPositionActivate,
    StickyElementPositionName,
    StickyElementScrollParent,
    StickyElementStoragePointValue,
} from '@/scripts/_common/stickyElement/stickyElement.types';

export const checkSticky = (storageManager: IStickyElementStorageManager, scrollParent: StickyElementScrollParent, isUserScroll: boolean) => {
    const scrollY = getScrollValue(scrollParent);
    return iteration(storageManager.getAll(), scrollParent, isUserScroll, scrollY);
};

const iteration = (
    storageMain: [StickyElementPositionName, IStickyElementStorage][],
    scrollParent: StickyElementScrollParent,
    isUserScroll: boolean,
    scrollY: number,
    processed = false,
): Promise<boolean> => {
    if (storageMain.length === 0) {
        // Восстановление прежней scrollY нужно только для краевого случая,
        // когда ни одна позиция не содержит зарегистрированных элементов
        // (processed === false). При нормальном проходе компенсация уже выполнена
        // внутри iterationPoints (через startHeightTracking + newPoint), и повторный
        // scrollTo здесь ломает её, вызывая осцилляцию.
        if (!processed && isUserScroll) {
            setTimeout(() => {
                if (getScrollValue(scrollParent) !== scrollY) {
                    scrollParent.scrollTo(0, scrollY);
                }
            });
        }
        return Promise.resolve(false);
    }

    const item = storageMain.shift();

    if (typeof item === 'undefined') {
        return iteration(storageMain, scrollParent, isUserScroll, scrollY, processed);
    }
    const _position = item[0],
        storage = item[1];

    const storageValue = storage.get(scrollParent);

    if (typeof storageValue === 'undefined') {
        return iteration(storageMain, scrollParent, isUserScroll, scrollY, processed);
    }

    return iterationPoints(storageValue, storageValue.entries(), _position, scrollParent, scrollY, undefined, isUserScroll).then(() =>
        iteration(storageMain, scrollParent, isUserScroll, scrollY, true),
    );
};

const iterationPoints = (
    storageValue: IStickyElementStoragePoint,
    storagePoints: [number, StickyElementStoragePointValue][],
    position: StickyElementPositionName,
    scrollParent: StickyElementScrollParent,
    scrollY: number,
    elementPrevData?: ElementPrevData,
    isUserScroll = false,
): Promise<boolean> => {
    if (storagePoints.length === 0) {
        return Promise.resolve(false);
    }

    const item = storagePoints.shift();
    if (typeof item === 'undefined') {
        return Promise.resolve(false);
    }

    const [point, { items, prevState, hysteresis, originalPoint }] = item;
    let _point = point;

    //если на предыдущем шаге отловили момент, когда элемент после смены состояния изменил высоту
    if (typeof elementPrevData !== 'undefined') {
        // Блок stacking-обновления валиден только когда current стоит в DOM НИЖЕ prev:
        // именно для таких пар prev.diffHeight реально сдвигает «висящее» положение current.
        // После pin/unpin-циклов точки в storage дрейфуют (у «низшего» элемента point может
        // стать меньше, чем у верхнего), сортировка переворачивается, и prev с current
        // меняются местами в логическом порядке. Без этого guard-а верхний элемент
        // (напр. site-head) получал `style.top = 30px` от diffHeight колонки под ним.
        const currentElement = items[0]?.element;
        const prevElement = elementPrevData.element;
        /* eslint-disable no-bitwise */
        const prevFollowingCurrent =
            currentElement && prevElement ? prevElement.compareDocumentPosition(currentElement) & Node.DOCUMENT_POSITION_FOLLOWING : 0;
        /* eslint-enable no-bitwise */
        const currentIsBelowPrev = prevFollowingCurrent !== 0;

        if (currentIsBelowPrev) {
            const original = Number(currentElement.style.top.replace('px', ''));
            _point += elementPrevData.diffHeight + (elementPrevData.isPinned ? elementPrevData.heightNew * -1 : 0);
            const newCssValue = `${elementPrevData.diffHeight + original}px`;
            items.forEach(({ element }) => {
                element.style.top = newCssValue;
            });

            storageValue.delete(point);
            storageValue.set(_point, { items, prevState, hysteresis, originalPoint });
        }
    }

    const isPinned = checkIsPinned(position, _point, scrollParent, scrollY, prevState, hysteresis);

    if (prevState !== isPinned) {
        // Первая проверка (prevState === undefined) идёт сразу после addElementToObserver:
        // здесь нельзя крутить transition и scrollBy-компенсацию, иначе при ненулевом
        // стартовом scrollY (восстановление скролла браузером, переход по якорю) начальный
        // pin утянет страницу вниз на величину diffHeight.
        const isInitial = typeof prevState === 'undefined';
        storageValue.set(_point, { items, prevState: isPinned, hysteresis, originalPoint });
        return callbacksRun(scrollParent, scrollY, items, isPinned, isInitial, isUserScroll)
            .then((prevElementData) => {
                const pointData = storageValue.get(_point);
                if (!pointData) {
                    return iterationPoints(storageValue, storagePoints, position, scrollParent, scrollY, prevElementData, isUserScroll);
                }

                // Unpin со сдвинутым ранее порогом: возвращаем _point к исходному. Сдвиг
                // нужен был только чтобы pin не отлипал немедленно от scrollBy-компенсации;
                // после отлипания он становится вреден — без восстановления каждый следующий
                // pin/unpin сдвигал бы порог всё ниже, и элемент начинал бы пиниться задолго
                // до своего реального места в layout.
                if (!isPinned && typeof pointData.originalPoint !== 'undefined') {
                    const restoredPoint = pointData.originalPoint;
                    storageValue.delete(_point);
                    storageValue.set(restoredPoint, { items, prevState: isPinned, hysteresis });
                    return iterationPoints(storageValue, storagePoints, position, scrollParent, scrollY, prevElementData, isUserScroll);
                }

                if (prevElementData.diffHeight !== 0) {
                    // Во время анимации scrollY мог сдвинуться компенсацией в startHeightTracking
                    // (isUserScroll) или браузерным scroll anchoring. Threshold-точку
                    // сдвигаем только если без сдвига она оказалась бы выше текущего scrollY —
                    // т.е. компенсация загнала бы элемент в немедленный unpin. Иначе оставляем
                    // исходный _point: для trapped-at-top sticky (_point=0, элемент при пине
                    // уменьшается, scrollDelta положительный) сдвиг вверх ломал бы возврат
                    // к unpinned-состоянию — порог уезжал бы выше реального положения скролла.
                    // Re-entrancy во время самой анимации блокируется _stickyInScrollProgress
                    // в scrollCallback, отдельный hysteresis-буфер здесь не нужен.
                    //
                    // ВАЖНО: при isUserScroll величину сдвига нельзя измерять как
                    // (scrollYAfter - scrollY). _stickyInScrollProgress блокирует только повторный
                    // запуск scrollCallback, но не сам скролл — колесо мыши продолжает крутиться все
                    // ~300мс анимации, и в эту разницу попадает прокрутка пользователя, а не только
                    // наша scrollBy-компенсация. От такого загрязнённого scrollDelta порог уезжал в
                    // сторону, и на следующем (pending) проходе элемент перепинивался — отсюда смена
                    // состояния при непрерывном скролле колесом, хотя её быть не должно.
                    // startHeightTracking суммарно сдвигает scrollY ровно на -diffHeight, поэтому при
                    // пользовательском скролле берём эту известную величину напрямую. Для программного
                    // скролла компенсации scrollBy нет (startHeightTracking не запускается), scrollY
                    // двигает только scroll anchoring — там по-прежнему измеряем фактический сдвиг.
                    const scrollDelta = isUserScroll ? -prevElementData.diffHeight : getScrollValue(scrollParent) - scrollY;
                    const scrollYAfter = isUserScroll ? scrollY + scrollDelta : getScrollValue(scrollParent);
                    const newPoint = scrollYAfter < _point ? _point + scrollDelta : _point;
                    if (newPoint !== _point) {
                        storageValue.delete(_point);
                        storageValue.set(newPoint, {
                            ...pointData,
                            originalPoint: pointData.originalPoint ?? _point,
                        });
                    }
                }
                return iterationPoints(storageValue, storagePoints, position, scrollParent, scrollY, prevElementData, isUserScroll);
            })
            .then(() => true);
    }

    return iterationPoints(storageValue, storagePoints, position, scrollParent, scrollY, elementPrevData, isUserScroll);
};

const callbacksRun = (
    scrollParent: StickyElementScrollParent,
    scrollY: number,
    items: PointValueItem[],
    isPinned: boolean,
    isInitial = false,
    isUserScroll = false,
): Promise<ElementPrevData> =>
    Promise.all(
        items.map(({ element, callback }) => {
            if (isInitial) {
                // Стартовое состояние применяем синхронно: transition-класс не навешиваем,
                // startHeightTracking не запускаем. diffHeight=0 — значит newPoint и CSS top
                // дальше в iterationPoints не сдвигаются, и страница не дёргается.
                return callback(isPinned, scrollParent, scrollY).then(() => ({
                    diffHeight: 0,
                    heightNew: element.offsetHeight,
                    isPinned,
                    element,
                }));
            }

            let diffHeightCurrentItem = 0;
            const elementOldHeight = element.offsetHeight;

            let isAnimating = true;

            function startHeightTracking(block: HTMLElement) {
                let prevHeight = elementOldHeight;

                function tick() {
                    const currentHeight = block.offsetHeight;
                    const delta = currentHeight - prevHeight;

                    if (delta !== 0) {
                        scrollParent.scrollBy({
                            top: delta * -1,
                        });
                        prevHeight = currentHeight;
                    }

                    if (isAnimating) {
                        requestAnimationFrame(tick);
                    }
                }

                requestAnimationFrame(tick);
            }

            // Компенсацию через scrollBy запускаем только при пользовательском скролле.
            // Для программных smooth-скроллов (anchor-переходы, scroll-to-top) любой
            // синхронный scrollBy отменяет активную анимацию браузера — smooth никогда
            // не доходит до цели. В этом случае полагаемся на overflow-anchor на соседях.
            if (isUserScroll) {
                startHeightTracking(element);
            }

            // Слушатель должен быть установлен ДО добавления класса — иначе transitionrun
            // успевает всплыть раньше, чем .then(()=>waitTransition()) зарегистрирует обработчик,
            // и высота отслеживается только 50 мс вместо 300 мс, что приводит к прыжкам.
            const transitionWaiter = waitTransition(element);
            element.classList.add('sticky-element-animation-start');
            //callback может поменять содержимое элемента из-за чего высота измениться
            return callback(isPinned, scrollParent, scrollY)
                .then(() => transitionWaiter)
                .then(() => {
                    isAnimating = false;
                    element.classList.remove('sticky-element-animation-start');
                    const elementNewHeight = element.offsetHeight;
                    if (elementOldHeight !== elementNewHeight) {
                        diffHeightCurrentItem = elementNewHeight - elementOldHeight;
                    }

                    return { diffHeight: diffHeightCurrentItem, heightNew: elementNewHeight, isPinned, element };
                });
        }),
    ).then((results) => ({
        diffHeight: results.reduce((sum, item) => sum + item.diffHeight, 0),
        heightNew: results.reduce((sum, item) => sum + item.heightNew, 0),
        isPinned: results[0]?.isPinned ?? false,
        element: results[0]?.element as HTMLElement,
    }));

export const checkIsPinned = (
    position: StickyElementPositionName,
    point: number,
    scrollParent: StickyElementScrollParent,
    scrollY: number,
    prevState?: boolean,
    hysteresis?: number,
) => {
    // Гистерезис: если элемент уже прилипший и изменил высоту на H,
    // отлипание требует прокрутки на H пикселей назад за порог.
    // Это предотвращает осцилляцию от scroll anchoring браузера.
    // Math.min гарантирует, что порог отлипания не уйдёт ниже 0
    // (иначе при point < hysteresis элемент никогда не отлипнет).
    const buffer = prevState ? Math.max(1, hysteresis ? Math.min(hysteresis, point) : 0) : 0;
    if (position === 'top') {
        return scrollY > Math.max(0, point - buffer);
    }
    if (position === 'bottom') {
        return scrollY < point - (isWindow(scrollParent) ? scrollParent.innerHeight : scrollParent.clientHeight) + buffer;
    }
    throw new Error(`stickyElement: not implemented process for position "${position}"`);
};

export const getPosition = (position: StickyElementPositionName | HTMLElement): StickyElementPositionName => {
    const _positonValue = typeof position === 'string' ? position : positionKeys.find((item) => typeof position.dataset[item] !== 'undefined');

    if (typeof _positonValue === 'undefined') {
        return 'top';
    }

    if (!isStickyElementPositionName(_positonValue)) {
        throw new Error(`stickyElement: invalid position ${_positonValue}`);
    }

    return _positonValue;
};

export function isWindow(value: unknown): value is Window {
    return value === window;
}

export function isPositionActive(value: unknown): value is StickyElementPositionActivate {
    return value === 'bottom-self' || !isNaN(parseFloat(value as string));
}

export const getScrollValue = (element: StickyElementScrollParent) => (isWindow(element) ? element.scrollY : element.scrollTop);

export const getScrollParentHeight = (element: StickyElementScrollParent) => (isWindow(element) ? element.innerHeight : element.clientHeight);

const hasTransition = (element: StickyElementScrollParent): Promise<IWaitTransitionResult> =>
    new Promise((resolve) => {
        element.addEventListener(
            'transitionrun',
            (event) => {
                resolve({ value: true, event });
            },
            { once: true },
        );
    });

export const waitTransition = (element: StickyElementScrollParent) =>
    Promise.race([
        hasTransition(element),
        new Promise<IWaitTransitionResult>((resolve) => {
            setTimeout(() => {
                resolve({ value: false });
            }, 50);
        }),
    ]).then((hasTransitionElement) => {
        if (hasTransitionElement.value) {
            return new Promise<IWaitTransitionResult>((resolve) => {
                element.addEventListener(
                    'transitionend',
                    (event) => {
                        resolve({ value: true, event });
                    },
                    { once: true },
                );

                element.addEventListener(
                    'transitioncancel',
                    (event) => {
                        resolve({ value: true, event });
                    },
                    { once: true },
                );
            });
        }
        return Promise.resolve({ value: false });
    });
