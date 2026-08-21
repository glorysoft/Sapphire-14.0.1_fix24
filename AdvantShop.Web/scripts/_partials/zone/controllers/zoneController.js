const ZoneCtrl = /* @ngInject */ function(zoneService, $timeout, zoneEvents, $window) {
    const ctrl = this;

    ctrl.$onInit = function() {
        ctrl.minCountInColumns = 6;
        ctrl.zoneCity = '';
        ctrl.isProgress = true;

        zoneService
            .getDataForPopup()
            .then((data) => {
                ctrl.data = data;
                [ctrl.countrySelected] = ctrl.data;
                for (let i = ctrl.data.length - 1; i >= 0; i--) {
                    if (ctrl.data[i].Cities.length > ctrl.minCountInColumns) {
                        ctrl.data[i].Columns = zoneService.sliceCitiesForDialog(ctrl.data[i].Cities);
                    } else {
                        ctrl.data[i].Columns = [ctrl.data[i].Cities];
                    }
                }

                return data;
            })
            .finally(() => {
                ctrl.isProgress = false;
            });
    };

    ctrl.changeCity = function(city, obj, countryId, region, event) {
        if (!city.length || event?.type === 'blur') return;
        let _region = region;
        if (!region && obj) {
            _region = obj.Region;
        }
        const zip = obj ? obj.Zip : null;
        const country = obj ? obj.Country : null;
        const district = obj ? obj.District : null;

        zoneService.setCurrentZone(city, obj, countryId, _region, country, zip, district).then((data) => {
            if (data.ReloadPage) {
                if (data.ReloadUrl) {
                    $window.location.href = $window.location.href.replace($window.location.origin, data.ReloadUrl);
                } else {
                    $window.location.reload(true);
                }
            }

            if (!data.Region) {
                ctrl.showRegion = true;
                ctrl.autocompleter.toggleVisible(false);
            } else {
                zoneService.zoneDialogClose();
                ctrl.zoneCity = '';
                ctrl.zoneRegion = '';
                ctrl.showRegion = false;
            }
            $timeout(() => {
                zoneService.processCallback(zoneEvents.changeCity, data);
            }, 0);
        });
    };

    ctrl.keyup = function($event) {
        $event.stopPropagation();
        const { keyCode } = $event;

        switch (keyCode) {
            case 13: //enter
                ctrl.changeCity(ctrl.zoneCity, null, ctrl.countrySelected.CountryId, ctrl.zoneRegion);
                break;
            default:
                break;
        }

    };

    ctrl.autocompleterOnInit = function(autocompleter) {
        ctrl.autocompleter = autocompleter;
    };
};

angular.module('zone').controller('ZoneCtrl', ZoneCtrl);

