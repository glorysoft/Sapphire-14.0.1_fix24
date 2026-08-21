(function (ng) {
    

    const leadService = function ($http, Upload) {
        const service = this;

        service.createOrder = function (leadId) {
            return $http.post('leads/createOrder', { leadId }).then((response) => response.data);
        };

        service.addLeadItems = function (leadId, ids) {
            return $http.post('leads/addLeadItems', { leadId, offerIds: ids }).then((response) => response.data);
        };

        service.saveLead = function (lead) {
            return $http.post('leads/saveLead', lead).then((response) => response.data);
        };

        service.createPaymentLink = function (leadId) {
            return $http.post('leads/createOrder', { leadId, force: true }).then((response) => response.data);
        };

        service.deleteLead = function (leadId) {
            return $http.post('leads/deleteLead', { leadId }).then((response) => response.data);
        };

        service.getAttachments = function (leadId) {
            return $http.get('leadsExt/getAttachments', { params: { leadId } }).then((response) => response.data);
        };

        service.uploadAttachment = function (leadId, $files) {
            return Upload.upload({
                url: 'leadsExt/uploadAttachments',
                data: {
                    leadId,
                },
                file: $files,
            }).then((response) => response.data);
        };

        service.deleteAttachment = function (leadId, id) {
            return $http.post('leadsExt/deleteAttachment', { leadId, id }).then((response) => response.data);
        };

        service.getLeadInfo = function (leadId) {
            return $http.get('leads/getLeadInfo', { params: { id: leadId } }).then((response) => response.data);
        };

        service.changeDealStatus = function (leadId, dealStatusId) {
            return $http.post('leads/changeLeadDealStatus', { leadId, dealStatusId }).then((response) => response.data);
        };
    };

    leadService.$inject = ['$http', 'Upload'];

    ng.module('lead').service('leadService', leadService);
})(window.angular);
