import type { IScope } from 'angular';
import type { IModalController } from '@/scripts/_common/modal/controllers/modalController';
import { ModalSheetOverlay } from './modalSheetOverlay';
import { ResizeObserverSingleton } from '../../observers/resizeObserver';

export interface IModalSheetOptions {
    element: HTMLElement;
    $scope: IScope;
    modalFormElement: HTMLElement;
    close: IModalController['close'];
    destroyOnClose: boolean;
    zIndex: number;
    isClosable: boolean;
}

// Минимальная высота контента, при которой IntersectionObserver считает модалку загруженной.
// При загрузке данных высота может быть ~30px (спиннер/пустой контент),
// что вызывает ложные срабатывания закрытия модалки.
const MIN_LOADED_CONTENT_HEIGHT = 100;

export class ModalSheet {
    private _observer?: IntersectionObserver;
    private resizeObserver: ResizeObserverSingleton;
    private overlay: ModalSheetOverlay;
    private readonly element: IModalSheetOptions['element'];
    private readonly modalFormElement: IModalSheetOptions['modalFormElement'];
    private readonly $scope: IModalSheetOptions['$scope'];
    private readonly close: IModalSheetOptions['close'];
    private readonly destroyOnClose: IModalSheetOptions['destroyOnClose'];
    private readonly isClosable: IModalSheetOptions['isClosable'];
    private readonly zIndex: IModalSheetOptions['zIndex'];
    private isUserInteracted: boolean;

    constructor(readonly options: IModalSheetOptions) {
        this.element = options.element;
        this.$scope = options.$scope;
        this.modalFormElement = options.modalFormElement;
        this.close = options.close;
        this.destroyOnClose = options.destroyOnClose;
        this.isClosable = options.isClosable;
        this.zIndex = options.zIndex;

        this.overlay = new ModalSheetOverlay(this.element, this.zIndex, this.isClosable ? this.close : undefined);
        this.overlay.showOverlay();
        this.resizeObserver = ResizeObserverSingleton.getInstance();
        this.isUserInteracted = false;

        setTimeout(() => {
            if (this.modalFormElement) {
                this.waitReadyContent()
                    .then(() => {
                        this.watchUserInteracted();

                        if (this.isClosable) {
                            this.setIntersectionObserver();
                        } else {
                            this.setNoClosable();
                        }

                        setTimeout(() => {
                            this.connectResizeObserver();
                            requestAnimationFrame(() => {
                                this.addClassesOnOpen();
                                this.$scope.$apply();
                            });
                        });
                    });
            }
        });
    }

    watchUserInteracted() {
        this.element.addEventListener(
            'pointerdown',
            () => {
                this.isUserInteracted = true;
            },
            { once: true },
        );
    }

    waitReadyContent() {
        return new Promise((resolve) => {
            let timer: NodeJS.Timeout | undefined;
            this.resizeObserver.observe(this.modalFormElement, () => {
                requestAnimationFrame(() => {
                    if (timer) {
                        clearTimeout(timer);
                    }
                    timer = setTimeout(() => {
                        this.resizeObserver.unobserve(this.modalFormElement);
                        resolve(true);
                    }, 250);
                });
            });
        });
    }

    get windowHeight(): number {
        return window.visualViewport?.height || window.innerHeight;
    }


    setNoClosable(): void {
        this.element.classList.add('not-closable');
    }

    setScrollElement(scrollValue: number, smooth = false) {
        this.element.scrollTo({ top: scrollValue, behavior: smooth ? 'smooth' : 'instant' });
    }

    setIntersectionObserver() {
        if (!this.modalFormElement) return;

        const modalContent = this.modalFormElement.querySelector<HTMLElement>('[data-modal-content]');
        if (!modalContent) return;

        let isFirstTime = true;

        this._observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    const contentHeight = entry.boundingClientRect.height;

                    if (contentHeight < MIN_LOADED_CONTENT_HEIGHT) return;

                    if (isFirstTime) {
                        isFirstTime = false;
                        return;
                    }

                    // Закрываем когда модалка ушла из viewport
                    if (!entry.isIntersecting && this.isClosable) {
                        this._observer?.disconnect();
                        this.$scope.$apply(() => {
                            this.close();
                        });
                    }
                });
            },
            {
                threshold: [0.2, 1],
                root: null,
            },
        );

        this._observer.observe(modalContent);
    }

    disconnectIntersectionObserver() {
        this._observer?.disconnect();
    }

    connectResizeObserver() {
        if (this.modalFormElement) {
            const handleResizeObserver = (entry: ResizeObserverEntry) => {
                requestAnimationFrame(() => {
                    if (this.modalFormElement && this.element) {
                        const rect: DOMRect = this.modalFormElement.getBoundingClientRect();
                        const rectElement: DOMRect = this.element.getBoundingClientRect();
                        const scroll: number = Math.floor(
                            entry.contentRect.height > this.windowHeight
                                ? rectElement.height - this.element.scrollTop
                                : rect.height - this.element.scrollTop,
                        );

                        if (!this.isUserInteracted || (rect.top > 0 && scroll > 0)) {
                            this.element.scrollTop += scroll;
                        }
                    }
                });
            };
            this.resizeObserver.observe(this.modalFormElement, handleResizeObserver);
        }
    }

    disconnectResizeObserver() {
        this.resizeObserver?.unobserve(this.modalFormElement);
    }

    addClassesOnOpen() {
        this.element.classList.add('open');
    }

    removeClassesOnOpen() {
        this.element.classList.remove('open');
    }

    destroy = (event?: Event, _skipRemove?: boolean) => {
        event?.preventDefault();
        return new Promise<void>((resolve) => {
            this.overlay.hideOverlay();
            this.disconnectResizeObserver();
            this.disconnectIntersectionObserver();
            this.setScrollElement(0, true);
            setTimeout(() => {
                this.removeClassesOnOpen();
                if (this.destroyOnClose && !_skipRemove) {
                    this.overlay.destroy();
                }
                resolve();
            }, 300);
        });
    };
}
