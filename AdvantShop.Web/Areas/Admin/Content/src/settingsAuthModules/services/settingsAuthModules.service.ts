import { IHttpResponse, IHttpService, IPromise, translate } from 'angular';
import type ISettings from '../types/ISettings';
import { type Response } from '../../../../../../scripts/@types/http';

export interface ISettingsAuthModulesService {
    $http: IHttpService;
    $translate: translate.ITranslateService;

    getSettings(): IPromise<ISettings>;

    setUseAuthModule(useAuthModules: boolean): IPromise<Response>;
}

export default class SettingsAuthModulesService implements ISettingsAuthModulesService {
    /* @ngInject */
    constructor(
        readonly $http: IHttpService,
        readonly $translate: translate.ITranslateService,
    ) {}

    getSettings = (): IPromise<ISettings> =>
        this.$http.get<ISettings>('settingsSystem/getSettingsAuthModules').then((response: IHttpResponse<ISettings>) => {
            if (response.status === 200) {
                return response.data as ISettings;
            }

            throw new Error(this.$translate.instant('Admin.Js.SettingsAuthModules.GetSettingsError'));
        });

    setUseAuthModule = (useAuthModules: boolean): IPromise<Response> =>
        this.$http.post<Response>('settingsSystem/setUseAuthModule', { useAuthModules }).then((response: IHttpResponse<Response>) => {
            if (response.status === 200) {
                return response.data as Response;
            }

            throw new Error(this.$translate.instant('Admin.Js.SettingsAuthModules.SetUseAuthModuleError'));
        });
}
