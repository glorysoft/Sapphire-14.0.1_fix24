const zoneService = /* @ngInject */ function ($http, $cacheFactory, $q, $sce, modalService, urlHelper) {
    // eslint-disable-next-line no-invalid-this
    const service = this,
        updateList = [],
        queryList = [],
        callbacks = {},
        cache = $cacheFactory('zonesCache');
    let isRenderDialog = false;

    service.getDataForPopup = function () {
        return $http.get(urlHelper.getAbsUrl('location/getdataforpopup', true)).then((response) => response.data);
    };

    service.getZones = function (countryId) {
        return service.getZonesFromCache(countryId).then((response) => {
            if (typeof response === 'undefined' || response === null) {
                return service.getZonesFromDB(countryId);
            }
            return response;
        });
    };

    service.getZonesFromCache = function (countryId) {
        const zones = cache.get('zones'),
            zone = angular.isDefined(zones) ? zones[countryId] : null;

        return $q.when(zone);
    };

    service.getZonesFromDB = function (countryId) {
        return $http.get(urlHelper.getAbsUrl('/location/getcities', true), { params: { countryId: countryId || 0 } }).then((response) => {
            const zones = cache.get('zones') || {};
            zones[countryId || 0] = response.data;
            cache.put('zones', zones);

            return response.data;
        });
    };

    service.setCurrentZone = function (city, obj, countryId, region, country, zip, district) {
        const params = {
            city,
            countryId,
            regionName: region,
            countryName: country,
            zip,
            district,
        };
        if (typeof obj !== 'undefined' && obj !== null) params.cityId = obj.CityId;

        return $http.post(urlHelper.getAbsUrl('/location/setzone', true), params).then((response) => {
            const currentFromCache = cache.get('currentZone'),
                data = angular.isDefined(currentFromCache) ? angular.extend(currentFromCache, response.data) : response.data;

            if (typeof data?.Phone !== 'undefined' && data?.Phone !== null) {
                data.Phone = $sce.trustAsHtml(data.Phone);
            }

            service.processUpdateList(data);

            service.processCallback('set', data);

            return cache.put('currentZone', data);
        });
    };

    service.getCurrentZone = function () {
        const currentFromCache = cache.get('currentZone');

        if (typeof currentFromCache !== 'undefined' && currentFromCache !== null) {
            return $q.when(currentFromCache);
        }

        if (queryList.length > 0) {
            const defer = $q.defer();
            queryList.push(defer);

            return defer.promise;
        }

        queryList.push($q.defer());

        return $http.post(urlHelper.getAbsUrl('/location/getcurrentzone', true)).then((response) => {
            response.data.Phone = $sce.trustAsHtml(response.data.Phone);

            cache.put('currentZone', response.data.current);

            for (let i = queryList.length - 1; i >= 0; i--) {
                queryList[i].resolve(cache.get('currentZone'));
            }

            queryList.length = 0;

            return $q.when(cache.get('currentZone'));
        });
    };

    service.approveZone = function () {
        return $http.post(urlHelper.getAbsUrl('/location/approveZone', true));
    };

    service.zoneDialogOpen = function (options) {
        const showImmediately = typeof options !== 'undefined' && options !== null && options.showImmediately;
        if (isRenderDialog === false) {
            $http.get(urlHelper.getAbsUrl('/common/getzonedialogsettings', true)).then((response) => {
                const { data } = response;
                modalService.renderModal(
                    'zoneDialog',
                    undefined,
                    `<div data-zone-dialog data-hide-countries="${data.hideCountries}" data-hide-search="${data.hideSearch}"></div>`,
                    undefined,
                    {
                        isOpen: true,
                        crossEnable: showImmediately !== true,
                        closeOut: showImmediately !== true,
                        closeEsc: showImmediately !== true,
                        modalClass: 'zone-dialog',
                    },
                );
                isRenderDialog = true;
            });
        } else {
            modalService.open('zoneDialog');
        }
    };

    service.zoneDialogClose = function () {
        if (isRenderDialog === true) {
            modalService.close('zoneDialog').then(() => {
                modalService.startWorking();
            });
        }
    };

    service.sliceCitiesForDialog = function (cities) {
        const columnsSize = 4,
            citiesLength = cities.length;

        const itemsSize = Math.ceil(citiesLength / columnsSize),
            newArray = [];

        for (let i = 0; i < columnsSize; i++) {
            newArray.push(cities.slice(i * itemsSize, (i + 1) * itemsSize));
        }

        return newArray;
    };

    service.getCitiesForAutocomplete = function (cityName) {
        // eslint-disable-next-line id-length
        return $http.get(urlHelper.getAbsUrl('/location/getcitiesautocomplete', true), { params: { q: cityName } }).then((response) => response.data);
    };

    service.addUpdateList = function (scope) {
        updateList.push(scope);
    };

    service.addCallback = function (eventName, func) {
        callbacks[eventName] ||= [];
        callbacks[eventName].push(func);
    };

    service.removeCallback = function (eventName, func) {
        if (callbacks[eventName]) {
            callbacks[eventName] = callbacks[eventName].filter((cb) => cb !== func);
        }
    };

    service.processCallback = function (eventName, data) {
        if (typeof callbacks[eventName] !== 'undefined' && callbacks[eventName] !== null) {
            for (let i = 0; callbacks[eventName].length > i; i++) {
                callbacks[eventName][i](data);
            }
        }
    };

    service.processUpdateList = function (data) {
        const dataTrusted = service.trustZone(data);

        for (let i = updateList.length - 1; i >= 0; i--) {
            if (angular.isDefined(updateList[i].zone)) {
                angular.extend(updateList[i].zone, dataTrusted);
            }
        }
    };

    service.trustZone = function (zone) {
        if (zone.Phone !== null && typeof zone.Phone === 'string') {
            zone.Phone = $sce.trustAsHtml(zone.Phone);
        }

        return zone;
    };

    service.getCurrentCity = function () {
        return $http.get(urlHelper.getAbsUrl('/location/GetCurrentCity', true)).then((response) => response.data);
    };

    service.getMainCities = function (countryId) {
        return $http.get(urlHelper.getAbsUrl(`/location/GetCities?countryId=${countryId || 0}`)).then((response) => response.data);
    };

    service.getDeliveryZones = function (cityId) {
        return $http.post(urlHelper.getAbsUrl('/location/getDeliveryZones', true), { cityId }).then((response) => response.data);
    };
};

angular.module('zone').service('zoneService', zoneService);
