import type { IHttpService } from 'angular';
import type { IToasterService } from 'ngtoaster';
import { isResponseError, type Response } from '../@types/http';

export interface IRecoveryPasswordController {
    newPassword?: string;
    newPasswordConfirm?: string;
    email?: string;
    recoveryCode?: string;
    lpId?: number;
    view: ViewType;

    init(lpId?: number, email?: string, recoveryCode?: string): void;

    submitRecover(): void;
}

export type ViewType = 'recovery' | 'recoverySuccess';

export interface IChangePassword {
    RedirectTo: string | null;
}

export default class RecoveryPasswordController implements IRecoveryPasswordController {
    newPassword?: string;
    newPasswordConfirm?: string;
    email?: string;
    recoveryCode?: string;
    lpId?: number;
    view: ViewType = 'recovery';

    /* @ngInject */
    constructor(
        readonly $http: IHttpService,
        readonly toaster: IToasterService,
    ) {
    }

    init(lpId?: number, email?: string, recoveryCode?: string) {
        this.lpId = lpId;
        this.email = email;
        this.recoveryCode = recoveryCode;
    };

    submitRecover() {
        this.$http
            .post<Response<IChangePassword>>('/user/changePassword', {
                newPassword: this.newPassword,
                newPasswordConfirm: this.newPasswordConfirm,
                email: this.email,
                recoveryCode: this.recoveryCode,
            })
            .then((response) => {
                if (!isResponseError(response.data)) {
                    this.view = 'recoverySuccess';

                    if (typeof response.data.obj !== 'undefined'
                        && response.data.obj !== null
                        && typeof response.data.obj.RedirectTo !== 'undefined'
                        && response.data.obj.RedirectTo !== null) {
                        window.location.assign(response.data.obj.RedirectTo);
                    } else if (typeof this.lpId !== 'undefined' && this.lpId !== null) {
                        window.location.assign(`/lp/user/redirect/${this.lpId}`);
                    }
                } else {
                    response.data.errors.forEach((error) => {
                        this.toaster.pop('error', error);
                    });
                }
            });
    };
}
