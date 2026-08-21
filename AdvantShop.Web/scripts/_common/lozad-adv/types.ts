import { ICompiledExpression, IScope } from 'angular';
import { ILozadAdvCtrl } from '@/scripts/_common/lozad-adv/lozadAdv.ctrl';

export type LozadAdvObserverMode = 'default' | 'observerAlways';

export type LozadAdvOptions = {
    load: (element: Element) => void;
    afterWindowLoaded: boolean
} & IntersectionObserverInit


export interface LozadAdvObserverWrap {
    observerId: string;
    params: Omit<LozadAdvParams, 'lozadAdv' | 'lozadAdvDebounce'> & {
        handlers: {
            element: Element,
            callback: LozadAdvEntryCallback
        }[]
    },
    observer: IntersectionObserver
    observeWrapper: (element: Element, callback: LozadAdvEntryCallback) => void
}

export type LozadAdvEntryCallback = (entry: IntersectionObserverEntry, observer: IntersectionObserver) => void;
export type LozadAdvObservers = Map<string, LozadAdvObserverWrap>

export type LozadAdvObserverParams = Omit<LozadAdvParams, 'lozadAdv' | 'lozadAdvDebounce'>

export interface LozadAdvParams {
    lozadAdvDebounce: number | boolean,
    lozadObserverMode: LozadAdvObserverMode
    options: LozadAdvOptions,
    lozadAdv: ICompiledExpression,
    lozadAdvKey?: string
}

export interface LozadAdvScope extends IScope {
    lozadAdv: ILozadAdvCtrl;
}
