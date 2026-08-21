/* @ngInject */
export default function WarehouseGroupCtrl($http, $window, SweetAlert, $translate) {
    const ctrl = this;

    ctrl.$onInit = function () {};

    ctrl.addWarehouses = function (result) {
        const warehouses = Array.isArray(result)
            ? result.map((warehouse) => ({ Id: warehouse.WarehouseId, Name: warehouse.WarehouseName }))
            : [{ Id: result.warehouseId, Name: result.warehouseName }];

        ctrl.Warehouses = ctrl.Warehouses || [];

        for (const w of warehouses) {
            if (ctrl.Warehouses.find((x) => x.Id === w.Id) == null) {
                ctrl.Warehouses.push(w);
            }
        }

        ctrl.WarehouseIds = JSON.stringify(ctrl.Warehouses.map((x) => x.Id));
    };

    ctrl.removeWarehouse = function (warehouse) {
        SweetAlert.confirm($translate.instant('Admin.Js.Product.AreYouSureDelete'), {
            title: $translate.instant('Admin.Js.Product.Deleting'),
        }).then((result) => {
            if (result === true || result.value === true) {
                ctrl.Warehouses = ctrl.Warehouses.filter((x) => x.Id !== warehouse.Id);
                ctrl.WarehouseIds = JSON.stringify(ctrl.Warehouses.map((x) => x.Id));
            }
        });
    };

    ctrl.sortableOptions = {
        orderChanged (event) {
            ctrl.WarehouseIds = JSON.stringify(ctrl.Warehouses.map((x) => x.Id));
        },
    };

    ctrl.chooseCity = function (result) {
        ctrl.CityId = result.CityId;
        ctrl.CityName = result.Name;
        ctrl.CountryAndRegion = `${result.Country  }, ${  result.Region}`;
    };

    ctrl.updatePhoto = function (result) {
        ctrl.PhotoId = result.pictureId;
    };

    ctrl.updateLogo = function (result) {
        ctrl.LogoId = result.pictureId;
    };

    ctrl.deleteWarehouseGroup = function (id) {
        SweetAlert.confirm($translate.instant('Admin.Js.Brand.AreYouSureDelete'), {
            title: $translate.instant('Admin.Js.Brand.Deleting'),
        }).then((result) => {
            if (result === true || result.value) {
                $http.post('warehouseGroups/deleteWarehouseGroup', { id }).then((response) => {
                    $window.location.assign('settingswarehouses?warehousesTab=groups');
                });
            }
        });
    };
}
