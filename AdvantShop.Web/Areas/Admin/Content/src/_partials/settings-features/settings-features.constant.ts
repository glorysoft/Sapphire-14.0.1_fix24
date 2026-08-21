export type FeatureDef = 'GsSymbolAutoFix';

type KeyValueSame<K extends string | number | symbol> = {
    [P in K]: P;
};

export const SettingFeaturesKeys: KeyValueSame<FeatureDef> = {
    GsSymbolAutoFix: 'GsSymbolAutoFix',
};
