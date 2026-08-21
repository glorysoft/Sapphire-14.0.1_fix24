import {parseArgs, type ParseArgsConfig} from 'node:util'
import {writeFile, mkdir, access} from 'node:fs/promises'
import path from 'node:path'
import {list as urlList} from '../criticalURLs'
import {IRequestInit, ICssBundleDto, UrlDestination, ICssBundlePathDto, IResponseCss} from './types';
import {existsSync} from 'node:fs';
import {getCss, init} from './run';
import {getDirectories, removeAllFiles} from '../shopPath'
import {installTemplate, getAuthorizeCookie} from './helpers';

const config: ParseArgsConfig = {
    strict: false,
    options: {
        baseUrl: {
            type: 'string',
            short: 'b'
        },
        list: {
            type: 'string',
            short: 'l',
            default: ''
        },
        api: {
            type: 'string',
            //default: 'https://yahont.advsrvone.pw/'
            default: 'http://localhost:8080/'
        }
    }
}

const {values} = parseArgs(config);

if (typeof values.baseUrl !== 'string') {
    throw new Error(`[${(new Date()).toLocaleTimeString()}] Yahont: invalid parameter "baseUrl"`)
}
const baseUrl = values.baseUrl + (values.baseUrl.endsWith('/') ? '' : '/');

if (['http://', 'https://'].every(x => !baseUrl.startsWith(x))) {
    throw new Error(`[${(new Date()).toLocaleTimeString()}] Yahont: parameter "baseUrl" must start "http" or "https"`)
}

if (typeof values.api !== 'string') {
    throw new Error(`[${(new Date()).toLocaleTimeString()}] Yahont: parameter "api" is required`)
}

const api = `${values.api + (values.api.endsWith('/') ? '' : '/')  }api/v2/css/`;
const adminCookie = await getAuthorizeCookie(baseUrl);
const bundles: ICssBundleDto[] = [];
let paths: ICssBundlePathDto[] = [];
for (const [name, urlsFromList] of urlList as Map<string, UrlDestination>) {
    if (typeof urlsFromList === 'string') {
        paths = [{
            path: urlsFromList
        }];
    } else if (Array.isArray(urlsFromList)) {
        for (const urlItem of urlsFromList) {
            if (typeof urlItem === 'string') {
                paths.push({
                    path: urlItem
                })
            } else {
                paths.push({
                    path: urlItem.url,
                    cookies: urlItem.admin ? adminCookie : undefined,
                    expectedStatusCode: urlItem.ignoreStatusCodeError ? 404 : undefined
                })
            }
        }
    } else if (typeof urlsFromList === 'object' && typeof urlsFromList.url === 'string') {
        paths = [{
            path: urlsFromList.url,
            cookies: urlsFromList.admin ? adminCookie : undefined,
            expectedStatusCode: urlsFromList.ignoreStatusCodeError ? 404 : undefined
        }];
    } else {
        throw new Error('Yahont: unknown type list urls')
    }
    bundles.push({
        name,
        paths
    })
}

async function folderCreateOrClean(directoryForCheck: string) {
    return access(directoryForCheck)
        .then(() => removeAllFiles(directoryForCheck))
        .catch(() => mkdir(directoryForCheck));
}

const start = async (name: string, api: string, requestDataItem: IRequestInit, pathToWrite: string) => {
    const responseResult = await init(api, requestDataItem);
    console.log(`[${(new Date()).toLocaleTimeString()}] Yahont (${name} version): taskId ${responseResult.taskId}`);
    const css = await getCss(name, responseResult.taskId, api, responseResult.averageWaitTimeMs);
    const folder = path.join(pathToWrite, '_criticalcss');
    await folderCreateOrClean(folder)
    for (const key in css.bundles) {
        await writeFile(path.join(folder, `${key}.critical.css`), css.bundles[key])
    }

    for (const errorItemKey in css.errors) {
        console.error(`[${(new Date()).toLocaleTimeString()}] Yahont (${name} version) - ${errorItemKey}: ${css.errors[errorItemKey].map(x => `${x.url} ${x.statusCode.toString()} ${x.message}`).join('\n\r')}`);
    }
    return css;
}

const list = values.list != null && typeof values.list === 'string' ? values.list.split(' ') : '';
const templatesName: string[] = [];

if (list.length === 0) {
    templatesName.push('')
} else if (list[0] === '*') {
    templatesName.push(...getDirectories('Templates').reduce<string[]>((prev, current) => {
        if (!current.startsWith('.')) {
            prev.push(current);
        }
        return prev;
    }, []));
} else {
    templatesName.push(...list)
}

console.log(`[${(new Date()).toLocaleTimeString()}] Yahont: start ${templatesName.length.toString()} items for ${baseUrl}`)
let dest: string;
let hasErrors = false;
const requestPromise: Promise<IResponseCss>[] = [];
let requestData: IRequestInit;
let requestDataMobile: IRequestInit;
let mobilePath: string;

for (const templatesNameItem of templatesName) {
    requestData = {
        baseUrl,
        bundles,
        options: [{
            width: 1300,
            height: 2000,
            additionalUrlParams: {
                debugmode: 'criticalcss'
            }
        }]
    }

    if (templatesNameItem !== '') {
        // eslint-disable-next-line no-await-in-loop
        await installTemplate(baseUrl, templatesNameItem, adminCookie);
        dest = path.join('Templates', templatesNameItem)
    } else {
        // eslint-disable-next-line no-await-in-loop
        await installTemplate(baseUrl, '_default', adminCookie);
        dest = '';
    }

    requestPromise.push(start(`${dest.length > 0 ? dest : 'Default'} - desktop`, api, requestData, dest))

    mobilePath = path.join(dest, 'Areas', 'Mobile')

    if (existsSync(mobilePath)) {
         requestDataMobile = {
            baseUrl,
            bundles,
            options: [{
                width: 478,
                height: 1000,
                device: `iPhone 13 Pro Max`,
                additionalUrlParams: {
                    debugmode: 'criticalcss'
                }
            }]
        }
        requestPromise.push(start(`${dest.length > 0 ? dest : 'Default'} - mobile`, api, requestDataMobile, mobilePath))
    }

    const [resultDesktop, resultMobile] = await Promise.all(requestPromise)

    if (hasErrors !== true) {
        hasErrors = Object.keys(resultDesktop.bundles).length < Object.keys(resultDesktop.errors).length || (typeof  resultMobile !== 'undefined' && Object.keys(resultMobile.bundles).length < Object.keys(resultMobile.errors).length);
    }

    requestPromise.length = 0;
}

if (hasErrors) {
    console.error(`[${(new Date()).toLocaleTimeString()}] Yahont: finish for ${baseUrl} with errors`)
    process.exit(1);
} else {
    console.log(`[${(new Date()).toLocaleTimeString()}] Yahont: finish for ${baseUrl}`)
    process.exit(0);
}

