(function (ng) {
    

    const bookingAffiliateService = function ($http) {
        const service = this;

        service.delete = function (id) {
            return $http.post('bookingAffiliate/delete', { Id: id }).then((result) => result.data);
        };

        service.getAdditionalTime = function (affiliateId, date) {
            let paramDate = date;
            if (paramDate instanceof Date) {
                paramDate = `${paramDate.getFullYear()  }-${  paramDate.getMonth() + 1  }-${  paramDate.getDate()}`;
            }

            return $http
                .get('bookingAffiliate/getAdditionalTime', { params: { affiliateId, date: paramDate } })
                .then((response) => response.data);
        };

        service.addAdditionalTime = function (affiliateId, date, times) {
            let paramDate = date;
            if (paramDate instanceof Date) {
                paramDate = `${paramDate.getFullYear()  }-${  paramDate.getMonth() + 1  }-${  paramDate.getDate()}`;
            }

            return $http
                .post('bookingAffiliate/addAdditionalTime', { affiliateId, date: paramDate, times })
                .then((response) => response.data);
        };

        service.updateAdditionalTime = function (affiliateId, date, times) {
            let paramDate = date;
            if (paramDate instanceof Date) {
                paramDate = `${paramDate.getFullYear()  }-${  paramDate.getMonth() + 1  }-${  paramDate.getDate()}`;
            }

            return $http
                .post('bookingAffiliate/updateAdditionalTime', {
                    affiliateId,
                    date: paramDate,
                    times,
                })
                .then((response) => response.data);
        };

        service.addAdditionalTimes = function (affiliateId, startDate, endDate, times) {
            let paramStartDate = startDate;
            if (paramStartDate instanceof Date) {
                paramStartDate = `${paramStartDate.getFullYear()  }-${  paramStartDate.getMonth() + 1  }-${  paramStartDate.getDate()}`;
            }
            let paramEndDate = endDate;
            if (paramEndDate instanceof Date) {
                paramEndDate = `${paramEndDate.getFullYear()  }-${  paramEndDate.getMonth() + 1  }-${  paramEndDate.getDate()}`;
            }

            return $http
                .post('bookingAffiliate/addAdditionalTime', {
                    affiliateId,
                    startDate: paramStartDate,
                    endDate: paramEndDate,
                    times,
                })
                .then((response) => response.data);
        };

        service.updateAdditionalTimes = function (affiliateId, startDate, endDate, times) {
            let paramStartDate = startDate;
            if (paramStartDate instanceof Date) {
                paramStartDate = `${paramStartDate.getFullYear()  }-${  paramStartDate.getMonth() + 1  }-${  paramStartDate.getDate()}`;
            }
            let paramEndDate = endDate;
            if (paramEndDate instanceof Date) {
                paramEndDate = `${paramEndDate.getFullYear()  }-${  paramEndDate.getMonth() + 1  }-${  paramEndDate.getDate()}`;
            }

            return $http
                .post('bookingAffiliate/updateAdditionalTime', {
                    affiliateId,
                    startDate: paramStartDate,
                    endDate: paramEndDate,
                    times,
                })
                .then((response) => response.data);
        };

        service.deleteAdditionalTime = function (affiliateId, date) {
            let paramDate = date;
            if (paramDate instanceof Date) {
                paramDate = `${paramDate.getFullYear()  }-${  paramDate.getMonth() + 1  }-${  paramDate.getDate()}`;
            }

            return $http.post('bookingAffiliate/deleteAdditionalTime', { affiliateId, date: paramDate }).then((response) => response.data);
        };

        service.deleteAdditionalTimes = function (affiliateId, startDate, endDate) {
            let paramStartDate = startDate;
            if (paramStartDate instanceof Date) {
                paramStartDate = `${paramStartDate.getFullYear()  }-${  paramStartDate.getMonth() + 1  }-${  paramStartDate.getDate()}`;
            }
            let paramEndDate = endDate;
            if (paramEndDate instanceof Date) {
                paramEndDate = `${paramEndDate.getFullYear()  }-${  paramEndDate.getMonth() + 1  }-${  paramEndDate.getDate()}`;
            }

            return $http
                .post('bookingAffiliate/deleteAdditionalTime', {
                    affiliateId,
                    startDate: paramStartDate,
                    endDate: paramEndDate,
                })
                .then((response) => response.data);
        };

        service.getSmsTemplate = function (id) {
            return $http.get('bookingAffiliate/getSmsTemplate', { params: { id } }).then((response) => response.data);
        };

        service.addSmsTemplate = function (affiliateId, status, text, enabled) {
            return $http
                .post('bookingAffiliate/addSmsTemplate', {
                    affiliateId,
                    status,
                    text,
                    enabled,
                })
                .then((response) => response.data);
        };

        service.updateSmsTemplate = function (id, affiliateId, status, text, enabled) {
            return $http
                .post('bookingAffiliate/updateSmsTemplate', {
                    id,
                    affiliateId,
                    status,
                    text,
                    enabled,
                })
                .then((response) => response.data);
        };
    };

    bookingAffiliateService.$inject = ['$http'];

    ng.module('bookingAffiliate').service('bookingAffiliateService', bookingAffiliateService);
})(window.angular);
