/*@ngInject*/
function yandexMapsService(urlHelper, $q, $translate) {
    const service = this;
    const deferReady = $q.defer();
    let isInitialized = false;

    // дополнительная функция проверки признаков что янекс.карта уже как-то загружена
    service.isLoadedYandexMap = function () {
        return window.ymaps != null;
    };

    service.getIsLoadedMap = () => {
        if (!service.isLoadedYandexMap() && !isInitialized) {
            service.loadYandexMap();
        }
        return deferReady.promise;
    };

    service.loadYandexMap = function (params) {
        if (service.isLoadedYandexMap() && isInitialized) {
            return $q.resolve();
        } 
            if (document.querySelector('script[src*="api-maps.yandex.ru"]') == null) {
                const script = document.createElement('script');
                script.onload = function () {
                    waitingInitYmaps();
                };
                script.src = `https://api-maps.yandex.ru/2.1/?${  urlHelper.paramsToString(angular.extend({ lang: 'ru-RU' }, params || {}))}`;
                document.body.appendChild(script);
            } else {
                waitingInitYmaps();
            }
        

        return deferReady.promise;
    };

    service.getCoordsCityByName = (cityName) => ymaps
            .geocode(cityName, {
                results: 1,
            })
            .then((res) => {
                const firstGeoObject = res.geoObjects.get(0);

                if (firstGeoObject) {
                    const bounds = firstGeoObject.properties.get('boundedBy');
                    const coords = firstGeoObject.geometry.getCoordinates();
                    return {
                        bounds,
                        coords,
                    };
                }
                return null;
            })
            .catch((err) => {
                if (err.message === 'scriptError') {
                    throw $translate.instant('Js.ShippingPointsList.ErrorApiKey');
                }
                throw 'Error loading map';
            });

    service.getLocation = () => 
        // result.geoObjects.position
         ymaps.geolocation.get({
            provider: 'yandex',
            mapStateAutoApply: true,
        })
    ;

    service.getCityByCoords = (latitude, longitude) => ymaps.geocode([latitude, longitude]).then((res) => {
            const firstGeoObject = res.geoObjects.get(0);
            return firstGeoObject.getLocalities()[0];
        });

    service.checkPointInPolygons = (coords, polygons = []) => {
        let isContain = polygons.length === 0;
        let currentPolygon;
        if (polygons.length > 0) {
            for (const polygon of polygons) {
                if (polygon?.geometry?.contains(coords)) {
                    isContain = true;
                    currentPolygon = polygon;
                    break;
                }
            }
        }
        return {
            isContain,
            currentPolygon,
        };
    };

    function waitingInitYmaps() {
        const _defer = $q.defer();
        if (service.isLoadedYandexMap()) {
            ymaps.ready(() => _defer.resolve());
        } else {
            loop(_defer);
        }

        return _defer.promise.then(() => {
            isInitialized = true;
            deferReady.resolve();
        });
    }

    const delay = 50;
    const retryMax = 3000 / 50;
    let tryCount = 0;

    function loop(defer) {
        if (service.isLoadedYandexMap()) {
            defer.resolve();
        } else if (tryCount < retryMax) {
            tryCount += 1;
            setTimeout(() => loop(defer), delay);
        } else {
            console.warn('Yandex map not found');
            defer.reject('Yandex map not found');
        }
        return defer.promise;
    }
}

export default yandexMapsService;
