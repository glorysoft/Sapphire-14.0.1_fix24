import process from 'node:process';
import { Cratocss } from './cratocss';
import fs from 'fs';
import path from 'path';
import yargs from 'yargs';
import { type CriticalURLEntry, list } from './criticalURLs';
import { getDirname, removeAllFiles } from './shopPath.js';
import { type Cookie, type BrowserContext, chromium } from 'playwright-core';

interface PathData {
    templateName: string | null;
    desktop: string;
    mobile: string;
    dist: { desktop: string; mobile: string };
    critical: { desktop: string; mobile: string };
}

const presetStyles = `.container-fluid{box-sizing:border-box;margin-right:auto;margin-left:auto;padding-right:.625rem;padding-left:.625rem}.row{box-sizing:border-box;display:flex;flex-direction:row;flex-wrap:wrap;margin-right:-0.625rem;margin-left:-0.625rem}.col-lg-offset-12,.col-lg-offset-11,.col-lg-offset-10,.col-lg-offset-9,.col-lg-offset-8,.col-lg-offset-7,.col-lg-offset-6,.col-lg-offset-5,.col-lg-offset-4,.col-lg-offset-3,.col-lg-offset-2,.col-lg-offset-1,.col-md-offset-12,.col-md-offset-11,.col-md-offset-10,.col-md-offset-9,.col-md-offset-8,.col-md-offset-7,.col-md-offset-6,.col-md-offset-5,.col-md-offset-4,.col-md-offset-3,.col-md-offset-2,.col-md-offset-1,.col-sm-offset-12,.col-sm-offset-11,.col-sm-offset-10,.col-sm-offset-9,.col-sm-offset-8,.col-sm-offset-7,.col-sm-offset-6,.col-sm-offset-5,.col-sm-offset-4,.col-sm-offset-3,.col-sm-offset-2,.col-sm-offset-1,.col-xs-offset-12,.col-xs-offset-11,.col-xs-offset-10,.col-xs-offset-9,.col-xs-offset-8,.col-xs-offset-7,.col-xs-offset-6,.col-xs-offset-5,.col-xs-offset-4,.col-xs-offset-3,.col-xs-offset-2,.col-xs-offset-1,.col-lg-12,.col-lg-11,.col-lg-10,.col-lg-9,.col-lg-8,.col-lg-7,.col-lg-6,.col-lg-5,.col-lg-4,.col-lg-3,.col-lg-2,.col-lg-1,.col-lg,.col-lg-slim,.col-md-12,.col-md-11,.col-md-10,.col-md-9,.col-md-8,.col-md-7,.col-md-6,.col-md-5,.col-md-4,.col-md-3,.col-md-2,.col-md-1,.col-md,.col-md-slim,.col-sm-12,.col-sm-11,.col-sm-10,.col-sm-9,.col-sm-8,.col-sm-7,.col-sm-6,.col-sm-5,.col-sm-4,.col-sm-3,.col-sm-2,.col-sm-1,.col-sm,.col-sm-slim,.col-xs-12,.col-xs-11,.col-xs-10,.col-xs-9,.col-xs-8,.col-xs-7,.col-xs-6,.col-xs-5,.col-xs-4,.col-xs-3,.col-xs-2,.col-xs-1,.col-xs,.col-xs-slim{box-sizing:border-box;flex-grow:0;flex-shrink:0;padding-right:.625rem;padding-left:.625rem}.col-xs{flex-grow:1;flex-basis:0;max-width:100%}.col-xs-slim{flex-shrink:0;flex-grow:0;flex-basis:auto;max-width:none}.col-xs-1{flex-basis:8.3333333333%;max-width:8.3333333333%}.col-xs-2{flex-basis:16.6666666667%;max-width:16.6666666667%}.col-xs-3{flex-basis:25%;max-width:25%}.col-xs-4{flex-basis:33.3333333333%;max-width:33.3333333333%}.col-xs-5{flex-basis:41.6666666667%;max-width:41.6666666667%}.col-xs-6{flex-basis:50%;max-width:50%}.col-xs-7{flex-basis:58.3333333333%;max-width:58.3333333333%}.col-xs-8{flex-basis:66.6666666667%;max-width:66.6666666667%}.col-xs-9{flex-basis:75%;max-width:75%}.col-xs-10{flex-basis:83.3333333333%;max-width:83.3333333333%}.col-xs-11{flex-basis:91.6666666667%;max-width:91.6666666667%}.col-xs-12{flex-basis:100%;max-width:100%}@media screen and (min-width: 48em){.col-sm{flex-grow:1;flex-basis:0;max-width:100%}.col-sm-slim{flex-shrink:0;flex-grow:0;flex-basis:auto;max-width:none}.col-sm-1{flex-basis:8.3333333333%;max-width:8.3333333333%}.col-sm-2{flex-basis:16.6666666667%;max-width:16.6666666667%}.col-sm-3{flex-basis:25%;max-width:25%}.col-sm-4{flex-basis:33.3333333333%;max-width:33.3333333333%}.col-sm-5{flex-basis:41.6666666667%;max-width:41.6666666667%}.col-sm-6{flex-basis:50%;max-width:50%}.col-sm-7{flex-basis:58.3333333333%;max-width:58.3333333333%}.col-sm-8{flex-basis:66.6666666667%;max-width:66.6666666667%}.col-sm-9{flex-basis:75%;max-width:75%}.col-sm-10{flex-basis:83.3333333333%;max-width:83.3333333333%}.col-sm-11{flex-basis:91.6666666667%;max-width:91.6666666667%}.col-sm-12{flex-basis:100%;max-width:100%}}@media screen and (min-width: 62em){.col-md{flex-grow:1;flex-basis:0;max-width:100%}.col-md-slim{flex-shrink:0;flex-grow:0;flex-basis:auto;max-width:none}.col-md-1{flex-basis:8.3333333333%;max-width:8.3333333333%}.col-md-2{flex-basis:16.6666666667%;max-width:16.6666666667%}.col-md-3{flex-basis:25%;max-width:25%}.col-md-4{flex-basis:33.3333333333%;max-width:33.3333333333%}.col-md-5{flex-basis:41.6666666667%;max-width:41.6666666667%}.col-md-6{flex-basis:50%;max-width:50%}.col-md-7{flex-basis:58.3333333333%;max-width:58.3333333333%}.col-md-8{flex-basis:66.6666666667%;max-width:66.6666666667%}.col-md-9{flex-basis:75%;max-width:75%}.col-md-10{flex-basis:83.3333333333%;max-width:83.3333333333%}.col-md-11{flex-basis:91.6666666667%;max-width:91.6666666667%}.col-md-12{flex-basis:100%;max-width:100%}}@media screen and (min-width: 75em){.col-lg{flex-grow:1;flex-basis:0;max-width:100%}.col-lg-slim{flex-shrink:0;flex-grow:0;flex-basis:auto;max-width:none}.col-lg-1{flex-basis:8.3333333333%;max-width:8.3333333333%}.col-lg-2{flex-basis:16.6666666667%;max-width:16.6666666667%}.col-lg-3{flex-basis:25%;max-width:25%}.col-lg-4{flex-basis:33.3333333333%;max-width:33.3333333333%}.col-lg-5{flex-basis:41.6666666667%;max-width:41.6666666667%}.col-lg-6{flex-basis:50%;max-width:50%}.col-lg-7{flex-basis:58.3333333333%;max-width:58.3333333333%}.col-lg-8{flex-basis:66.6666666667%;max-width:66.6666666667%}.col-lg-9{flex-basis:75%;max-width:75%}.col-lg-10{flex-basis:83.3333333333%;max-width:83.3333333333%}.col-lg-11{flex-basis:91.6666666667%;max-width:91.6666666667%}.col-lg-12{flex-basis:100%;max-width:100%}}.col-xs-offset-1{margin-left:8.3333333333%}.col-xs-offset-2{margin-left:16.6666666667%}.col-xs-offset-3{margin-left:25%}.col-xs-offset-4{margin-left:33.3333333333%}.col-xs-offset-5{margin-left:41.6666666667%}.col-xs-offset-6{margin-left:50%}.col-xs-offset-7{margin-left:58.3333333333%}.col-xs-offset-8{margin-left:66.6666666667%}.col-xs-offset-9{margin-left:75%}.col-xs-offset-10{margin-left:83.3333333333%}.col-xs-offset-11{margin-left:91.6666666667%}.col-xs-offset-12{margin-left:100%}@media screen and (min-width: 48em){.col-sm-offset-1{margin-left:8.3333333333%}.col-sm-offset-2{margin-left:16.6666666667%}.col-sm-offset-3{margin-left:25%}.col-sm-offset-4{margin-left:33.3333333333%}.col-sm-offset-5{margin-left:41.6666666667%}.col-sm-offset-6{margin-left:50%}.col-sm-offset-7{margin-left:58.3333333333%}.col-sm-offset-8{margin-left:66.6666666667%}.col-sm-offset-9{margin-left:75%}.col-sm-offset-10{margin-left:83.3333333333%}.col-sm-offset-11{margin-left:91.6666666667%}.col-sm-offset-12{margin-left:100%}}@media screen and (min-width: 62em){.col-md-offset-1{margin-left:8.3333333333%}.col-md-offset-2{margin-left:16.6666666667%}.col-md-offset-3{margin-left:25%}.col-md-offset-4{margin-left:33.3333333333%}.col-md-offset-5{margin-left:41.6666666667%}.col-md-offset-6{margin-left:50%}.col-md-offset-7{margin-left:58.3333333333%}.col-md-offset-8{margin-left:66.6666666667%}.col-md-offset-9{margin-left:75%}.col-md-offset-10{margin-left:83.3333333333%}.col-md-offset-11{margin-left:91.6666666667%}.col-md-offset-12{margin-left:100%}}@media screen and (min-width: 75em){.col-lg-offset-1{margin-left:8.3333333333%}.col-lg-offset-2{margin-left:16.6666666667%}.col-lg-offset-3{margin-left:25%}.col-lg-offset-4{margin-left:33.3333333333%}.col-lg-offset-5{margin-left:41.6666666667%}.col-lg-offset-6{margin-left:50%}.col-lg-offset-7{margin-left:58.3333333333%}.col-lg-offset-8{margin-left:66.6666666667%}.col-lg-offset-9{margin-left:75%}.col-lg-offset-10{margin-left:83.3333333333%}.col-lg-offset-11{margin-left:91.6666666667%}.col-lg-offset-12{margin-left:100%}}.start-xs{justify-content:flex-start}@media screen and (min-width: 48em){.start-sm{justify-content:flex-start}}@media screen and (min-width: 62em){.start-md{justify-content:flex-start}}@media screen and (min-width: 75em){.start-lg{justify-content:flex-start}}.center-xs{justify-content:center}@media screen and (min-width: 48em){.center-sm{justify-content:center}}@media screen and (min-width: 62em){.center-md{justify-content:center}}@media screen and (min-width: 75em){.center-lg{justify-content:center}}.end-xs{justify-content:flex-end}@media screen and (min-width: 48em){.end-sm{justify-content:flex-end}}@media screen and (min-width: 62em){.end-md{justify-content:flex-end}}@media screen and (min-width: 75em){.end-lg{justify-content:flex-end}}.top-xs{align-items:flex-start}@media screen and (min-width: 48em){.top-sm{align-items:flex-start}}@media screen and (min-width: 62em){.top-md{align-items:flex-start}}@media screen and (min-width: 75em){.top-lg{align-items:flex-start}}.middle-xs{align-items:center}@media screen and (min-width: 48em){.middle-sm{align-items:center}}@media screen and (min-width: 62em){.middle-md{align-items:center}}@media screen and (min-width: 75em){.middle-lg{align-items:center}}.baseline-xs{align-items:baseline}@media screen and (min-width: 48em){.baseline-sm{align-items:baseline}}@media screen and (min-width: 62em){.baseline-md{align-items:baseline}}@media screen and (min-width: 75em){.baseline-lg{align-items:baseline}}.bottom-xs{align-items:flex-end}@media screen and (min-width: 48em){.bottom-sm{align-items:flex-end}}@media screen and (min-width: 62em){.bottom-md{align-items:flex-end}}@media screen and (min-width: 75em){.bottom-lg{align-items:flex-end}}.around-xs{justify-content:space-around}@media screen and (min-width: 48em){.around-sm{justify-content:space-around}}@media screen and (min-width: 62em){.around-md{justify-content:space-around}}@media screen and (min-width: 75em){.around-lg{justify-content:space-around}}.between-xs{justify-content:space-between}@media screen and (min-width: 48em){.between-sm{justify-content:space-between}}@media screen and (min-width: 62em){.between-md{justify-content:space-between}}@media screen and (min-width: 75em){.between-lg{justify-content:space-between}}.first-xs{order:-1}@media screen and (min-width: 48em){.first-sm{order:-1}}@media screen and (min-width: 62em){.first-md{order:-1}}@media screen and (min-width: 75em){.first-lg{order:-1}}.last-xs{order:1}@media screen and (min-width: 48em){.last-sm{order:1}}@media screen and (min-width: 62em){.last-md{order:1}}@media screen and (min-width: 75em){.last-lg{order:1}}.reverse-xs{flex-direction:row-reverse}@media screen and (min-width: 48em){.reverse-sm{flex-direction:row-reverse}}@media screen and (min-width: 62em){.reverse-md{flex-direction:row-reverse}}@media screen and (min-width: 75em){.reverse-lg{flex-direction:row-reverse}}.clear-gap-xs{padding-left:0;padding-right:0}@media screen and (min-width: 48em){.clear-gap-sm{padding-left:0;padding-right:0}}@media screen and (min-width: 62em){.clear-gap-md{padding-left:0;padding-right:0}}@media screen and (min-width: 75em){.clear-gap-lg{padding-left:0;padding-right:0}}.clear-gap-left-xs{padding-left:0}@media screen and (min-width: 48em){.clear-gap-left-sm{padding-left:0}}@media screen and (min-width: 62em){.clear-gap-left-md{padding-left:0}}@media screen and (min-width: 75em){.clear-gap-left-lg{padding-left:0}}.clear-gap-right-xs{padding-right:0}@media screen and (min-width: 48em){.clear-gap-right-sm{padding-right:0}}@media screen and (min-width: 62em){.clear-gap-right-md{padding-right:0}}@media screen and (min-width: 75em){.clear-gap-right-lg{padding-right:0}}.gap-xs{padding-left:.625rem;padding-right:.625rem}@media screen and (min-width: 48em){.gap-sm{padding-left:.625rem;padding-right:.625rem}}@media screen and (min-width: 62em){.gap-md{padding-left:.625rem;padding-right:.625rem}}@media screen and (min-width: 75em){.gap-lg{padding-left:.625rem;padding-right:.625rem}}.nowrap-xs{flex-wrap:nowrap}@media screen and (min-width: 48em){.nowrap-sm{flex-wrap:nowrap}}@media screen and (min-width: 62em){.nowrap-md{flex-wrap:nowrap}}@media screen and (min-width: 75em){.nowrap-lg{flex-wrap:nowrap}}.wrap-xs{flex-wrap:wrap}@media screen and (min-width: 48em){.wrap-sm{flex-wrap:wrap}}@media screen and (min-width: 62em){.wrap-md{flex-wrap:wrap}}@media screen and (min-width: 75em){.wrap-lg{flex-wrap:wrap}}.g-xs{gap:5px}.g-sm{gap:10px}.g-md{gap:15px}.g-lg{gap:20px}.row-gap-xs{row-gap:5px}.row-gap-sm{row-gap:10px}.row-gap-md{row-gap:15px}.row-gap-lg{row-gap:20px}.col-p-v{padding-top:.6rem;padding-bottom:.6rem}.container-fluid{padding-right:.625rem;padding-left:.625rem}.visibility-hidden{visibility: hidden;}.carousel-placeholder{max-height: 1px;max-width: 1px;}`;

const _listURLs = new Map<string, CriticalURLEntry>(list);
const fsPromises = fs.promises;
const DEFAULT_TEMPLATE = '_default';
const __dirname = getDirname(import.meta.url);
const argv = yargs(process.argv)
    .scriptName('critical-css')
    .usage('$0 <cmd> [args]')
    .option('baseUrl', {
        alias: 'b',
        description: 'Base URI to site',
        type: 'string',
    })
    .option('template-name', {
        alias: 'n',
        description: 'Template name',
        type: 'string',
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

let __baseUrl: string = argv.baseUrl || 'http://localhost:8825/';
const { templateName, screenshots, grabFontFace, headless } = argv;
if (__baseUrl[__baseUrl.length - 1] !== '/') {
    __baseUrl += '/';
}

let attempt = 0;

function onUncaughtException(error: Error): void {
    if (attempt === 3) {
        process.exitCode = 1;
    } else {
        // eslint-disable-next-line no-console
        console.log(`uncaughtException in ${templateName || 'default'} template`);
        // eslint-disable-next-line no-console
        console.log(error.stack);
        attempt += 1;
        // eslint-disable-next-line no-console
        console.log(`attempt ${attempt} for ${templateName || 'default'} template`);
        void (async () => {
            await go(new Map(_listURLs));
        })();
    }
}

let cookiesAdmin: Cookie[];
try {
    cookiesAdmin = await runInBrowser(getAuthorizeCookie);
} catch (error) {
    // eslint-disable-next-line no-console
    console.error(`criticalcssProcess: не удалось авторизоваться в админке по адресу ${__baseUrl}adminv2/login`);
    // eslint-disable-next-line no-console
    console.error(error instanceof Error ? error.stack : error);
    process.exit(1);
}

// Обработчик ставим только после инициализации cookiesAdmin: ретрай через go()
// обращается к ней, и при регистрации раньше ошибка авторизации маскируется
// ReferenceError'ом из-за TDZ.
process.on('uncaughtException', onUncaughtException);

const listNormalize = processData(_listURLs);
await go(listNormalize);

type RunInBrowserCallbackFunction<TResult> = (browserContext: BrowserContext) => Promise<TResult>;
async function runInBrowser<TResult>(func: RunInBrowserCallbackFunction<TResult>): Promise<TResult> {
    const browser = await chromium.launch({
        headless,
    });
    const context = await browser.newContext();

    try {
        return await func(context);
    } finally {
        await browser.close();
    }
}

async function getAuthorizeCookie(browserContext: BrowserContext): Promise<Cookie[]> {
    const page = await browserContext.newPage();
    browserContext.setDefaultTimeout(90000);

    const urlObj = new URL(`${__baseUrl}adminv2/login`);

    await page.goto(urlObj.toString());

    await page.getByPlaceholder('Логин').fill('admin');
    await page.getByPlaceholder('Пароль').fill('123123');
    await page.getByRole('button').click();

    return browserContext.cookies();
}

function processData(listURLs: Map<string, CriticalURLEntry>): [string, CriticalURLEntry][] {
    function searchParamsAppend(urlList: string[]): string[] {
        return urlList.map((urlItem) => {
            const url = new URL(urlItem, __baseUrl);
            url.searchParams.append(`debugmode`, `criticalcss`);
            //depricated code for 10 version
            url.searchParams.append(`excludeCriticalCSS`, `true`);
            return url.href;
        });
    }

    let name: string, data: CriticalURLEntry;
    return Array.from(listURLs).map((listURLsItem) => {
        [name, data] = listURLsItem;
        if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
            const dataObj = data as Record<string, unknown>;
            if (dataObj.admin === true) {
                dataObj.cookies = cookiesAdmin;
            }
            dataObj.url = searchParamsAppend(Array.isArray(dataObj.url) ? (dataObj.url as string[]) : [dataObj.url as string]);
        } else if (Array.isArray(data)) {
            data = searchParamsAppend(data);
        } else if (typeof data === 'string') {
            data = searchParamsAppend([data]);
        }

        return [name, data];
    });
}

async function go(listURLs: Map<string, CriticalURLEntry> | [string, CriticalURLEntry][]): Promise<void> {
    try {
        await iteration(templateName != null && templateName !== DEFAULT_TEMPLATE ? templateName : null, listURLs as [string, CriticalURLEntry][]);
        // eslint-disable-next-line no-console
        console.log(`Finish ${templateName || 'default'} template`);
    } catch (err) {
        let errorText: string;

        if (err instanceof Error) {
            errorText = `${err.message}\n\r${err.stack ?? ''}`;
        } else if (typeof err === 'string') {
            errorText = err;
        } else {
            const errObj = err as Record<string, unknown>;
            errorText = Object.keys(errObj)
                .filter((key) => typeof errObj[key] !== 'undefined')
                .map((key) => `${key}: ${String(errObj[key])}`)
                .join(`\n\r`);
        }

        // eslint-disable-next-line no-console
        console.error(`Finish with error`);
        // eslint-disable-next-line no-console
        console.error(errorText);
        process.exitCode = 1;
    }
}

async function iteration(name: string | null, listURLs: [string, CriticalURLEntry][]): Promise<void> {
    const templateIdWithDefault = name ?? '_default';

    await installTemplate(templateIdWithDefault, cookiesAdmin);

    await assertIsInstallTemplate(templateIdWithDefault);

    const pathData = getPathData(name);

    checkMode(pathData)
        .then((isProduction) => {
            if (!isProduction) {
                // eslint-disable-next-line prefer-promise-reject-errors
                return Promise.reject({
                    templateName: pathData.templateName,
                    version: 'desktop',
                    error: 'Для генерации критических стилей необходимо, чтобы проект был собран в режиме продакшена',
                });
            }

            return true;
        })
        .then(() => folderCreateOrClean(pathData.critical.desktop))
        .then(() =>
            fsPromises
                .access(pathData.mobile)
                .then(() => folderCreateOrClean(pathData.critical.mobile))
                .catch(() => {
                    /*ignore*/
                }),
        )
        .then(() => generate(pathData, listURLs));
}

export async function installTemplate(templateId: string, cookies: Cookie[]): Promise<void> {
    const response = await fetch(`${__baseUrl}tools/dev/SetTemplate.ashx?templateId=${templateId}`);

    const responseText = await response.text();
    if (response.ok && responseText === 'ok') {
        return;
    }

    // Если не получилось поменять через тулзу пойдем по старинке

    const urlObj = new URL(`${__baseUrl}adminv3/design/ApplyTemplate`);

    urlObj.searchParams.append('templateId', templateId);

    const browser = await chromium.launch({
        headless,
    });

    const context = await browser.newContext();
    context.setDefaultTimeout(90000);

    await context.addCookies(cookies);
    const page = await context.newPage();
    await page.goto(urlObj.toString());

    await browser.close();
}

export async function assertIsInstallTemplate(templateId: string): Promise<void> {
    const browser = await chromium.launch({ headless });

    const context = await browser.newContext();
    context.setDefaultTimeout(90000);

    const page = await context.newPage();

    const response = await page.goto(__baseUrl);

    try {
        if (response == null) {
            throw new Error('criticalcssProcess(checkIsInstallTemplate): response is null');
        }

        if (!response.ok()) {
            throw new Error('criticalcssProcess(checkIsInstallTemplate): page not working');
        }

        const body = (await response.body()).toString();

        if (!body.includes(`<meta name="advtpl" content="${templateId.toLowerCase()}">`)) {
            throw new Error(`criticalcssProcess(checkIsInstallTemplate): template not applied "${templateId}"`);
        }
    } finally {
        await browser.close();
    }
}

function getPathData(tplName: string | null | undefined): PathData {
    const templatePath = typeof tplName !== 'undefined' && tplName !== null ? `Templates/${tplName}/` : '';

    return {
        templateName: tplName ?? null,
        desktop: path.resolve(__dirname, `../${templatePath}/`),
        mobile: path.resolve(__dirname, `../${templatePath}Areas/Mobile/`),
        dist: {
            desktop: path.resolve(__dirname, `../${templatePath}dist/`),
            mobile: path.resolve(__dirname, `../${templatePath}Areas/Mobile/dist/`),
        },
        critical: {
            desktop: path.resolve(__dirname, `../${templatePath}_criticalcss/`),
            mobile: path.resolve(__dirname, `../${templatePath}Areas/Mobile/_criticalcss/`),
        },
    };
}

async function checkMode(pathData: PathData): Promise<boolean> {
    const bundlePath = path.resolve(pathData.dist.desktop, `bundles.json`);
    try {
        await fsPromises.access(bundlePath);
        const { mode } = JSON.parse(await fsPromises.readFile(bundlePath, 'utf-8'));
        return mode === `production`;
    } catch (_e) {
        //старый шаблон
        return true;
    }
}

async function folderCreateOrClean(directoryForCheck: string): Promise<void> {
    try {
        await fsPromises.access(directoryForCheck);
        await removeAllFiles(directoryForCheck);
    } catch {
        await fsPromises.mkdir(directoryForCheck);
    }
    return undefined;
}

async function generate(pathData: PathData, listURLs: [string, CriticalURLEntry][]): Promise<void> {
    const isExistMobile = fs.existsSync(pathData.mobile);

    const options = {
        width: 1920,
        height: 2000,
        output: pathData.critical.desktop,
        baseURL: __baseUrl,
        screenshots,
        grabFontFace,
        presetStyles,
        browserOptions: {
            headless,
        },
    };

    try {
        const cratocss = new Cratocss(options);

        await cratocss.generate(listURLs);

        if (isExistMobile) {
            const optionsMobile = {
                output: pathData.critical.mobile,
                baseURL: __baseUrl,
                screenshots,
                grabFontFace,
                width: 478,
                height: 1000,
                device: `iPhone 13 Pro Max`,
                presetStyles,
                browserOptions: {
                    headless,
                },
            };
            const cratocssMobile = new Cratocss(optionsMobile);

            await cratocssMobile.generate(listURLs);
        }
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error((error as Error).message);
        process.exit(1);
    }
}
