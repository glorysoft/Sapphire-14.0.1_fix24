import { IHttpResponse, IHttpService, IPromise, translate } from 'angular';
import IAuthMethod from '../types/IAuthMethod';
import type { Response } from '../../../../../../../scripts/@types/http';

export interface IAuthSortingService {
    $http: IHttpService;
    $translate: translate.ITranslateService;

    getAuthMethods(): IPromise<IAuthMethod[]>;
    updateAuthMethods(methods: IAuthMethod[]): IPromise<Response>;
}

export default class AuthSortingService implements IAuthSortingService {
    /* @ngInject */
    constructor(
        readonly $http: IHttpService,
        readonly $translate: translate.ITranslateService,
    ) {}

    getAuthMethods = (): IPromise<IAuthMethod[]> =>
        this.$http.get<IAuthMethod[]>('settingsTemplate/getAuthMethods').then((response: IHttpResponse<IAuthMethod[]>) => {
            if (response.status === 200) {
                return response.data as IAuthMethod[];
            }

            throw new Error(this.$translate.instant('Admin.Js.Partials.AuthSorting.GetAuthMethodsError'));
        });

    updateAuthMethods = (methods: IAuthMethod[]): IPromise<Response> =>
        this.$http.post<Response>('settingsTemplate/updateAuthMethods', { methods }).then((response: IHttpResponse<Response>) => {
            if (response.status === 200) {
                return response.data as Response;
            }

            throw new Error(this.$translate.instant('Admin.Js.Partials.AuthSorting.UpdateAuthMethodsError'));
        });
}
