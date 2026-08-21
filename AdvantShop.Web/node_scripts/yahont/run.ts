import { IRequestInit, IResponseInit, type IResponseCss } from "./types";
import { millisecondsToString } from './helpers'
export const init = async (url: string, params: IRequestInit): Promise<IResponseInit> => {
    const response = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(params),
        headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Localhost/Nodejs',
            'X-Domain': 'http://kipsapp.site'
        }
    })

    if (response.status > 299) {
        throw new Error(`[${(new Date()).toLocaleTimeString()}] Yahont: ${response.status.toString()} ${response.statusText}\n\r${await response.text()}`)
    }

    return await response.json() as IResponseInit;
}

export const getCss = async (name: string, taskId: string, api: string, delay = 0): Promise<IResponseCss> => {

    let cssContent: null | IResponseCss = null;

    while (cssContent == null) {
        console.log(`[${(new Date()).toLocaleTimeString()}] Yahont (${name} version) - getCss: wait ${millisecondsToString(delay)}`)
        await new Promise((resolve) => {
            setTimeout(() => {
                resolve(true);
            }, delay)
        })
        cssContent = await getCssFetcher(name, api, taskId);
    }

    return cssContent;
}

export const getCssFetcher = async (name: string, api: string, taskId: string): Promise<null | IResponseCss> => {
    const response = await fetch(api + taskId, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Localhost/Nodejs',
            'X-Domain': 'http://localhost'
        }
    })

    if (response.status > 299) {
        throw new Error(`[${(new Date()).toLocaleTimeString()}] Yahont (${name} version) - getCssFetcher: ${response.status.toString()} ${response.statusText}\n\r${await response.text()}`)
    } else if (response.status === 204) {
        return null;
    }

    return await response.json() as IResponseCss;
}
