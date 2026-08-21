import { getConfig as getBaseConfig } from './base.js';
import { projectsNames } from '../../shopVariables.js';
export const getConfig = (env) => Object.assign(getBaseConfig({...env, mode: 'development'}), {
        sourcemap: env.project === projectsNames.templates ? 'inline' : 'linked',
    });
