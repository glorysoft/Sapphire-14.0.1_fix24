export interface IRequestInit {
    baseUrl: string;
    bundles: ICssBundleDto[];
    options: Omit<CratocssOptions, 'baseUrl'>[];
}

export  interface ICssBundleCookieDto {
    name: string;
    value: string;
    url?: string;
    domain?: string;
    path?: string;
    expires?: number;
    httpOnly?: boolean;
    secure?: boolean;
    sameSite?: string;
}

export interface ICssBundlePathDto {
    path: string;
    cookies?: ICssBundleCookieDto[];
    expectedStatusCode?: number;
}

export  interface ICssBundleDto {
    name: string
    paths: ICssBundlePathDto[]
}

export interface CratocssOptionsBase {
    //https://playwright.dev/docs/api/class-playwright#playwright-devices
    device: string;
    width: number;
    height: number;
    grabFontFace: boolean;
    parallelStreamsCount: number;
    timeout: number;
    discardProperties: (string | RegExp)[];
    querySelectorElements: string;
    additionalUrlParams: Record<string, string>;
}

export interface IResponseInit {
    taskId: string,
    averageWaitTime: string,
    averageWaitTimeMs: number
}

export type CratocssOptions = Partial<CratocssOptionsBase>;


interface IBundlesErrorItem {
    message: string,
    statusCode: number,
    url: string,
    options: Omit<CratocssOptions, 'baseUrl'>
}

export interface IResponseCss {
    bundles: Record<string, string>
    errors: Record<string, IBundlesErrorItem[]>
}
type UrlDestinationItem = string | { url: string, ignoreStatusCodeError?: boolean, admin?: boolean }
export type UrlDestination = UrlDestinationItem | UrlDestinationItem[]
