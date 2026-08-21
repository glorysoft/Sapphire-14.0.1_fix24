/* @ngInject */
function inplaceService($http) {
    // eslint-disable-next-line no-invalid-this
    const service = this,
        progressState = {
            show: false,
        },
        storage = {
            rich: {},
            inplaceAutocomplete: {},
            inplaceImage: {},
            inplacePrice: {},
        };

    service.addRich = function (id, obj, elementTrigger) {
        if (storage.rich[id]) {
            console.error(`Inplace rich element with id "${id}" already exist`);
        }
        obj.elementTrigger = elementTrigger;
        storage.rich[id] = obj;
    };

    service.getRich = function (id) {
        return storage.rich[id];
    };

    service.addInplaceAutocomplete = function (id, obj) {
        if (storage.inplaceAutocomplete[id]) {
            console.error(`Inplace autocompltete element with id "${id}" already exist`);
        }
        storage.inplaceAutocomplete[id] = obj;
    };

    service.getInplaceAutocomplete = function (id) {
        return storage.inplaceAutocomplete[id];
    };

    service.addInplaceImage = function (id, obj) {
        if (storage.inplaceImage[id]) {
            console.error(`Inplace image element with id "${id}" already exist`);
        }
        storage.inplaceImage[id] = obj;
    };

    service.removeInplaceImage = function (id) {
        Reflect.deleteProperty(storage.inplaceImage, id);
    };

    service.getInplaceImage = function (id) {
        return storage.inplaceImage[id];
    };

    service.addInplacePrice = function (id, obj, elementTrigger) {
        if (storage.inplacePrice[id]) {
            console.error(`Inplace price element with id "${id}" already exist`);
        }
        storage.inplacePrice[id] = obj;
        storage.inplacePrice[id].elementTrigger = elementTrigger;
    };

    service.getInplacePrice = function (id) {
        return storage.inplacePrice[id];
    };

    service.save = function (url, params) {
        return $http.post(url, angular.extend(params, {rnd: Math.random()}));
    };

    service.setEnable = function (isEnabled) {
        return $http.post('inplaceeditor/setenable', {isEnabled}).then((response) => response.data);
    };

    service.getProgressState = function () {
        return progressState;
    };

    service.startProgress = function () {
        progressState.show = true;
    };

    service.stopProgress = function () {
        progressState.show = false;
    };

    service.destroyAll = function () {
        Object.keys(storage).forEach((keyDirective) => {
            Object.keys(storage[keyDirective]).forEach((keyItem) => {
                if (storage[keyDirective][keyItem].destroy) {
                    storage[keyDirective][keyItem].destroy();
                    Reflect.deleteProperty(storage[keyDirective], keyItem);
                }
            });
        });
    };
}

export default inplaceService;
