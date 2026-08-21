export const isNotEmpty = <T>(value: T | null | undefined): value is T => value !== null && value !== undefined;
export const isEmpty = <T>(value: T | null | undefined): value is null | undefined => value === null || value === undefined;
