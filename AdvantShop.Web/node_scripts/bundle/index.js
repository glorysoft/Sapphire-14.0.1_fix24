import { projectsNames } from '../shopVariables.js';
import { getOptions } from './options.js';
import { setGitHooks } from '../githooks.js';
import { runWatch } from './esbuild/index.js';

import { getPrepareData } from './prepareData.js';

import { afterBuild } from './afterBuild.js';

import { installPackagesFromCustomPackageJson } from './buildHelpers.js';
import { compileStylesExternal } from './esbuild/postbuild/compileStylesExternal.js';
import * as esbuild from 'esbuild';
import esbuildWatchCallbackPlugin from './esbuild/plugins/esbuild-watch-callback-plugin/index.js';

setGitHooks();

const { mode, watch, templates, modules, cdnDesign, project } = await getOptions();

const { getConfig } = mode === 'dev' ? await import('./esbuild/dev.js') : await import('./esbuild/prod.js');

const {
    getConfigListForTemplates,
    getConfigListForStore,
    getConfigListForPartners,
    getConfigListForModules,
    getConfigListForFunnels,
    getConfigListForAdmin,
} = getPrepareData(getConfig);

// eslint-disable-next-line no-useless-assignment
let configList = new Map();

if (project === '*' || project === 'allWithoutModulesAndTemplates') {
    configList = new Map(
        [...(await getConfigListForStore())]
            .concat([...(await getConfigListForAdmin())])
            .concat([...(await getConfigListForFunnels())])
            .concat([...(await getConfigListForPartners())]),
    );

    if (project !== 'allWithoutModulesAndTemplates') {
        configList = new Map(
            [...configList].concat([...(await getConfigListForTemplates())]).concat([...(await getConfigListForModules('*', mode === 'dev'))]),
        );
    }
} else if ((typeof modules !== 'undefined' && modules !== null) || (typeof templates !== 'undefined' && templates !== null)) {
    let objForBuild = modules || templates;
    objForBuild = objForBuild === '*' || objForBuild[0] === '*' ? '*' : objForBuild;
    configList =
        project === projectsNames.templates
            ? await getConfigListForTemplates(objForBuild)
            : await getConfigListForModules(objForBuild, mode === 'dev');
} else {
    switch (project) {
        case projectsNames.store:
            configList = await getConfigListForStore();
            break;
        case projectsNames.admin:
            configList = await getConfigListForAdmin();
            break;
        case projectsNames.funnels:
            configList = await getConfigListForFunnels();
            break;
        case projectsNames.partners:
            configList = await getConfigListForPartners();
            break;
        default:
            throw new Error(`Unknown project "${project}" for bundle`);
    }
}

const watchData = new Map();

for (const [name, value] of configList) {
    if (value.env.project !== projectsNames.store) {
        installPackagesFromCustomPackageJson(value.env.directoryWork);
    }

    compileStylesExternal(value.env, watch, cdnDesign);

    if (watch) {
        value.config.plugins.push(
            esbuildWatchCallbackPlugin(name, async (bundleResult) => {
                await afterBuild(name, value.config, value.env, bundleResult, mode);
            }),
        );
        // eslint-disable-next-line no-await-in-loop
        const ctx = await esbuild.context(value.config);
        watchData.set(name, { ctx, value });
    } else {
        // eslint-disable-next-line no-console
        console.log(`[${new Date().toLocaleTimeString()}] Build start: ${name}`);
        // eslint-disable-next-line no-await-in-loop
        const bundleResult = await esbuild.build(value.config);
        // eslint-disable-next-line no-await-in-loop
        await afterBuild(name, value.config, value.env, bundleResult, mode);
        // eslint-disable-next-line no-console
        console.log(`[${new Date().toLocaleTimeString()}] Build complete: ${name}`);
    }
}

if (watch) {
    await runWatch(watchData);
} else {
    process.exit(0);
}
