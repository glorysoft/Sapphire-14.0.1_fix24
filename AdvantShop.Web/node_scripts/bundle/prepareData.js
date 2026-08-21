import { projectsNames } from '../shopVariables.js';
import path from 'node:path';
import process from 'node:process';
import svgSpritePlugin from './esbuild/plugins/esbuild-svg-sprite-plugin/index.js';
import { getDirectories, projectsPathData } from '../shopPath.js';
import { glob } from 'glob';
import { existsSync } from 'node:fs';
import { getEnvParamsForConfig } from './buildHelpers.js';

export const getPrepareData = (getConfig) => {
    const getConfigListForStore = async () => {
        const project = projectsNames.store;
        const mapConfigs = new Map();
        //Store
        const envParams = await getEnvParamsForConfig(project);
        //StoreMobile
        const envParamsMobile = await getEnvParamsForConfig(project, path.resolve(process.cwd(), 'Areas', 'Mobile'));

        mapConfigs.set('store', { config: getConfig(envParams), env: envParams });
        mapConfigs.set('storeMobile', { config: getConfig(envParamsMobile), env: envParamsMobile });

        return mapConfigs;
    };
    const getConfigListForAdmin = async () => {
        const project = projectsNames.admin;
        const mapConfigs = new Map();
        //Admin
        const envParams = await getEnvParamsForConfig(project);
        //AdminV3
        const envParamsAdminV3 = await getEnvParamsForConfig(project, path.resolve(process.cwd(), 'Areas', 'Admin', 'Templates', 'AdminV3'));
        //AdminMobile
        const envParamsAdminMobile = await getEnvParamsForConfig(project, path.resolve(process.cwd(), 'Areas', 'Admin', 'Templates', 'Mobile'));

        mapConfigs.set('admin', { config: getConfig(envParams), env: envParams });
        mapConfigs.set('adminV3', { config: getConfig(envParamsAdminV3), env: envParamsAdminV3 });

        const adminMobileConfig = getConfig(envParamsAdminMobile);
        const spritemapName = `spritemap.${new Date().getTime()}.svg`;

        adminMobileConfig.plugins.push(
            svgSpritePlugin(
                {
                    dest: adminMobileConfig.outdir,
                    shape: {
                        id: {
                            generator: (filename) => `sprite-${  filename.replace('.svg', '')}`,
                        },
                    },
                    mode: {
                        symbol: {
                            bust: true,
                        },
                    },
                },
                spritemapName,
            ),
        );

        envParamsAdminMobile.spritemapName = spritemapName;

        mapConfigs.set('adminMobile', { config: adminMobileConfig, env: envParamsAdminMobile });

        return mapConfigs;
    };
    const getConfigListForFunnels = async () => {
        const project = projectsNames.funnels;
        const mapConfigs = new Map();

        const envParams = await getEnvParamsForConfig(project);

        mapConfigs.set('funnels', { config: getConfig(envParams), env: envParams });

        return mapConfigs;
    };
    const getConfigListForPartners = async () => {
        const project = projectsNames.partners;
        const mapConfigs = new Map();

        const envParams = await getEnvParamsForConfig(project);

        mapConfigs.set('partners', { config: getConfig(envParams), env: envParams });

        return mapConfigs;
    };
    const getConfigListForTemplates = async (templatesPath = '*') => {
        const mapConfigs = new Map();
        let _templatesPath = templatesPath;

        if (templatesPath === '*') {
            const templatesPathData = projectsPathData.get(projectsNames.templates);

            _templatesPath = await glob('*', {
                cwd: templatesPathData.getPhysicalPath(),
                onlyDirectories: true,
                absolute: true,
            });
        }

        let mapKey, envParams, envParamsMobile;
        for (const templatesPathItem of _templatesPath) {
            mapKey = `template ${  templatesPathItem.split(path.sep).at(-1)}`;
            // eslint-disable-next-line no-await-in-loop
            envParams = await getEnvParamsForConfig(projectsNames.templates, templatesPathItem);
            mapConfigs.set(mapKey, {
                config: getConfig(envParams),
                env: envParams,
            });
            if (existsSync(path.join(templatesPathItem, 'Areas', 'Mobile')) === true) {
                // eslint-disable-next-line no-await-in-loop
                envParamsMobile = await getEnvParamsForConfig(projectsNames.templates, path.join(templatesPathItem, 'Areas', 'Mobile'));
                mapConfigs.set(`${mapKey  } mobile`, {
                    config: getConfig(envParamsMobile),
                    env: envParamsMobile,
                });
            }
        }

        return mapConfigs;
    };
    const getConfigListForModules = async (modulesPath = '*', isDev = false) => {
        const mapConfigs = new Map();
        let _modulesPath = modulesPath;
        const modulesPathData = projectsPathData.get(projectsNames.modules);
        if (modulesPath === '*') {
            _modulesPath = await glob('*', {
                cwd: modulesPathData.getPhysicalPath(),
                onlyDirectories: true,
                absolute: true,
            });
        }

        let envParams;
        for (const modulesPathItem of _modulesPath) {
            if (existsSync(path.join(modulesPathItem, 'bundle_config')) === true) {
                // eslint-disable-next-line no-await-in-loop
                envParams = await getEnvParamsForConfig(projectsNames.modules, modulesPathItem);

                const additionInfoModules = {
                    sourceModulePath: null,
                    buildModulePath: modulesPathItem,
                };

                const targetModule = modulesPathItem.split(path.sep).at(-1);

                if (isDev) {
                    const sourceModulePath = path.resolve(modulesPathItem, modulesPathData.getRelativePathToRoot(), 'Modules');

                    additionInfoModules.targetModuleSource = getDirectories(sourceModulePath).find((module) => module.endsWith(`.${  targetModule}`));

                    additionInfoModules.sourceModulePath = path.resolve(sourceModulePath, additionInfoModules.targetModuleSource);

                    if (typeof additionInfoModules.targetModuleSource === 'undefined') {
                        process.stdout.write(
                            `WARN: Source for module by name "${additionInfoModules.targetModuleSource}" not found. Check xcopy in .csproj module\r\n`,
                        );
                    }
                }

                mapConfigs.set(`module ${  targetModule}`, {
                    config: getConfig(envParams),
                    env: envParams,
                    ...additionInfoModules,
                });
            }
        }

        return mapConfigs;
    };

    return {
        getConfigListForStore,
        getConfigListForAdmin,
        getConfigListForFunnels,
        getConfigListForPartners,
        getConfigListForTemplates,
        getConfigListForModules,
    };
};
