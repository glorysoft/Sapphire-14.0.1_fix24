import {getConfig as getBaseConfig} from './base.js';

export const getConfig = (env) => Object.assign(getBaseConfig({...env, mode: 'production'}), {
    minify: true,
});
