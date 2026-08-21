import { IHttpService, IPromise } from 'angular';
import { isResponseError, type Response } from '../../../../../../scripts/@types/http';
import { IToastrService } from 'angular-toastr';
import { FeatureDef } from './settings-features.constant';

interface SettingFeaturesServiceDef {
    isEnabled(feature: FeatureDef): IPromise<boolean | undefined>;
}

export default class SettingFeaturesService implements SettingFeaturesServiceDef {
    /* @ngInject */
    constructor(
        private readonly $http: IHttpService,
        private readonly toaster: IToastrService,
    ) {}

    isEnabled(feature: FeatureDef) {
        return this.$http.get<Response<boolean>>('settings/isFeatureEnabled', { params: { feature } }).then((response) => {
            if (isResponseError(response.data)) {
                this.toaster.error(response.data.errors.join('<br>'));
                return;
            }

            return response.data.obj;
        });
    }
}
