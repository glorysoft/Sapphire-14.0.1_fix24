export const kebabCase = (string) =>
    string
        .replace(/([a-z])([A-Z])/gu, '$1-$2')
        .replace(/[\s_]+/gu, '-')
        .toLowerCase();
