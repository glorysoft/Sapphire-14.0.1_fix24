import { kebabCase } from './cases.js';

export const convertToDataAttrs = (obj) => Object.keys(obj).map((key) => `data-${  kebabCase(key)  }="${typeof obj[key] === 'string' ? `'${  obj[key]  }'` : obj[key]}"`);
