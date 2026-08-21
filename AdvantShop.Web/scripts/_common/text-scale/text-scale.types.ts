import { IController, IAttributes } from 'angular';
import { textScaleDirectionChangeSize } from '@/scripts/_common/text-scale/text-scale.constants';

export interface ITextScaleService {
    initElement: (
        element: TextScaleElement,
        textScaleLimitCtrl: ITextScaleLimitController,
        textScaleObserverCtrl: ITextScaleObserverController,
        options?: ITextScaleOptions,
    ) => ITextScaleInitFnResult;
    calc: (
        elementList: TextScaleElement | TextScaleElement[],
        textScaleLimitCtrl: ITextScaleLimitController,
        textScaleObserverCtrl: ITextScaleObserverController,
    ) => void;
}

export interface ITextScaleInitFnResult {
    destroy: () => void;
    calc: () => void;
}

export interface ITextScaleOptions {
    fontSizeMax?: number;
    fontSizeMin?: number;
    propsWatch?: TextScalePropsWatch;
}

export type TextScalePropsWatch = 'width' | 'height' | 'both';

export type TextScaleDefaultOptions = Required<Pick<ITextScaleOptions, 'fontSizeMin' | 'fontSizeMax'>>;

export interface ITextScaleController extends IController {
    containerLimit?: ITextScaleLimitController;
    containerObserver?: ITextScaleObserverController;
}

export interface ITextScaleLimitController extends IController {
    element: TextScaleLimitElement;
}

export interface ITextScaleObserverController extends IController {
    element: TextScaleObserverElement;
    propsWatch: TextScalePropsWatch;
    textScaleLimit: ITextScaleLimitController;
    isRegistered: boolean;
}

export interface TextScaleSizesIteration {
    widthMax: number;
    heightMax: number;
    widthNew: number;
    heightNew: number;
}

export type TextScaleElement = HTMLElement;
export type TextScaleLimitElement = HTMLElement;
export type TextScaleObserverElement = HTMLElement;

export type TextScaleDirective = 'textScale' | 'textScaleLimit' | 'textScaleObserver';

export interface ITextScaleStorageValue {
    options?: ITextScaleOptions;
    data: {
        fontSizeCurrent: number;
        fontSizeInitial: number;
        fontSizeMax: number;
        fontSizeMin: number;
    };
}

export type TextScaleDirectionChangeSize = keyof typeof textScaleDirectionChangeSize;

export type TextScaleManagerObserversCallback = (
    elementList: TextScaleElement | TextScaleElement[],
    textScaleLimitCtrl: ITextScaleLimitController,
    textScaleObserverCtrl: ITextScaleObserverController,
) => void;

export type TextScaleAttrs = IAttributes & {
    textScale?: string,
    textScopeEvents?: string
}
