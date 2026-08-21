import { ICssBundleCookieDto } from './types';
import { chromium, Cookie } from 'playwright-core';

export const getAuthorizeCookie = async (baseUrl: string) => {
    const browser = await chromium.launch();

    const context = await browser.newContext();

    const page = await context.newPage();
    context.setDefaultTimeout(90000);

    const urlObj = new URL(`${baseUrl}adminv2/login`);

    await page.goto(urlObj.toString());

    await page.getByPlaceholder('Логин').fill('admin');
    await page.getByPlaceholder('Пароль').fill('123123');
    await page.getByRole('button').click();

    const result = await context.cookies();
    await browser.close();
    return result;
};

export const installTemplate = async (baseUrl: string, templateId: string, cookie: Cookie[]) => {
    const response = await fetch(`${baseUrl}tools/dev/SetTemplate.ashx?templateId=${templateId}`);

    const responseText = await response.text();
    if (response.ok && responseText === 'ok') {
        return;
    }

    // Если не получилось поменять через тулзу пойдем по старинке

    const urlObj = new URL(`${baseUrl}adminv3/design/ApplyTemplate`);

    urlObj.searchParams.append('templateId', templateId);

    const browser = await chromium.launch();

    const context = await browser.newContext();
    context.setDefaultTimeout(90000);

    const page = await context.newPage();
    await context.addCookies(cookie);
    await page.goto(urlObj.toString());

    await browser.close();
};

//https://stackoverflow.com/a/8212878
export const millisecondsToString = (milliseconds: number) => {
    // TIP: to find current time in milliseconds, use:
    // var  current_time_milliseconds = new Date().getTime();

    function numberEnding(number) {
        return number > 1 ? 's' : '';
    }

    let temp = Math.floor(milliseconds / 1000);
    const years = Math.floor(temp / 31536000);
    if (years) {
        return `${years} year${numberEnding(years)}`;
    }
    //TODO: Months! Maybe weeks?
    const days = Math.floor((temp %= 31536000) / 86400);
    if (days) {
        return `${days} day${numberEnding(days)}`;
    }
    const hours = Math.floor((temp %= 86400) / 3600);
    if (hours) {
        return `${hours} hour${numberEnding(hours)}`;
    }
    const minutes = Math.floor((temp %= 3600) / 60);
    if (minutes) {
        return `${minutes} minute${numberEnding(minutes)}`;
    }
    const seconds = temp % 60;
    if (seconds) {
        return `${seconds} second${numberEnding(seconds)}`;
    }
    return 'less than a second'; //'just now' //or other string you like;
};
