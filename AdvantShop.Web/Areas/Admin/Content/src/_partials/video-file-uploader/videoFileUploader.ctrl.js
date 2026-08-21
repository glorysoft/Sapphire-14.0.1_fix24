/* @ngInject */
export default function VideoFileUploaderCtrl(
    $http,
    Upload,
    toaster,
    SweetAlert,
    $translate,
) {
    const ctrl = this;

    ctrl.$onInit = function() {
        if (ctrl.urlListVideo != null) {
            ctrl.getVideoList(ctrl.urlListVideo).then((result) => {
                ctrl.videoList = result;
            });
        }
        ctrl.disabledLoadBtn = true;
    };

    ctrl.load = function($files, $file, $newFiles, $duplicateFiles, $invalidFiles, $event) {
        ctrl.fileName = $file.name;
        ctrl.file = $file;
        ctrl.disabledLoadBtn = false;

        if (ctrl.autoload && $file) {
            ctrl.submit($file);
        }
    };

    ctrl.submit = function(file) {
        if (file != null) {
            Upload.upload({
                url: ctrl.uploadUrl,
                data: { file, rnd: Math.random() },
            }).then(
                (resp) => {
                    if (resp.data.result === false) {
                        resp.data.errors.forEach((e) => {
                            toaster.pop('error', '', e);
                        });
                        return;
                    }
                    ctrl.disabledLoadBtn = true;
                    ctrl.fileName = null;
                    ctrl.file = null;
                    ctrl.settings.urlVideo = resp.data.obj;
                    if (ctrl.onUpdate != null) {
                        ctrl.onUpdate({ result: resp.data || {} });
                    }
                    toaster.pop('success', '', $translate.instant('Admin.Js.VideoFileUploader.VideoSuccessfullyUploaded'));
                    return ctrl.getVideoList(ctrl.urlListVideo).then((result) => (ctrl.videoList = result));
                },
                (resp) => {
                    toaster.pop('error', '', $translate.instant('Admin.Js.VideoFileUploader.FailedToLoadVideo'));
                },
                (evt) => {
                    ctrl.progressPercentage = parseInt((100.0 * evt.loaded) / evt.total);
                    if (ctrl.progressPercentage === 100) {
                        ctrl.progressPercentage = -1;
                    }
                },
            );
        }
    };

    ctrl.onDeleteVideo = function(url, name) {
        SweetAlert.alert($translate.instant('Admin.Js.VideoFileUploader.AreYouSureDeleteVideo'), {
            title: '',
            showCancelButton: true,
        }).then((result) => {
            if (result === true || result.value === true) {
                ctrl.deleteVideo(url, name).then((response) => {
                    if (response.result === true) {
                        toaster.pop('success', '', $translate.instant('Admin.Js.VideoFileUploader.VideoSuccessfullyDeleted'));

                        if (ctrl.folderPath + name == ctrl.settings.urlVideo) {
                            ctrl.settings.urlVideo = '';
                        }

                        ctrl.getVideoList(ctrl.urlListVideo).then((result) => {
                            ctrl.videoList = result;
                        });

                        if (ctrl.onDelete != null) {
                            ctrl.onDelete({ result: response.data || {} });
                        }
                    }
                });
            }
        });
    };

    ctrl.getVideoList = function(url) {
        return $http
            .get(url, { params: { rnd: Math.random() } })
            .then((response) => response.data)
            .catch((error) => {
                console.error(error);
            });
    };

    ctrl.deleteVideo = function(url, name) {
        return $http
            .post(url, { name, rnd: Math.random() })
            .then((response) => response.data)
            .catch((error) => {
                console.error(error);
            });
    };
}
