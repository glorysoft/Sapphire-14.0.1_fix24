type ResizeCallback = (entry: ResizeObserverEntry) => void;

export class ResizeObserverSingleton {
    private static instance: ResizeObserverSingleton;

    private observer: ResizeObserver;
    private callbacks = new Map<Element, Set<ResizeCallback>>();

    private constructor() {
        this.observer = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const element = entry.target;
                const handlers = this.callbacks.get(element);
                if (handlers) {
                    handlers.forEach((cb) => cb(entry));
                }
            }
        });
    }

    public static getInstance(): ResizeObserverSingleton {
        if (!this.instance) {
            this.instance = new ResizeObserverSingleton();
        }
        return this.instance;
    }

    public observe(element: Element, callback: ResizeCallback) {
        if (!this.callbacks.has(element)) {
            this.callbacks.set(element, new Set());
            this.observer.observe(element);
        }
        this.callbacks.get(element)!.add(callback);
    }

    public unobserve(element: Element, callback?: ResizeCallback) {
        const handlers = this.callbacks.get(element);
        if (!handlers) return;

        if (callback) {
            handlers.delete(callback);
        }

        // Если нет колбэков — отключаем элемент
        if (handlers.size === 0 || !callback) {
            this.callbacks.delete(element);
            this.observer.unobserve(element);
        }
    }
}
