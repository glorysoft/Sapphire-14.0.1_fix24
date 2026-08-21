import { IToasterService } from 'ngtoaster';
import { IAuthSortingService } from '../services/authSorting.service';
import IAuthMethod from '../types/IAuthMethod';
import { isResponseError, Response } from '../../../../../../../scripts/@types/http';
import { translate } from 'angular';

export interface IAuthSortingController {
    toaster: IToasterService;
    authSortingService: IAuthSortingService;
    $translate: translate.ITranslateService;

    methods: IAuthMethod[];

    sortableOptions: object;

    $onInit(): void;

    getAuthMethods(): void;
}

export default class AuthSortingController implements IAuthSortingController {
    methods: IAuthMethod[] = [];

    /* @ngInject */
    constructor(
        readonly toaster: IToasterService,
        readonly authSortingService: IAuthSortingService,
        readonly $translate: translate.ITranslateService,
    ) {}

    $onInit = (): void => {
        this.getAuthMethods();
    };

    getAuthMethods = (): void => {
        this.authSortingService
            .getAuthMethods()
            .then((methods: IAuthMethod[]) => {
                this.methods = methods;
            })
            .catch((error: Error) => {
                this.toaster.pop('error', '', error.message);
            });
    };

    sortableOptions: object = {
        orderChanged: (event) => {
            for (let i = 0; i < this.methods.length; i++) {
                if (i === 0) {
                    this.methods[i].SortOrder = 0;
                } else {
                    this.methods[i].SortOrder = this.methods[i - 1].SortOrder + 10;
                }
            }

            this.authSortingService
                .updateAuthMethods(this.methods)
                .then((response: Response) => {
                    if (!isResponseError(response)) {
                        this.toaster.pop('success', '', this.$translate.instant('Admin.Js.Partials.AuthSorting.UpdateAuthMethodsSuccess'));
                    } else {
                        response.errors.forEach((error: string) => {
                            this.toaster.pop('error', '', error);
                        });
                        this.getAuthMethods();
                    }
                })
                .catch((error: Error) => {
                    this.toaster.pop('error', '', error.message);
                    this.getAuthMethods();
                });
        },
    };
}
