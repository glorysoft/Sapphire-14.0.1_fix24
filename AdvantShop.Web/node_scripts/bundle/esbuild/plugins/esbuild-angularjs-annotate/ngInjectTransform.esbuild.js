import { readFile } from 'node:fs/promises';
import { ngInjectTransform } from './ngInjectTransform.js';

const annotatePlugin = () => ({
        name: 'esbuild-angularjs-annotate-plugin',
        setup(build) {
            build.onLoad({ filter: /\.(js|ts)$/ }, async (args) => {
                if (args.path.includes('/node_modules/')) {
                    return undefined;
                }

                const isTypescript = args.path.endsWith('.ts');
                const contents = await readFile(args.path, 'utf8');

                if (contents.includes('@ngInject') === false) {
                    return {
                        contents,
                        loader: isTypescript ? 'ts' : 'js',
                    };
                }
                const newContent = ngInjectTransform(contents, isTypescript);

                return {
                    contents: newContent,
                    loader: isTypescript ? 'ts' : 'js',
                };
            });
        },
    });

export default annotatePlugin;
