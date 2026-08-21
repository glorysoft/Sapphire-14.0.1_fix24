import videoFileUploaderTemplate from './video-file-uploader.html';

const videoFileUploader = () => ({
    restrict: 'A',
    transclude: true,
    controller: 'VideoFileUploaderCtrl',
    bindToController: true,
    controllerAs: 'videoFileUploader',
    templateUrl: videoFileUploaderTemplate,
    scope: {
        settings: '<',
        pattern: '<?',
        accept: '@',
        upload: '&',
        showProgress: '<?',
        drop: '<?',
        dropSize: '<?',
        uploadUrl: '@',
        deleteUrl: '@',
        urlListVideo: '@',
        folderPath: '@',
        multiple: '<?',
        autoload: '<?',
        onUpdate: '&',
        onDelete: '&',
    },
    link(_scope, _element, _attrs, ctrl) {
        ctrl.pattern ??= 'video/mp4';
        ctrl.accept ??= '.mp4';
        ctrl.dropSize ??= {
            width: 200,
            height: 300,
        };
    },
});

export { videoFileUploader };
