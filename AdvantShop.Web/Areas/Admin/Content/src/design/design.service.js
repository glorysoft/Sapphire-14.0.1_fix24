(function (ng) {
    

    const designService = function ($http, Upload, $q) {
        const service = this;

        service.getDesigns = function (params) {
            return $http
                .get(typeof params.stringid === 'undefined' ? 'design/getdesigns' : `design/getdesigns?stringId=${  params.stringid}`)
                .then((response) => response.data);
        };

        service.getThemes = function () {
            return $http.get('design/getThemes').then((response) => response.data);
        };

        service.saveDesign = function (designType, name) {
            return $http.post('design/savedesign', { designType, name }).then((response) => response.data);
        };

        service.uploadDesign = function (file, designType) {
            return Upload.upload({
                url: 'design/uploaddesign',
                data: {
                    file,
                    designType,
                    rnd: Math.random(),
                },
            }).then((response) => response.data);
        };

        service.deleteDesign = function (name, designType) {
            return $http.post('design/deletedesign', { name, designType }).then((response) => response.data);
        };

        service.previewTemplate = function (id, previewTemplateId) {
            return $http.post('design/previewtemplate', { id, previewTemplateId }).then((response) => response.data);
        };

        service.checkPage = function (url) {
            return $http.get(url, { rnd: Math.random() }).then((response) => response.data);
        };

        service.resizePictures = function () {
            return $http.post('design/resizePictures').then((response) => response.data);
        };

        service.resizeCategoryPictures = function (type) {
            return $http.post('design/resizeCategoryPictures', { type }).then((response) => response.data);
        };

        service.installTemplate = function (stringId, id, version) {
            return $http.post('design/installTemplate', { stringId, id, version }).then((response) => response.data);
        };

        service.updateTemplate = function (id) {
            return $http.post('design/updateTemplate', { id }).then((response) => response.data);
        };

        service.deleteTemplate = function (stringid) {
            return $http.post('design/deleteTemplate', { stringid }).then((response) => response.data);
        };

        service.enableStore = function (check) {
            if (!check) {
                return $q.resolve(null);
            }
            return $http.post('dashboard/changeEnabled', { id: -1, type: 0, enabled: true }).then((response) => response.data);
        };
    };

    designService.$inject = ['$http', 'Upload', '$q'];

    ng.module('design').service('designService', designService);
})(window.angular);
