import {
    ITextScaleObserverController,
    TextScaleElement, TextScaleManagerObserversCallback,
    TextScaleObserverElement,
} from '@/scripts/_common/text-scale/text-scale.types';

class TextScaleManagerObservers {
    public storageObservers = new Map<ITextScaleObserverController, TextScaleElement[]>();
    public storageActives = new Set<ITextScaleObserverController>();
    private observer?: ResizeObserver;
    public onResize: TextScaleManagerObserversCallback | undefined;

    constructor(onResize?: TextScaleManagerObserversCallback) {
        this.onResize = onResize;
    }

    getObserverByElement(element: TextScaleObserverElement) {
        for (const key of this.storageObservers.keys()) {
            if (key.element === element) {
                return key;
            }
        }
        return undefined;
    }

    private getObserver() {
        if (this.observer) {
            return this.observer;
        }

        this.observer = new ResizeObserver((entries) => {
            requestAnimationFrame(() => {
                let targetTemp: TextScaleObserverElement,
                    elementsList: TextScaleElement[] | undefined,
                    keyStorageObserver: ITextScaleObserverController | undefined;

                for (const entry of entries) {
                    targetTemp = entry.target as TextScaleObserverElement;
                    if (entry.contentBoxSize) {
                        keyStorageObserver = this.getObserverByElement(targetTemp);
                        if (typeof keyStorageObserver === 'undefined') {
                            throw new Error('textScale: not exist key in storage observers');
                        }
                        elementsList = this.storageObservers.get(keyStorageObserver);
                        if (typeof elementsList === 'undefined' || this.storageActives.has(keyStorageObserver)) {
                            continue;
                        }
                        this.storageActives.add(keyStorageObserver);

                        if (this.onResize) {
                            this.onResize(elementsList, keyStorageObserver.textScaleLimit, keyStorageObserver);
                            this.storageActives.delete(keyStorageObserver);
                        }
                    }
                }
            });
        });

        return this.observer;
    }

    observe(containerObserver: ITextScaleObserverController) {
        if (!containerObserver.isRegistered) {
            this.getObserver().observe(containerObserver.element);
            containerObserver.isRegistered = true;
        }
    }

    unobserve(containerObserver: ITextScaleObserverController) {
        this.storageObservers.delete(containerObserver);
        this.getObserver().unobserve(containerObserver.element);
        containerObserver.isRegistered = false;
    }
}

export default TextScaleManagerObservers;
