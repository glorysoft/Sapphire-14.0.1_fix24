import process from 'node:process';
import yargs from 'yargs';
import fs from 'fs';
import { execSync } from 'child_process';
import { getDirectories } from './shopPath.js';

const argv = yargs(process.argv)
    .scriptName('critical-css')
    .usage('$0 <cmd> [args]')
    .option('baseUrl', {
        alias: 'b',
        description: 'Base URI to site',
        type: 'string',
    })
    .option('templates-list', {
        alias: 'l',
        description: 'Templates list name for build',
        type: 'string',
        array: true,
    })
    .option('templates-all', {
        alias: 'a',
        description: 'Build all templates',
        type: 'boolean',
        default: false,
    })
    .option('screenshots', {
        alias: 's',
        description: 'Enable generate screenshot page',
        type: 'boolean',
        default: false,
    })
    .option('grab-font-face', {
        alias: 'g',
        description: 'Enable grab font-face css text',
        type: 'boolean',
        default: false,
    })
    .option('headless', {
        description: 'Headless mode',
        type: 'boolean',
        default: true,
    })
    .help()
    .alias('help', 'h')
    .parseSync();
const ignoreListTemplates = new Set(['.git']);

let __baseUrl: string = argv.baseUrl || 'http://localhost:8825/';

const { templatesList, templatesAll, screenshots, grabFontFace, headless } = argv;

if (__baseUrl[__baseUrl.length - 1] !== '/') {
    __baseUrl += '/';
}

let templatesNameList: string[];
if (templatesAll) {
    templatesNameList = getDirectories('Templates').reduce((prev: string[], current) => {
        if (!ignoreListTemplates.has(current)) {
            prev.push(current);
        }
        return prev;
    }, []);
} else if (templatesList) {
    if (templatesList[0] === '*') {
        templatesNameList = getDirectories('Templates').filter((x) => !x.startsWith('.'));
    } else {
        (templatesList as string[])
            .filter((current) => !ignoreListTemplates.has(current))
            .forEach((templateName) => fs.accessSync(`Templates/${templateName}/`));
        templatesNameList = templatesList as string[];
    }
} else {
    templatesNameList = ['_default'];
}

const errors: string[] = [];

// eslint-disable-next-line no-console
console.log(`Running generate critical css for ${templatesNameList.length} templates`);

for (const templateName of templatesNameList) {
    try {
        execSync(
            `tsx node_scripts/criticalcssProcess.ts -n ${templateName} -b ${__baseUrl} ${screenshots ? '-s' : ''} ${grabFontFace ? '-g' : ''} --headless=${headless.toString()}`,
            { stdio: ['ignore', 'inherit', 'pipe'] },
        );
    } catch (err) {
        errors.push(`Error in template: ${templateName}\n\r${(err as Error).stack}`);
    }
}

if (errors.length > 0) {
    process.exitCode = 1;
    // eslint-disable-next-line no-console
    console.error(`errors.length: ${errors.length}`);
    // eslint-disable-next-line no-console
    console.error(errors.join('\n\r'));
} else {
    // eslint-disable-next-line no-console
    console.log(`Success generate  critical css`);
}
