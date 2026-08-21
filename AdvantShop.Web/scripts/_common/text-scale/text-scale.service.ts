import {
    ITextScaleLimitController,
    ITextScaleObserverController,
    ITextScaleOptions,
    ITextScaleService,
    ITextScaleStorageValue,
    TextScaleDefaultOptions,
    TextScaleElement,
} from './text-scale.types';
import { textScaleDirectionChangeSize } from '@/scripts/_common/text-scale/text-scale.constants';
import { addOrUpdateStorage, checkSize, toRelativeProportions } from '@/scripts/_common/text-scale/text-scale.helpers';
import TextScaleManagerObservers from '@/scripts/_common/text-scale/text-scale-manager-observers';

const textScaleInitDelayValue = 150;
const textScaleCssClassHidden = 'visibility-hidden';

class TextScaleService implements ITextScaleService {
    private storage = new Map<TextScaleElement, ITextScaleStorageValue>();
    private storageLimit = new Map<ITextScaleLimitController, TextScaleElement[]>();
    private storageTimersInitDelay = new Set<ITextScaleObserverController>();
    private timerInit: NodeJS.Timeout | undefined;
    private textScaleManagerObservers: TextScaleManagerObservers;

    /* @ngInject */
    constructor(private readonly textScaleDefaultOptions: TextScaleDefaultOptions) {
        this.textScaleManagerObservers = new TextScaleManagerObservers((...args) => this.calc(...args));
    }

    initElement(
        element: TextScaleElement,
        textScaleLimitCtrl: ITextScaleLimitController,
        textScaleObserverCtrl: ITextScaleObserverController,
        options?: ITextScaleOptions,
    ) {
        if (textScaleLimitCtrl) {
            addOrUpdateStorage<ITextScaleLimitController>(this.storageLimit, textScaleLimitCtrl, element);
        }
        if (textScaleObserverCtrl) {
            addOrUpdateStorage<ITextScaleObserverController>(this.textScaleManagerObservers.storageObservers, textScaleObserverCtrl, element);
        }

        const fontSizeCurrent = parseFloat(window.getComputedStyle(element).getPropertyValue('font-size'));

        if (isNaN(fontSizeCurrent)) {
            throw new Error('textScale: invalid font-size value');
        }

        this.storage.set(element, {
            options,
            data: {
                fontSizeMax: options?.fontSizeMax ?? this.textScaleDefaultOptions.fontSizeMax,
                fontSizeMin: options?.fontSizeMin ?? this.textScaleDefaultOptions.fontSizeMin,
                fontSizeInitial: fontSizeCurrent,
                fontSizeCurrent,
            },
        });

        if (typeof this.timerInit !== 'undefined') {
            clearTimeout(this.timerInit);
        }

        this.storageTimersInitDelay.add(textScaleObserverCtrl);

        this.timerInit = setTimeout(() => {
            let textScaleElementList: TextScaleElement[] | undefined;
            for (const observer of this.storageTimersInitDelay) {
                textScaleElementList = this.textScaleManagerObservers.storageObservers.get(observer);
                if (typeof textScaleElementList === 'undefined') {
                    continue;
                }
                this.textScaleManagerObservers.storageActives.add(observer);
                this.calc(textScaleElementList, observer.textScaleLimit, observer);
                this.textScaleManagerObservers.storageActives.delete(observer);
                this.observeOnNextTick(observer);
            }
        }, textScaleInitDelayValue);

        return {
            destroy: () => {
                this.textScaleManagerObservers.unobserve(textScaleObserverCtrl);
                this.storage.delete(element);
                this.textScaleManagerObservers.storageActives.delete(textScaleObserverCtrl);
            },
            calc: () => {
                this.calc(element, textScaleLimitCtrl, textScaleObserverCtrl);
            },
        };
    }

    private observeOnNextTick(textScaleObserver: ITextScaleObserverController) {
        setTimeout(() => {
            this.textScaleManagerObservers.observe(textScaleObserver);
        });
    }

    calc(
        elementList: TextScaleElement | TextScaleElement[],
        textScaleLimitCtrl: ITextScaleLimitController,
        textScaleObserverCtrl: ITextScaleObserverController,
    ) {
        const heightMax = textScaleLimitCtrl.element.offsetHeight,
            widthMax = textScaleLimitCtrl.element.offsetWidth,
            heightCurrent = textScaleObserverCtrl.element.offsetHeight,
            widthCurrent = textScaleObserverCtrl.element.offsetWidth;

        if (heightMax <= 0 || widthMax <= 0) {
            return;
        }

        let heightNew = heightCurrent,
            widthNew = widthCurrent;

        //const step = heightMax > heightNew && widthMax > widthNew ? 1 : -1;
        const direction =
            heightMax > heightNew && widthMax > widthNew ? textScaleDirectionChangeSize.increase : textScaleDirectionChangeSize.decrease;
        const _elementList = Array.isArray(elementList) ? elementList : [elementList];

        const tempDataList: ITextScaleStorageValue[] = [];
        const prevState: { fontSizeCurrent?: number; limit: boolean }[] = [];

        const fontSizesList: number[] = [];
        for (let i = 0; i < _elementList.length; i++) {
            const _storageValue = this.storage.get(_elementList[i]);
            if (typeof _storageValue === 'undefined') {
                throw new Error('textScale: not exist value in storage');
            }
            tempDataList[i] = _storageValue;
            fontSizesList[i] = _storageValue.data.fontSizeInitial;
        }

        const stepsElements = toRelativeProportions(fontSizesList);

        while (
            checkSize(textScaleObserverCtrl.propsWatch, direction, {
                widthMax,
                heightMax,
                widthNew,
                heightNew,
            }) &&
            (prevState.length === 0 || prevState.some((it) => !it.limit))
        ) {
            for (let i = 0; i < _elementList.length; i++) {
                if (prevState[i]?.limit) {
                    continue;
                }

                const fontSizeCurrent = tempDataList[i].data.fontSizeCurrent;
                let fontSizeNew = fontSizeCurrent;

                if (
                    (direction === 'increase' && fontSizeNew > tempDataList[i].data.fontSizeMax) ||
                    (direction === 'decrease' && fontSizeNew < tempDataList[i].data.fontSizeMin)
                ) {
                    if (prevState[i]) {
                        prevState[i].limit = true;
                    } else {
                        prevState[i] = {
                            limit: true,
                        };
                    }
                    continue;
                }

                fontSizeNew += stepsElements[i] * (direction === 'increase' ? 1 : -1);
                _elementList[i].style.fontSize = `${fontSizeNew}px`;
                tempDataList[i].data.fontSizeCurrent = fontSizeNew;

                if (prevState[i]) {
                    prevState[i].fontSizeCurrent = direction === 'increase' ? fontSizeCurrent : fontSizeNew;
                } else {
                    prevState[i] = {
                        fontSizeCurrent: direction === 'increase' ? fontSizeCurrent : fontSizeNew,
                        limit: false,
                    };
                }
            }

            heightNew = textScaleObserverCtrl.element.offsetHeight;
            widthNew = textScaleObserverCtrl.element.offsetWidth;
        }
        let prevStateItemTemp;
        for (let i = 0; i < prevState.length; i++) {
            prevStateItemTemp = prevState[i];
            if (typeof prevStateItemTemp === 'undefined' || typeof prevStateItemTemp.fontSizeCurrent === 'undefined') {
                continue;
            }
            _elementList[i].style.fontSize = `${prevStateItemTemp.fontSizeCurrent}px`;
            tempDataList[i].data.fontSizeCurrent = prevStateItemTemp.fontSizeCurrent;
            this.storage.set(_elementList[i], tempDataList[i]);
        }

        _elementList.forEach((el) => el.classList.remove(textScaleCssClassHidden));

        textScaleObserverCtrl.element.classList.remove(textScaleCssClassHidden);
        textScaleLimitCtrl.element.classList.remove(textScaleCssClassHidden);
    }
}

export default TextScaleService;
