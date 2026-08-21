import { TextScaleDefaultOptions } from './text-scale.types';

export const textScaleDefaultOptions: TextScaleDefaultOptions = {
    fontSizeMin: 10,
    fontSizeMax: 500
};

export const textScaleDirectionChangeSize = {
    increase: 'increase',
    decrease: 'decrease',
} as const;
