export type Camelize<T> = {
    [K in keyof T as CamelizeString<K>]: T[K];
};

export type CamelizeString<T extends PropertyKey> = T extends string ? Uncapitalize<T> : T;

export type NullableProperty<T extends Record<PropertyKey, any>> = {
    [K in keyof T]: T[K] | null;
};

export type WithRequiredField<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type MakeAllRequired<T> = {
    [K in keyof T]-?: T[K];
};

export type MakeOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
