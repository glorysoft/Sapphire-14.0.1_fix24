import { ResizeObserverSingleton } from '../observers/resizeObserver.ts';

class SetCssCustomPropsService {
    static $inject = [];
    #root = document.documentElement;
    #observer;
    #storage = new Map();
    #storageCssPropertiesKey = new Set();

    getValuePropertyElement(el, property) {
        const computedStyleElement = getComputedStyle(el);
        return computedStyleElement[property];
    }

    getValueFromMapAndSetProperty(el, objMap) {
        for (const [nameCssProperty, nameProperty] of Object.entries(objMap)) {
            this.setCustomProperty(el, nameCssProperty, nameProperty);
        }
    }

    setCustomProperty(el, name, value) {
        const nameCustomProperty = `--${name}`;

        if (typeof value === `function`) {
            this.#root.style.setProperty(nameCustomProperty, `${value()}px`);
        } else {
            const valueProperty = this.getValuePropertyElement(el, value);
            if (valueProperty) {
                this.#root.style.setProperty(nameCustomProperty, valueProperty);
            }
        }
    }

    sum(el, args) {
        return () =>
            args.reduce((sum, it) => {
                const value = this.getValuePropertyElement(el, it);
                if (value) {
                    return parseFloat(value) + sum;
                }
                return sum;
            }, 0);
    }

    observe(el) {
        const handleResizeObserver = (entry) => {
            if (entry.contentBoxSize) {
                const objMap = this.#storage.get(entry.target);
                this.getValueFromMapAndSetProperty(entry.target, objMap);
            }
        };

        if (!this.#observer) {
            this.#observer = ResizeObserverSingleton.getInstance();
        }

        this.#observer.observe(el, handleResizeObserver);
    }

    findConflict(objMap) {
        const errors = [];
        const items = Array.isArray(objMap) ? objMap : [objMap];

        for (const item of items) {
            for (const key in item) {
                if (this.#storageCssPropertiesKey.has(key)) {
                    errors.push(key);
                }
            }
        }

        return errors.length > 0 ? errors : null;
    }

    removeStorageCssPropertiesKeys(objMap) {
        const items = Array.isArray(objMap) ? objMap : [objMap];

        for (const item of items) {
            for (const key of Object.keys(item)) {
                this.#storageCssPropertiesKey.delete(key);
            }
        }
    }

    initElement(element, objMap, options) {
        const conflicts = this.findConflict(objMap);

        if (conflicts) {
            console.warn(`setCssCustomProps: conflict prop names: ${conflicts.join(',')}`);
        }

        this.#storage.set(element, objMap);

        if (Array.isArray(objMap)) {
            objMap.forEach((it) => {
                this.getValueFromMapAndSetProperty(element, it);
            });
        } else {
            this.getValueFromMapAndSetProperty(element, objMap);
        }

        if (options.watch) {
            this.observe(element);
        }

        return () => {
            this.#observer.unobserve(element);
            this.removeStorageCssPropertiesKeys(objMap);
        };
    }
}

export default SetCssCustomPropsService;
