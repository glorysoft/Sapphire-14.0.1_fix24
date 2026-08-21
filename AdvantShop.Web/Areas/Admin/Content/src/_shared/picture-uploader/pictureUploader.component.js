import pictureUploaderTemplate from './templates/picture-uploader.html';

(function (ng) {
    

    ng.module('pictureUploader').directive(
        'pictureUploader',
        /* @ngInject */
        ($templateRequest, urlHelper, $compile) => ({
                bindToController: true,
                controllerAs: '$ctrl',
                transclude: true,
                controller: 'PictureUploaderCtrl',
                scope: {
                    startSrc: '@',
                    pictureId: '@',
                    uploadUrl: '@',
                    uploadParams: '<?',
                    deleteUrl: '@',
                    deleteParams: '<?',
                    uploadbylinkUrl: '@',
                    uploadbylinkParams: '<?',
                    onUpdate: '&',
                    onDelete: '&',
                    onInit: '&',
                    startPictureId: '@',
                    uploaderDestination: '@', //название input type=file для тестов
                    fileTypes: '<?', //вариант из pictureUploaderFileTypes
                    onStartAction: '&' //колбэк, который вызывается при клике на действие компонента
                },
                link (scope, element, attrs, ctrl, transclude) {
                    $templateRequest(pictureUploaderTemplate).then((tpl) => {
                        const fragment = document.createDocumentFragment();
                        const innerEl = document.createElement('div');
                        innerEl.innerHTML = tpl;
                        const clone = transclude().clone();
                        const transcludeBlock = innerEl.querySelector('.transclude-block');
                        for (let i = 0; i < clone.length; i++) {
                            fragment.appendChild(clone[i]);
                        }
                        transcludeBlock.appendChild(fragment);

                        const buttonAdd = innerEl.querySelector('.picture-uploader-buttons-add');
                        buttonAdd.setAttribute('data-e2e', `imgAdd${  ctrl.uploaderDestination}`);
                        $compile(element.html(innerEl).contents())(scope);
                    });
                },
            }),
    );
})(window.angular);
