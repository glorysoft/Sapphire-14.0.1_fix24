import process from 'node:process';
import { mkdir, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { type BrowserContext, chromium, type Cookie, devices, type JSHandle, type Page } from 'playwright-core';
import postcss from 'postcss';
import postcssUrl from 'postcss-url';
import postcssDiscard, { type PostcssDiscardOptions } from 'postcss-discard';
import { minify } from 'csso';
import { processCSS } from './cratocss.helpers';

interface CratocssOptions {
    baseURL: string;
    output?: string;
    filename?: string;
    device?: string;
    width?: number;
    height?: number;
    grabFontFace?: boolean;
    screenshots?: boolean;
    parallelStreamsCount?: number;
    discardOptions?: PostcssDiscardOptions;
    cssUrlOptions?: postcssUrl.Options;
    presetStyles?: string;
    browserOptions?: { headless?: boolean };
}

interface CSSRuleData {
    cssText: string;
    selectorText: string;
}

interface CSSMediaRuleData {
    conditionText: string;
    rulesMedia: CSSRuleData[];
}

type CSSRuleItem = CSSRuleData | CSSMediaRuleData;

interface ProcessItemGrabResult {
    css: string;
    errors: string;
}

interface PreparedPageData {
    url: string[];
    context?: BrowserContext;
}

interface UrlListObject {
    url?: string | string[];
    cookies?: Cookie[];
    ignoreStatusCodeError?: boolean;

    [key: string]: unknown;
}

class Cratocss {
    baseURLRaw: string;
    baseURL: URL;
    output: string | undefined;
    filename: string;
    device: string | undefined;
    width: number | undefined;
    height: number | undefined;
    grabFontFace: boolean;
    screenshots: boolean;
    parallelStreamsCount: number;
    discardOptions: PostcssDiscardOptions | undefined;
    cssUrlOptions: postcssUrl.Options | undefined;
    timeout: number;
    cacheCSSRules: Map<string, CSSRuleItem[]>;
    presetStyles: string | undefined;
    browserOptions: { headless?: boolean };

    constructor(options: CratocssOptions) {
        if (typeof options.baseURL === 'undefined') {
            throw Error(`Option "baseURL" is required`);
        }
        this.baseURLRaw = options.baseURL;
        this.baseURL = new URL(options.baseURL);
        this.output = options.output;
        this.filename = options.filename || `[name].critical.css`;
        this.device = options.device;
        this.width = options.width;
        this.height = options.height;
        this.grabFontFace = options.grabFontFace || false;
        this.screenshots = options.screenshots || false;
        this.parallelStreamsCount = options.parallelStreamsCount || 3;
        this.discardOptions = options.discardOptions || {
            //atrule: ['@font-face', /print/],
            decl: [
                /(?<prefix>.*)transition(?<postfix>.*)/u,
                'cursor',
                'pointer-events',
                /(?<vendor>-webkit-)?tap-highlight-color/u,
                /(?<vendor>.*)user-select/u,
            ],
        };
        this.cssUrlOptions = options.cssUrlOptions;
        this.timeout = 60000;
        this.cacheCSSRules = new Map();
        this.presetStyles = options.presetStyles;
        this.browserOptions = options.browserOptions ?? {
            headless: true,
        };
    }

    /**
     * Generate file name critical css
     */
    #getFilenameCriticalCSS(name: string): string {
        return this.filename.replace(`[name]`, name);
    }

    /**
     * Return list visible elements
     */
    async getElementsVisible(page: Page): Promise<JSHandle> {
        return await page.evaluateHandle(
            () =>
                new Promise((resolve) => {
                    const resultEvaluate: Element[] = [];
                    const elements = Array.from(document.querySelectorAll(`html, body, body *:not(link):not(style):not(script)`));

                    let boundingBox: DOMRect;

                    for (const el of elements) {
                        boundingBox = el.getBoundingClientRect();
                        if (boundingBox.height === 0 || boundingBox.width === 0) {
                            if ((el as HTMLElement).style.getPropertyValue('display') === 'none') {
                                (el as HTMLElement).style.setProperty('display', 'initial', 'important');
                            }
                            if (['hidden', 'collapse'].some((item) => (el as HTMLElement).style.getPropertyValue('visibility') === item)) {
                                (el as HTMLElement).style.setProperty('visibility', 'visible', 'important');
                            }
                            boundingBox = el.getBoundingClientRect();
                        }

                        if (boundingBox.y <= window.innerHeight) {
                            resultEvaluate.push(el);
                        }
                    }

                    resolve(resultEvaluate);
                }),
        );
    }

    async getCSSData(page: Page): Promise<{ linksHref: string[]; rules: CSSRuleItem[] }> {
        const result = await page.evaluate(
            ({ cacheFilesNameCSS, grabFontFace }: { cacheFilesNameCSS: string[]; grabFontFace: boolean }) => {
                const siteHostname = window.location.hostname;
                const styleSheetsList = document.styleSheets;
                let data: Record<string, CSSRuleItem[]> | null = null;
                //правильный порядок link
                const linksHref: string[] = [];
                let rules;

                // eslint-disable-next-line guard-for-in
                for (const index in styleSheetsList) {
                    const { href } = styleSheetsList[index];
                    if (typeof href !== 'undefined' && href !== null && siteHostname === new URL(href).hostname) {
                        linksHref.push(href);
                        if (!cacheFilesNameCSS.includes(href)) {
                            rules = Array.from(styleSheetsList[index].cssRules || styleSheetsList[index].rules);
                            data ||= {};
                            data[href] = rules.reduce((prev: CSSRuleItem[], current: CSSStyleRule) => {
                                if (current instanceof CSSMediaRule) {
                                    prev.push({
                                        conditionText: current.conditionText,
                                        rulesMedia: Array.from(current.cssRules).map((subItem) => ({
                                            cssText: subItem.cssText,
                                            selectorText: (subItem as CSSStyleRule).selectorText,
                                        })),
                                    });
                                } else if (
                                    typeof (current as CSSStyleRule).selectorText !== 'undefined' &&
                                    (current as CSSStyleRule).selectorText !== null
                                ) {
                                    prev.push({
                                        cssText: current.cssText,
                                        selectorText: (current as CSSStyleRule).selectorText,
                                    });
                                } else if (grabFontFace && current.constructor.name === 'CSSFontFaceRule') {
                                    prev.push({ cssText: current.cssText, selectorText: 'html' });
                                }

                                return prev;
                            }, []);
                        }
                    }
                }
                return { data, linksHref };
            },
            { cacheFilesNameCSS: Array.from(this.cacheCSSRules.keys()), grabFontFace: this.grabFontFace },
        );

        if (result.data !== null) {
            const postcssPlugins: postcss.Plugin[] = [];
            let postcssObj: postcss.Processor;
            const listPromises: Promise<CSSRuleItem>[] = [];
            let _cssUrlOptionsNew: postcssUrl.Options;

            for (const href of result.linksHref) {
                if (typeof result.data[href] !== 'undefined') {
                    if (this.discardOptions || this.cssUrlOptions) {
                        // eslint-disable-next-line max-depth
                        if (this.discardOptions) {
                            postcssPlugins.push(postcssDiscard(this.discardOptions) as postcss.Plugin);
                        }

                        // eslint-disable-next-line max-depth
                        if (this.cssUrlOptions) {
                            _cssUrlOptionsNew = { ...this.cssUrlOptions };
                        } else {
                            _cssUrlOptionsNew = {
                                // eslint-disable-next-line no-warning-comments
                                //todo: move logic in criticalProcess
                                //Проблема: не получается передать параметр "href"
                                url: (asset) => {
                                    let newUrl: string;

                                    if (typeof asset.pathname !== 'undefined' && asset.pathname !== null) {
                                        const rootPath = href.toLowerCase().replace(this.baseURLRaw.toLowerCase(), '');
                                        const indexStart = rootPath.lastIndexOf('/');
                                        const start = rootPath.substring(0, indexStart);
                                        newUrl = path.join(start, asset.url).replace(/\\/gu, '/');
                                    } else {
                                        newUrl = asset.url;
                                    }

                                    return newUrl;
                                },
                            };
                        }

                        postcssPlugins.push(postcssUrl(_cssUrlOptionsNew) as postcss.Plugin);

                        postcssObj = postcss(postcssPlugins);

                        // eslint-disable-next-line max-depth
                        for (const item of result.data[href]) {
                            // eslint-disable-next-line max-depth
                            if ('rulesMedia' in item && typeof item.rulesMedia !== 'undefined' && item.rulesMedia !== null) {
                                listPromises.push(
                                    Promise.all(
                                        item.rulesMedia.map(
                                            // eslint-disable-next-line no-loop-func
                                            (x) =>
                                                new Promise<CSSRuleData>((resolve, reject) => {
                                                    postcssObj
                                                        .process(x.cssText, { from: undefined })
                                                        .then(({ css }) =>
                                                            resolve({
                                                                selectorText: x.selectorText,
                                                                cssText: css,
                                                            }),
                                                        )
                                                        .catch((err: unknown) => {
                                                            // eslint-disable-next-line no-console
                                                            console.error(err);
                                                            reject(err);
                                                        });
                                                }),
                                        ),
                                    )
                                        .then((data) => ({
                                            conditionText: (item as CSSMediaRuleData).conditionText,
                                            rulesMedia: data,
                                        }))
                                        .catch((err: unknown) => {
                                            // eslint-disable-next-line no-console
                                            console.error(err);
                                            return Promise.reject(err);
                                        }),
                                );
                            } else {
                                const ruleItem = item as CSSRuleData;
                                listPromises.push(
                                    // eslint-disable-next-line no-loop-func
                                    new Promise<CSSRuleData>((resolve, reject) => {
                                        postcssObj
                                            .process(ruleItem.cssText, { from: undefined })
                                            .then(({ css }) => {
                                                resolve({ selectorText: ruleItem.selectorText, cssText: css });
                                            })
                                            .catch((err: unknown) => {
                                                // eslint-disable-next-line no-console
                                                console.error(err);
                                                reject(err);
                                            });
                                    }),
                                );
                            }
                        }

                        // eslint-disable-next-line no-await-in-loop
                        result.data[href] = await Promise.all(listPromises);

                        this.cacheCSSRules.set(href, result.data[href]);
                    }

                    postcssPlugins.length = 0;
                    listPromises.length = 0;
                }
            }
        }

        return {
            linksHref: result.linksHref,
            rules: result.linksHref.map((linksHrefItem) => this.cacheCSSRules.get(linksHrefItem)).flat() as CSSRuleItem[],
        };
    }

    /**
     * Main method for generate CSS files critical css
     */
    async generate(data: [string, string | string[] | UrlListObject][]): Promise<void> {
        const browser = await chromium.launch(this.browserOptions);
        let contextOptions: Record<string, unknown> = {};
        let deviceData: (typeof devices)[number];
        let viewport: { width: number; height: number } | null = null;

        if (
            (typeof this.width !== 'undefined' && typeof this.height === 'undefined') ||
            (typeof this.width === 'undefined' && typeof this.height !== 'undefined')
        ) {
            throw new Error('Cratocss: options "width" and "height" both there must be  null or not null');
        } else if (typeof this.width !== 'undefined' && typeof this.height !== 'undefined') {
            viewport = { width: this.width, height: this.height };
        }

        if (typeof this.device !== 'undefined') {
            deviceData = devices[this.device];

            if (viewport === null) {
                viewport = { ...deviceData.viewport };
            }

            contextOptions = { ...deviceData };
        }

        if (viewport !== null) {
            contextOptions.viewport = viewport;
        }

        const context = await browser.newContext(contextOptions);
        context.setDefaultTimeout(this.timeout);

        const dataUrlsWithContext = await this.preparePages(data, async () => {
            const contextCustom = await browser.newContext(contextOptions);
            contextCustom.setDefaultTimeout(this.timeout);
            return contextCustom;
        });

        while (dataUrlsWithContext.size > 0) {
            // eslint-disable-next-line no-await-in-loop
            await Promise.all(
                this.runInParallel(
                    Math.min(dataUrlsWithContext.size, this.parallelStreamsCount),
                    this.#runItem.bind(this, dataUrlsWithContext, context),
                ),
            );
        }
        await context.close();
        await browser.close();
    }

    async preparePages(
        data: [string, string | string[] | UrlListObject][],
        factoryContext: () => Promise<BrowserContext>,
    ): Promise<Map<string, PreparedPageData>> {
        let _urls: string[];
        let validUrlList: string[];
        let options: UrlListObject | undefined;
        let context: BrowserContext | undefined;
        const result = new Map<string, PreparedPageData>();

        for (const [name, urlList] of data) {
            if (Array.isArray(urlList)) {
                _urls = [...urlList];
            } else if (typeof urlList === 'string') {
                _urls = [urlList];
            } else if (typeof urlList === 'object') {
                if (typeof urlList.cookies !== 'undefined') {
                    // eslint-disable-next-line no-await-in-loop
                    context = await factoryContext();
                    // eslint-disable-next-line no-await-in-loop
                    await context.addCookies(urlList.cookies);
                }
                _urls = Array.isArray(urlList.url) ? urlList.url : urlList.url != null ? [urlList.url] : [];
                options = { ...urlList };
                delete options.url;
            } else {
                _urls = [];
            }

            // eslint-disable-next-line no-await-in-loop
            validUrlList = await this.#checkPageWorking(_urls, options);

            if (validUrlList.length > 0) {
                result.set(name, {
                    url: validUrlList,
                    context,
                });
            } else {
                throw new Error(`Not founded working page in ${name}`);
            }

            context = undefined;
        }

        return result;
    }

    runInParallel<T>(count: number, fn: () => T): T[] {
        const list: T[] = [];
        for (let i = 0; i < count; i++) {
            list.push(fn());
        }
        return list;
    }

    async #runItem(data: Map<string, PreparedPageData>, contextDefault: BrowserContext): Promise<string | undefined> {
        if (typeof data === 'undefined' || data === null || data.size === 0) {
            return '';
        }

        const entry = data.entries().next().value;
        if (entry == null) {
            return '';
        }
        const [name, { url: entryUrl, context }] = entry;
        const contextCurrent = context || contextDefault;

        data.delete(name);

        await this.processItem(contextCurrent, name, entryUrl);

        if (context) {
            await context.close();
        }
        return undefined;
    }

    async #processItemGrab(page: Page): Promise<ProcessItemGrabResult> {
        const { rules } = await this.getCSSData(page);

        const elementsVisible = await this.getElementsVisible(page);

        return await page.evaluate(
            // eslint-disable-next-line no-shadow
            ({ elementsVisible, rules, processCSSRaw }: { elementsVisible: Element[]; rules: CSSRuleItem[]; processCSSRaw: string }) => {
                // eslint-disable-next-line no-new-func
                const processCSSLocal = new Function(`return ${processCSSRaw}`);
                const result = new Set<string>();
                let errors = '';
                for (const ruleItem of rules) {
                    if (typeof ruleItem === 'undefined' || ruleItem === null) {
                        continue;
                    }
                    for (const element of elementsVisible) {
                        if (
                            (typeof ruleItem === 'undefined' ||
                                !('selectorText' in ruleItem) ||
                                typeof (ruleItem as CSSRuleData).selectorText === 'undefined' ||
                                (ruleItem as CSSRuleData).selectorText === null) &&
                            window.matchMedia((ruleItem as CSSMediaRuleData).conditionText).matches
                        ) {
                            const mediaRules = new Set<string>();

                            for (const { selectorText, cssText } of (ruleItem as CSSMediaRuleData).rulesMedia) {
                                // eslint-disable-next-line no-loop-func
                                processCSSLocal()(element, selectorText, cssText, ([cssError, css]: [error?: string, css?: string]) => {
                                    if (cssError && cssError.length > 0) {
                                        errors += cssError;
                                    }
                                    if (typeof css === 'string') {
                                        mediaRules.add(css);
                                    }
                                });
                            }

                            if (mediaRules.size > 0) {
                                result.add(`@media ${(ruleItem as CSSMediaRuleData).conditionText}{${Array.from(mediaRules).join('')}}`);
                            }
                        } else {
                            // eslint-disable-next-line no-loop-func
                            processCSSLocal()(
                                element,
                                (ruleItem as CSSRuleData).selectorText,
                                (ruleItem as CSSRuleData).cssText,
                                ([cssError, css]: [error?: string, css?: string]) => {
                                    if (cssError && cssError.length > 0) {
                                        errors += cssError;
                                    }
                                    if (typeof css === 'string') {
                                        result.add(css);
                                    }
                                },
                            );
                        }
                    }
                }
                return {
                    css: Array.from(result).join(''),
                    errors,
                };
            },
            {
                elementsVisible,
                rules,
                processCSSRaw: processCSS.toString(),
            },
        );
    }

    async #checkPageWorking(urls: string[], options?: UrlListObject): Promise<string[]> {
        let response: Response;
        const result: string[] = [];
        const headers = new Headers();

        const cookies = options?.cookies;
        if (cookies != null) {
            for (const cookieItem of cookies) {
                const { name, value, ...props } = cookieItem;
                let cookieString = `${name}=${value}`;
                // eslint-disable-next-line guard-for-in
                for (const key in props) {
                    cookieString += `; ${key}=${(props as Record<string, unknown>)[key]}`;
                }
                headers.append('Cookie', cookieString);
            }
        }

        for (const item of urls) {
            // eslint-disable-next-line no-await-in-loop
            response = await fetch(item, {
                method: 'GET',
                headers,
            });
            if (!response.ok && options?.ignoreStatusCodeError !== true) {
                // eslint-disable-next-line no-console
                console.error(`Response returned ${response.status} "${response.statusText}" by url ${item}`);
            } else {
                result.push(item);
            }
        }

        return result;
    }

    async processItem(context: BrowserContext, name: string, urlList: string[]): Promise<void> {
        try {
            const result: [string, string] = ['', ''];
            const page = await context.newPage();

            for (const urlListItem of urlList) {
                // eslint-disable-next-line no-await-in-loop
                await page.goto(urlListItem);

                // eslint-disable-next-line no-await-in-loop
                await page.waitForLoadState();

                if (this.screenshots) {
                    const urlCurrent = page.url();
                    // eslint-disable-next-line no-await-in-loop
                    await page.screenshot({ path: `${this.output}/${urlCurrent.replaceAll(/\W/gu, '_')}.png` });
                }

                // eslint-disable-next-line no-await-in-loop
                const { css, errors } = await this.#processItemGrab(page);

                result[0] += css;

                if (errors) {
                    result[1] += `${errors}\n\r`;
                }
            }

            await page.close();

            if (result[1].length > 0) {
                // eslint-disable-next-line no-console
                console.error(result[1]);
            }

            const resultMinified = minify((this.presetStyles ?? '') + result[0]).css;

            const output = this.output ?? '';

            if (!existsSync(output)) {
                await mkdir(output, { recursive: true });
            }

            await writeFile(path.resolve(output, this.#getFilenameCriticalCSS(name)), resultMinified);
        } catch (err) {
            process.stderr.write(`Page: ${name}\n\r${(err as Error).message}\n\r${(err as Error).stack}`);
            process.exit(1);
        }
    }
}

export { Cratocss };
