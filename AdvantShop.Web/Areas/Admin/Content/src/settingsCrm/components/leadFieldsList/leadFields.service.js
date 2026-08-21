(function (ng) {
    

    const leadFieldsService = function ($http, uiGridConstants) {
        const service = this;

        service.getLeadFields = function (salesFunnelId, onlyEnabled) {
            return $http
                .get('leadFields/getLeadFields', {
                    params: { salesFunnelId, onlyEnabled, rnd: Math.random() },
                })
                .then((response) => response.data);
        };

        service.changeLeadFieldSorting = function (salesFunnelId, id, prevId, nextId) {
            return $http
                .post('leadFields/changeLeadFieldSorting', {
                    salesFunnelId,
                    id,
                    prevId,
                    nextId,
                })
                .then((response) => response.data);
        };

        service.getFormData = function () {
            return $http.get('leadFields/getFormData').then((response) => response.data);
        };

        service.getLeadField = function (id) {
            return $http.get('leadFields/get', { params: { id, rnd: Math.random() } }).then((response) => response.data);
        };

        service.deleteLeadField = function (id) {
            return $http.post('leadFields/delete', { id }).then((response) => response.data);
        };

        service.addOrUpdateLeadField = function (params) {
            const url = params.Id ? 'leadFields/update' : 'leadFields/add';
            return $http.post(url, params).then((response) => response.data);
        };

        service.inplaceLeadField = function (params) {
            return $http.post('leadFields/inplace', params).then((response) => response.data);
        };

        service.getFilterColumns = function (salesFunnelId) {
            return service.getLeadFields(salesFunnelId).then((data) => {
                const fields = data.obj,
                    columns = [];

                if (fields != null) {
                    for (let i = 0; i < fields.length; i++) {
                        const column = {
                            name: `_noopColumnLeadField_${  fields[i].Id}`,
                            displayName: fields[i].Name,
                            visible: false,
                            enableHiding: false,
                            filter: {
                                placeholder: fields[i].Name,
                                name: `LeadFields[${  fields[i].Id  }].Value`,
                            },
                        };
                        switch (fields[i].FieldType) {
                            case 0: // select
                                column.filter.type = uiGridConstants.filter.SELECT;
                                column.filter.fetch = `leadFields/getLeadFieldValues?id=${  fields[i].Id}`;
                                column.filter.name = `LeadFields[${  fields[i].Id  }].ValueExact`;
                                break;
                            case 2: // number
                                column.filter.type = 'range';
                                column.filter.rangeOptions = {
                                    from: { name: `LeadFields[${  fields[i].Id  }].From` },
                                    to: { name: `LeadFields[${  fields[i].Id  }].To` },
                                };
                                break;
                            case 4: // date
                                column.filter.type = 'date';
                                column.filter.term = {
                                    from: new Date(new Date().setMonth(new Date().getMonth() - 1)),
                                    to: new Date(),
                                };
                                column.filter.dateOptions = {
                                    from: { name: `LeadFields[${  fields[i].Id  }].DateFrom` },
                                    to: { name: `LeadFields[${  fields[i].Id  }].DateTo` },
                                };
                                break;
                            default:
                                column.filter.type = uiGridConstants.filter.INPUT;
                                break;
                        }
                        columns.push(column);
                    }
                }

                return columns;
            });
        };
    };

    leadFieldsService.$inject = ['$http', 'uiGridConstants'];

    ng.module('settingsCrm').service('leadFieldsService', leadFieldsService);
})(window.angular);
