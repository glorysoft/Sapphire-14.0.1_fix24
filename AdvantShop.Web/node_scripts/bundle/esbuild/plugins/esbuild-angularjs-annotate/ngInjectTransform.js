import { parse } from '@babel/parser';
import { createRequire } from 'node:module';

import ngInjectTransformVisitor from './ngInjectTransform.visitor.js';

const require = createRequire(import.meta.url);

const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;

export const ngInjectTransform = (code, isTypescript) => {
    const ast = parse(code, {
        sourceType: 'module',
        plugins: isTypescript ? ['typescript'] : [],
    });

    traverse(ast, ngInjectTransformVisitor.visitor);

    const result = generate(ast, {
        retainLines: false,
        sourceMaps: false,
        concise: false,
    });

    return result.code;
};
