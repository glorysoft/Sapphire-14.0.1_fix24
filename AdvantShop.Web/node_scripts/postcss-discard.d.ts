declare module 'postcss-discard' {
    import type { PluginCreator } from 'postcss';

    export interface PostcssDiscardOptions {
        atrule?: (string | RegExp)[];
        rule?: (string | RegExp)[];
        decl?: (string | RegExp)[];
        css?: string;
    }

    const postcssDiscard: PluginCreator<PostcssDiscardOptions>;
    export default postcssDiscard;
}
