import type { IStickyElementStoragePoint, StickyElementStoragePointKey, StickyElementStoragePointValue } from '../stickyElement.types';

export class StickyElementStoragePoint implements IStickyElementStoragePoint {
    private storage: Map<StickyElementStoragePointKey, StickyElementStoragePointValue>;
    constructor() {
        this.storage = new Map();
    }

    set(key: StickyElementStoragePointKey, value: StickyElementStoragePointValue) {
        this.storage.set(key, value);
    }
    get(key: StickyElementStoragePointKey) {
        return this.storage.get(key);
    }
    has(key: StickyElementStoragePointKey) {
        const item = this.get(key);
        return typeof item !== 'undefined';
    }

    size() {
        return this.storage.size;
    }

    entries() {
        // Сортировка идёт по DOM-порядку элементов, а не по числовому point.
        // Point в storage дрейфует на pin/unpin-циклах (scrollBy-компенсация + diffHeight от
        // реflow), и у «нижнего» элемента point может стать меньше, чем у верхнего. После этого
        // sort по point переворачивает итерацию и stacking-логика в iterationPoints начинает
        // применяться в обратную сторону (верхнему элементу прилетает top от нижнего).
        // DOM-порядок стабилен и всегда совпадает с физическим расположением элементов.
        return Array.from(this.storage.entries()).sort((item1, item2) => {
            const el1 = item1[1].items[0]?.element;
            const el2 = item2[1].items[0]?.element;
            if (!el1 || !el2) {
                return item1[0] > item2[0] ? 1 : -1;
            }
            // eslint-disable-next-line no-bitwise
            const pos = el1.compareDocumentPosition(el2) & Node.DOCUMENT_POSITION_FOLLOWING;
            return pos !== 0 ? -1 : 1;
        });
    }

    delete(key: StickyElementStoragePointKey) {
        if (!this.has(key)) {
            throw new Error(`stickyElement: key"${key}" does not exist in storage`);
        }
        this.storage.delete(key);
    }
}
