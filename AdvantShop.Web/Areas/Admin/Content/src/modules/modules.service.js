/* @ngInject */
const modulesService = function($http) {
    const service = this;

    service.getLocalModules = (params) =>
        $http.get('modules/getlocalmodules', { params })
            .then((response) => {
                if (response.data.result) {
                    return response.data.obj;
                }

                throw new Error('Failed to get local modules');
            });


    service.getMarketModules = (params) =>
        $http.get('modules/getmarketmodules', { params })
            .then((response) => {
                if (response.data.result) {
                    return response.data.obj;
                }

                throw new Error('Failed to get market modules');
            });

    service.updateModule = (stringId, id, version) =>
        $http.post('modules/updateModule', { stringId, id, version })
            .then((response) => {
                if (response.data.result) {
                    return;
                }

                if (typeof response.data?.errors !== 'undefined'
                    && response.data?.errors !== null
                    && response.data?.errors.length > 0) {
                    throw new Error(response.data.errors.join(' '));
                } else {
                    throw new Error('Error updating module');
                }
            });

    service.setPreviewShowed = (stringId) =>
        $http.post('modules/setPreviewShowed', { stringId })
            .then((response) => {
                if (response.data.result) {
                    return response.data.obj;
                }

                return null;
            });

    service.updateAllModules = (modules) =>
        $http.post('modules/updateAllModules', { modules })
            .then((response) => {
                if (response.data.result) {
                    return;
                }

                if (typeof response.data?.errors !== 'undefined'
                    && response.data?.errors !== null
                    && response.data?.errors.length > 0) {
                    throw new Error(response.data.errors.join(' '));
                } else {
                    throw new Error(`Error updating all modules`);
                }
            });

    service.uninstallModule = (stringId) =>
        $http.post('modules/uninstallModule', { stringId })
            .then((response) => {
                if (response.data.result) {
                    return;
                }

                if (typeof response.data?.errors !== 'undefined'
                    && response.data?.errors !== null
                    && response.data?.errors.length > 0) {
                    throw new Error(response.data.errors.join(' '));
                } else {
                    throw new Error('Error uninstall module');
                }
            });

    service.installModule = (stringId, id, version) =>
        $http.post('modules/installModule', { stringId, id, version })
            .then((response) => {
                if (response.data.result) {
                    return response.data.obj;
                }

                if (response.data?.errors != null
                    && response.data?.errors.length > 0) {
                    throw new Error(response.data.errors.join(' '));
                } else {
                    throw new Error(`Error install module`);
                }
            });

    service.changeEnabled = (stringId, enabled) =>
        $http.post('modules/changeEnabled', { stringId, enabled })
            .then((response) => {
                if (response.data.result) {
                    return response.data.obj;
                }

                if (typeof response.data?.errors !== 'undefined'
                    && response.data?.errors !== null
                    && response.data?.errors.length > 0) {
                    throw new Error(response.data.errors.join(' '));
                } else {
                    throw new Error(`Error install module`);
                }
            });
};

export default modulesService;
