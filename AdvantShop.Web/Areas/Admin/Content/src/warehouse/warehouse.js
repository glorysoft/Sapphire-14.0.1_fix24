(function (ng) {
    

    const WarehouseCtrl = function (SweetAlert, $translate, $http, toaster) {
        const ctrl = this;

        ctrl.changeType = function (result) {
            ctrl.TypeId = result.typeId;
            ctrl.TypeName = result.typeName;
        };

        ctrl.clearType = function () {
            ctrl.TypeId = null;
            ctrl.TypeName = 'Не выбран';
        };

        ctrl.processCity = function (zone) {
            if (zone && zone.CityId) {
                ctrl.cityId = zone.CityId;
            }
            if (zone && zone.Name) {
                ctrl.city = zone.Name;
                ctrl.cityDescription = `${zone.Country  }, ${  zone.Region}`;
            }
        };

        ctrl.deleteWarehouse = function (warehouseId) {
            SweetAlert.confirm($translate.instant('Admin.Js.AreYouSureDelete'), { title: $translate.instant('Admin.Js.Deleting') }).then(
                (result) => {
                    if (result.value === true) {
                        $http.post('warehouse/deletewarehouse', { WarehouseId: warehouseId }).then((response) => {
                            if (response.data.result === true) {
                                window.location = 'settingswarehouses';
                            } else {
                                response.data.errors.forEach((error) => {
                                    toaster.pop('error', error);
                                });

                                if (!response.data.errors) {
                                    toaster.pop('error', 'Ошибка', 'Не удалось удалить категорию');
                                }
                            }
                        });
                    }
                },
            );
        };

        ctrl.initTimesOfWork = function (timesOfWork) {
            ctrl.timesOfWorkJson = angular.toJson(timesOfWork);
            if (timesOfWork) {
                ctrl.timesOfWork = timesOfWork.map((item) => ({
                        Id: item.Id,
                        Monday: item.DayOfWeeks.indexOf(1) !== -1,
                        Tuesday: item.DayOfWeeks.indexOf(2) !== -1,
                        Wednesday: item.DayOfWeeks.indexOf(3) !== -1,
                        Thursday: item.DayOfWeeks.indexOf(4) !== -1,
                        Friday: item.DayOfWeeks.indexOf(5) !== -1,
                        Saturday: item.DayOfWeeks.indexOf(6) !== -1,
                        Sunday: item.DayOfWeeks.indexOf(0) !== -1,
                        OpeningTime: item.OpeningTime,
                        ClosingTime: item.ClosingTime,
                        BreakStartTime: item.BreakStartTime,
                        BreakEndTime: item.BreakEndTime,
                    }));
            }
        };

        ctrl.changeTimesOfWork = function (times) {
            if (!times) {
                ctrl.timesOfWorkJson = '';
                return true;
            }

            ctrl.timesOfWorkJson = angular.toJson(
                times.map((item) => {
                    const obj = {
                        Id: item.Id,
                        DayOfWeeks: [],
                        OpeningTime: item.OpeningTime,
                        ClosingTime: item.ClosingTime,
                        BreakStartTime: item.BreakStartTime,
                        BreakEndTime: item.BreakEndTime,
                    };

                    if (item.Monday) {
                        obj.DayOfWeeks.push(1);
                    }
                    if (item.Tuesday) {
                        obj.DayOfWeeks.push(2);
                    }
                    if (item.Wednesday) {
                        obj.DayOfWeeks.push(3);
                    }
                    if (item.Thursday) {
                        obj.DayOfWeeks.push(4);
                    }
                    if (item.Friday) {
                        obj.DayOfWeeks.push(5);
                    }
                    if (item.Saturday) {
                        obj.DayOfWeeks.push(6);
                    }
                    if (item.Sunday) {
                        obj.DayOfWeeks.push(0);
                    }

                    return obj;
                }),
            );
        };

        ctrl.changeWarehouseCities = function (warehouseCities) {
            if (!warehouseCities) {
                ctrl.warehouseCitiesJson = '';
                return true;
            }

            ctrl.warehouseCitiesJson = angular.toJson(warehouseCities);
        };
    };

    WarehouseCtrl.$inject = ['SweetAlert', '$translate', '$http', 'toaster'];

    ng.module('warehouse', []).controller('WarehouseCtrl', WarehouseCtrl);
})(window.angular);
