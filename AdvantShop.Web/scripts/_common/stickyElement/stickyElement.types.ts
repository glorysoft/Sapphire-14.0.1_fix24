export type StickyElementCallback = (
    isPinned: boolean,
    scrollParent: StickyElementScrollParent,
    scrollY: number,
) => Promise<StickyElementCallbackResult>;

export interface StickyElementCallbackResult {
    isPinned: boolean;
    scrollParent: StickyElementScrollParent;
    scrollY: number;
}

export type StickyElementDestroy = () => void;
export type StickyElementScrollParent = (HTMLElement | Window) & {
    _stickyInScrollProgress?: boolean;
    _stickyScrollPending?: boolean;
};
export const positionKeys = ['top', 'bottom'] as const;
export type StickyElementPositionName = (typeof positionKeys)[number];
export type StickyElementPositionActivate = 'bottom-self' | `${number}px`;

export interface StickyElementElementRect {
    top: number;
    left: number;
    right: number;
    bottom: number;
    width: number;
    height: number;
}

export interface IStickyElementService {
    addElementToObserver(element: HTMLElement, callback?: StickyElementCallback): StickyElementDestroy;
}

export type StickyElementStorageKey = StickyElementScrollParent;

export type StickyElementStoragePointKey = number;

export interface StickyElementStoragePointValue {
    items: PointValueItem[];
    prevState?: boolean;
    hysteresis?: number;
    // Исходный point до сдвига при пине. Хранится только пока элемент находится
    // в pinned-состоянии со сдвинутым порогом; на unpin point восстанавливается
    // обратно к originalPoint, иначе следующий пин срабатывал бы при scrollY,
    // меньшем чем реальное положение элемента в layout (дрейф порога после
    // каждого pin/unpin-цикла, особенно заметный когда callback меняет высоту
    // через ng-if и компенсация scrollBy получается большой).
    originalPoint?: number;
}

export interface PointValueItem {
    element: HTMLElement;
    callback: StickyElementCallback;
}

export interface IStickyElementStorage {
    set(key: StickyElementStorageKey, value: IStickyElementStoragePoint): void;

    get(key: StickyElementStorageKey): IStickyElementStoragePoint | undefined;

    has(key: StickyElementStorageKey): boolean;

    entries(): MapIterator<[StickyElementStorageKey, IStickyElementStoragePoint]>;

    size(): number;

    createStoragePoint(): IStickyElementStoragePoint;
}

export interface IStickyElementStoragePoint {
    set(key: StickyElementStoragePointKey, value: StickyElementStoragePointValue): void;

    get(key: StickyElementStoragePointKey): StickyElementStoragePointValue | undefined;

    has(key: StickyElementStoragePointKey): boolean;

    entries(): [number, StickyElementStoragePointValue][];

    size(): number;

    delete(key: StickyElementStoragePointKey): void;
}

export interface IStickyElementStorageManager {
    get(position: StickyElementPositionName): IStickyElementStorage | undefined;

    getAll(): [StickyElementPositionName, IStickyElementStorage][];
}

export function isStickyElementPositionName(value: unknown): value is StickyElementPositionName {
    return typeof value !== 'number' && value !== null && positionKeys.some((item) => item === value);
}

export type PointValueTuple = [StickyElementPositionName, number];

export interface ProcessItemResult {
    diffHeight: number;
    point: number;
}

export interface ElementPrevData {
    diffHeight: number;
    heightNew: number;
    isPinned: boolean;
    element: HTMLElement;
}

export interface IWaitTransitionResult {
    value: boolean;
    event?: Event;
}
