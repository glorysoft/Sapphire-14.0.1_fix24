declare module '*.html?raw' {
    const value: string;
    export default value;
}
declare module '*.html' {
    const value: string;
    export default value;
}

declare const ymaps: ymaps;
declare const angular: ng.IAngularStatic;
declare let CaptchaSource: any;
