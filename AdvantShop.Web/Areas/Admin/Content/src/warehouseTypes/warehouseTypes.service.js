import addEditTypeWarehouseTemplate from './modal/AddEditTypeWarehouse/addEditTypeWarehouse.html';
/* @ngInject */
export default function warehouseTypesService($http, $uibModal) {
    const service = this;
    service.getWarehouseType = function (id) {
        return $http
            .post('warehouse/getWarehouseType', {
                id,
            })
            .then((response) => response.data);
    };
    service.addWarehouseType = function (params) {
        return $http.post('warehouse/addWarehouseType', params).then((response) => response.data);
    };
    service.updateWarehouseType = function (params) {
        return $http.post('warehouse/updateWarehouseType', params).then((response) => response.data);
    };
    service.showWarehouseType = function (id) {
        return $uibModal.open({
            bindToController: true,
            controller: 'ModalAddEditTypeWarehouseCtrl',
            controllerAs: 'ctrl',
            templateUrl: addEditTypeWarehouseTemplate,
            resolve: {
                typeId () {
                    return id;
                },
            },
            backdrop: 'static',
        });
    };
}

//    warehouseTypesService.$inject = ['$http', '$uibModal'];

//    ng.module('warehouseTypes').service('warehouseTypesService', warehouseTypesService);
//})(window.angular);
