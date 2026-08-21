let increment = 0;
/*@ngInject*/
function autocompleterService($http, $q, $cacheFactory) {
    // eslint-disable-next-line no-invalid-this
    const service = this,
        cache = $cacheFactory('autocompleter'),
        storageObjects = new Map();

    service.getData = function (url, search, params) {
        return service.getFromServer(url, search, params); // service.getFromCache(url, q, params) ||
    };

    service.getFromCache = function (url, search, params) {
        const unique = service.getUnique(url, search, params),
            cacheItem = cache.get(unique);

        return angular.isDefined(cacheItem) ? $q.when(cacheItem) : undefined;
    };

    service.getFromServer = function (url, search, params) {
        // eslint-disable-next-line id-length
        return $http.get(url, { params: angular.extend(params || {}, { q: search }) }).then((response) => {
            const unique = service.getUnique(url, search, params);

            cache.put(unique, response.data);

            return response.data;
        });
    };

    service.getUnique = function (url, search, params) {
        return [url, '?q=', search, `&${  service.objectToQuery(params)}`].join('');
    };

    service.objectToQuery = function (obj) {
        const result = [];

        if (obj) {
            for (const key in obj) {
                if (Object.hasOwn(obj, key)) {
                    result.push(`${encodeURIComponent(key)  }=${  encodeURIComponent(obj[key])}`);
                }
            }
        }

        return result.length > 0 ? result.join('&') : '';
    };

    service.addInStorage = function(key, controlType, value){
        const item = storageObjects.get(key) ?? {};
        item[controlType] = value;
        storageObjects.set(key, item)
    };

    service.getFromStorage = function(key, controlType){
        const item = storageObjects.get(key);
        if(typeof item === 'undefined' || (controlType && typeof item[controlType] === 'undefined')){
            throw  new Error(`autocompleter: not found item by key "${key}" and type "${controlType}"`);
        }
        return typeof controlType === 'undefined' ? item: item[controlType];
    }

    service.generateKeyStorage = function() {
        increment += 1;
        return increment;
    };
}

export default autocompleterService;
