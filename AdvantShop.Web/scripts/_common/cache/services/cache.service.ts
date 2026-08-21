import type { IHttpPromise, IHttpService } from 'angular';

export interface ICacheService {
    resetLastModified: () => void;
}

class CacheService implements ICacheService {
    /* @ngInject */
    constructor(
        private readonly $http: IHttpService,
        private readonly urlHelper: any,
    ) {}
    resetLastModified = (): IHttpPromise<void> => {
        const url = this.urlHelper.getAbsUrl('/common/resetLastModified', true);
        return this.$http.post(url, null);
    };
}

export { CacheService };
