import process from 'node:process';
import yargs from 'yargs';
import { projectsPathData, getDirname } from '../shopPath.js';
import { projectsNames } from '../shopVariables.js';
import { select, search } from '@inquirer/prompts';
import path from 'path';
import { readdir } from 'fs/promises';

const __dirname = getDirname(import.meta.url);

export const getOptions = async () => {
    const argv = yargs(process.argv)
        .scriptName('bundle')
        .usage('$0 <cmd> [args]')
        .option('mode', {
            alias: 'm',
            description: 'Bundle mode: development or production',
            type: 'string',
            choices: ['dev', 'prod'],
            default: 'prod',
        })
        .option('watch', {
            alias: 'w',
            description: 'Enable watch mode',
            type: 'boolean',
            default: false,
        })
        .option('templates', {
            alias: 'l',
            description: 'Templates list name for build',
            type: 'array',
        })
        .option('modules', {
            alias: 'c',
            description: 'Modules list name for build',
            type: 'array',
        })
        .option('profile', {
            alias: 'p',
            description: 'Generate json-stats file',
            type: 'boolean',
            default: false,
        })
        .option('cdnDesign', {
            alias: 'd',
            description: 'Rewrite url in css on cdn for design',
            type: 'boolean',
            default: false,
        })
        .option('silent', {
            alias: 's',
            description: 'Silent build without interactive',
            type: 'boolean',
            default: false,
        })
        .help()
        .alias('help', 'h').argv;

    const templatesPathData = projectsPathData.get(projectsNames.templates);
    const modulesPathData = projectsPathData.get(projectsNames.modules);
    const answers = {};

    if (argv.silent === false) {
        answers.project = await select({
            type: 'list',
            name: 'project',
            message: 'Что будем собирать?',
            default: 0,
            pageSize: 100,
            waitUserInput: false,
            choices: [
                { value: '*', name: 'Всё' },
                { value: 'allWithoutModulesAndTemplates', name: 'Всё, кроме модулей и шаблонов' },
                ...Array.from(projectsPathData.values()).map((x) => ({
                    value: x.getProjectName(),
                    name: x.getDisplayName(),
                })),
            ],
        });

        if (answers.project === projectsNames.templates) {
            const templatesList = await readdir(templatesPathData.getPhysicalPath(), {
                withFileTypes: true,
            });
            const templatesListNormalize = [
                {
                    name: 'Все',
                    value: '*',
                },
            ];

            for (const item of templatesList) {
                if (item.name.at(0) === '.') {
                    continue;
                }
                templatesListNormalize.push({
                    name: item.name,
                    value: item.parentPath + item.name,
                });
            }
            answers.templates = await search({
                message: 'Какие шаблоны?',
                source(term) {
                    return term
                        ? templatesListNormalize.filter((item) => item.name.toLowerCase().includes(term.toLowerCase()))
                        : templatesListNormalize;
                },
            });
        } else if (answers.project === projectsNames.modules) {
            const modulesList = await readdir(modulesPathData.getPhysicalPath(), {
                withFileTypes: true,
            });

            const modulesListNormalize = [{ name: 'Все', value: '*' }].concat(
                modulesList.map((item) => ({
                    name: item.name,
                    value: item.parentPath + item.name,
                })),
            );

            answers.modules = await search({
                message: 'Какие модули?',
                source(term) {
                    return term ? modulesListNormalize.filter((item) => item.name.toLowerCase().includes(term.toLowerCase())) : modulesListNormalize;
                },
            });
        }
    }

    // eslint-disable-next-line prefer-const
    let { templates, modules, ...options } = { ...argv, ...answers };

    templates = templates ? (Array.isArray(templates) || templates === '*' ? templates : [templates]) : null;
    modules = modules ? (Array.isArray(modules) || modules === '*' ? modules : [modules]) : null;

    if (Array.isArray(templates)) {
        templates = templates.map((x) => (/^[\w\d]+$/u.test(x) ? path.resolve(__dirname, '..', '..', 'Templates', x) : x));
    }

    if (Array.isArray(modules)) {
        modules = modules.map((x) => (/^[\w\d]+$/u.test(x) ? path.resolve(__dirname, '..', '..', 'Modules', x) : x));
    }

    return { templates, modules, ...options };
};
