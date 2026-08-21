import { IController, IPromise } from 'angular';
export interface FilterType<T = any, V = void> {
    value: any;
    readonly callback: ((arg: T) => Promise<V>) | ((arg: T) => IPromise<V>);
    formControl: FilterFormControlType;
}

export interface FilterFormControlType {
    name: string;
    type: 'select';
    values?: FilterFormControlValuesType;
    label?: string;
}

export type FilterFormControlValuesType = (OptionFilterType | string)[];

export interface OptionFilterType<T = unknown> {
    name: string;
    value?: any;
    original?: T;
}

type ChangeFilterCbType = ({ filter }: { filter: FilterType }) => void;

export default class PointsListCtrl implements IController {
    change?: ChangeFilterCbType;
    initSelectValue = (filter: FilterType) => {
        filter.value = filter.formControl.values?.find((it) => {
            if (typeof it === 'string') {
                return it === filter.value;
            }
            return it.value === filter.value?.value;
        });
    };

    onChangeFilter = (filter: FilterType) => {
        filter?.callback(filter.value).then(() => {
            this.change && this.change({ filter });
        });
    };
}
