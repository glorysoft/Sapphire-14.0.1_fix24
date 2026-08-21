import path from 'node:path';
import GlobalsPlugin from 'esbuild-plugin-globals';
import inlineImportPlugin from 'esbuild-plugin-inline-import';
import { sassPlugin } from 'esbuild-sass-plugin';
import cleanupPlugin from './plugins/esbuild-cleanup-plugin/index.js';
import { postcssConfigFn } from '../../../postcss.config.js';
import postcss from 'postcss';
import browserslistToEsbuild from 'browserslist-to-esbuild';
import { projectsNames } from '../../shopVariables.js';
import babel from 'esbuild-plugin-babel';
import ngInjectVisitor from './plugins/esbuild-angularjs-annotate/ngInjectTransform.visitor.js';
import ngInjectEsbuildPlugin from './plugins/esbuild-angularjs-annotate/ngInjectTransform.esbuild.js'
export const getConfig = (env) => {
    const { entryPoints, directoryWork, publicPath } = env;

    const loader = {
        '.html': 'file',
        '.svg': 'file',
        '.png': 'file',
        '.jpg': 'file',
        '.gif': 'file',
        '.cur': 'file',
    };

    const plugins = [
        GlobalsPlugin({
            jquery: 'jQuery',

            $: 'jQuery',
        }),
        env.mode === 'development' ? ngInjectEsbuildPlugin() : babel({
            // eslint-disable-next-line require-unicode-regexp
            filter: /\.(?<ext>js|ts)$/,
            config: {
                'presets': [
                    '@babel/preset-typescript',
                    [
                        '@babel/preset-env', {
                        'useBuiltIns': 'usage',
                        'corejs': {
                            'version': '3.49.0'
                        },
                        'modules': false
                    }]],
                'plugins': [ngInjectVisitor],
                ignore: ['**/node_modules/**', '**/dist/**'],
            },
        }),
        inlineImportPlugin({
            // eslint-disable-next-line require-unicode-regexp
            filter: /\?raw$/,
        }),
        sassPlugin({
            embedded: true,
            async transform(source, resolveDir) {
                const { css } = await postcss(postcssConfigFn({ options: { variables: env } }).plugins).process(source, {
                    from: resolveDir,
                });
                return {
                    contents: css,
                    resolveDir,
                    loader: 'css',
                };
            },
        }),
        cleanupPlugin(),
    ];

    const external = ['*.woff2', '*.woff', '*.ttf', '*.eot', '*.eot#iefix', '*.eot?#iefix'];
    return {
        bundle: true,
        metafile: true,
        ignoreAnnotations: true,
        platform: 'browser',
        target: browserslistToEsbuild(),
        format: 'iife',
        inject: [path.resolve(process.cwd(), 'node_scripts/bundle/esbuild/inject/tinycolor-inject.js')],
        entryPoints,
        absWorkingDir: directoryWork,
        outdir: path.join(directoryWork, `dist`, path.sep),
        assetNames: 'assets/[name].[hash]',
        chunkNames: 'chunks/[name].[hash]',
        entryNames: 'entries/[name].[hash]',
        loader,
        plugins,
        external,
        minifyIdentifiers: false,
        publicPath: env.project === projectsNames.templates ? `${publicPath}dist` : undefined,
    };
};
