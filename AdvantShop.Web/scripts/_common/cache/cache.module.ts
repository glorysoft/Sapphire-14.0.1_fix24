import { CacheService } from './services/cache.service';

const moduleName = 'advCache';

angular.module(moduleName, []).service('advCacheService', CacheService);

export default moduleName;
