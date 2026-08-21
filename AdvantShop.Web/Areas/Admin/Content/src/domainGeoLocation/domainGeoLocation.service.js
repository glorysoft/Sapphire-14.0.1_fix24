import addEditDomainGeoLocationTemplate from './modal/AddEditDomainGeoLocation/addEditDomainGeoLocation.html';
/* @ngInject */
export default function domainGeoLocationService($http, $uibModal) {
    const service = this;
    service.get = function (id) {
        return $http.post('warehouse/getDomainGeoLocation', { id }).then((response) => response.data);
    };
    service.add = function (params) {
        return $http.post('warehouse/addDomainGeoLocation', params).then((response) => response.data);
    };
    service.update = function (params) {
        return $http.post('warehouse/updateDomainGeoLocation', params).then((response) => response.data);
    };
    service.showModal = function (id) {
        return $uibModal.open({
            bindToController: true,
            controller: 'ModalAddEditDomainGeoLocationCtrl',
            controllerAs: 'ctrl',
            templateUrl: addEditDomainGeoLocationTemplate,
            resolve: {
                Id () {
                    return id;
                },
            },
            backdrop: 'static',
            size: 'middle',
        });
    };
}
