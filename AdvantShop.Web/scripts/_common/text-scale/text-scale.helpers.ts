import {
    TextScaleDirectionChangeSize, TextScaleElement, TextScaleObserverElement,
    TextScalePropsWatch,
    TextScaleSizesIteration,
} from '@/scripts/_common/text-scale/text-scale.types';

export const checkSize =
    (propsWatch: TextScalePropsWatch,
     direction: TextScaleDirectionChangeSize,
     sizes: TextScaleSizesIteration) => {
        const exps: boolean[] = [];
        if (propsWatch === 'width' || propsWatch === 'both') {
            exps.push(direction === 'increase' ? sizes.widthNew < sizes.widthMax : sizes.widthNew > sizes.widthMax);
        }
        if (propsWatch === 'height' || propsWatch === 'both') {
            exps.push(direction === 'increase' ? sizes.heightNew < sizes.heightMax : sizes.heightNew > sizes.heightMax);
        }

        return direction === 'increase' ? exps.every((it) => it) : exps.some((it) => it);
    };

export const addOrUpdateStorage = <T>(storage: Map<T, TextScaleElement[]>, key: T, textScaleElement: TextScaleElement) => {
    let storageValue = storage.get(key);

    if (typeof storageValue === 'undefined') {
        storageValue = [textScaleElement];
    } else {
        storageValue.push(textScaleElement);
    }
    storage.set(key, storageValue);
};

export const toRelativeProportions = (arr:number[]) => {
    // Проверка на пустой массив
    if (!arr.length) {
        throw new Error('textScale: array is empty');
    }

    // Находим минимальное значение
    const min = Math.min(...arr);

    // Если минимум 0 или отрицательный, добавляем смещение
    let offset = 0;
    if (min <= 0) {
        offset = Math.abs(min) + 1;
    }

    // Вычисляем пропорции
    const adjustedArr = arr.map(num => num + offset);
    const adjustedMin = Math.min(...adjustedArr);

    // Возвращаем пропорции с минимальным значением 1
    return adjustedArr.map(num => num / adjustedMin);
}
