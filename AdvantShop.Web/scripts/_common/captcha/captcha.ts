import CaptchaService from "./captcha.service";

const moduleName = 'captcha';

angular
    .module(moduleName, [])
    .service('captchaService', CaptchaService);

export default moduleName;
