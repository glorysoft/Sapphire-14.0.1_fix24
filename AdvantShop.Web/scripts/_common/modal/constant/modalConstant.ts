import type { IScope } from 'angular';

export type CloseButtonPosition = 'inside' | 'outside';

export type ModalVariantsType = typeof modalVariants;
export type ModalVariantValueType = ModalVariantsType[keyof ModalVariantsType];

export const modalVariants = {
    DEFAULT: 'default',
    SHEET: 'sheet',
};

export interface IModalOptions {
    id: string;
    isOpen: boolean;
    closeOut: boolean;
    isFloating: boolean;
    isShowFooter: boolean;
    spyAddress: boolean;
    destroyOnClose: boolean;
    anchor?: string;
    inIframe: boolean;
    modalClass?: string;
    modalOverlayClass?: string;
    crossEnable: boolean;
    backgroundEnable: boolean;
    startOpenDelay?: number | null;
    closeEsc: boolean;
    zIndex?: number;
    callbackInit?: (scope: IScope) => void;
    callbackClose?: (scope: IScope) => void;
    callbackOpen?: (scope: IScope) => void;
    appendModalClass?: string;
    toBody?: boolean;
    closePosition?: CloseButtonPosition;
    closePositionClass?: string;
}

export interface IModalConfig {
    modalVariant: ModalVariantValueType;
}

export type ModalOptionsDefault = Required<
    Omit<
        IModalOptions,
        | 'closePositionClass'
        | 'modalClass'
        | 'modalOverlayClass'
        | 'callbackInit'
        | 'callbackOpen'
        | 'callbackClose'
        | 'startOpenDelay'
        | 'anchor'
        | 'appendModalClass'
    >
>;

export const modalConfig = {
    modalVariant: modalVariants.DEFAULT,
};

export const modalOptionsDefault: ModalOptionsDefault = {
    destroyOnClose: false,
    inIframe: false,
    spyAddress: false,
    id: '',
    isFloating: false,
    crossEnable: true,
    backgroundEnable: true,
    closeOut: true,
    isOpen: false,
    closeEsc: true,
    isShowFooter: true,
    zIndex: 999,
    toBody: true,
    closePosition: 'outside',
};
