import './pictureUploaderModal.html';

(function (ng) {
    
    const regexpUrlParams = '\\??[\\w\\d=&~_\\-\\!\\.\\,\\)\\(]*';
    const ModalPictureUploaderCtrl = function ($uibModalInstance, $window, $timeout) {
        const ctrl = this;

        ctrl.$onInit = function () {
            const allowExts = ctrl.$resolve?.options?.allowExts;
            if (ctrl.$resolve != null && allowExts?.length) {
                ctrl.pattern = new RegExp(`https?://.*.(?:${  allowExts.join('|')  })${  regexpUrlParams}`, 'i');
            } else {
                ctrl.pattern = new RegExp(`https?://.*.(?:jpg|gif|png|jpeg)${  regexpUrlParams}`, 'i');
            }
        };

        ctrl.save = function (url) {
            $uibModalInstance.close(url);
        };

        ctrl.dismiss = function () {
            $uibModalInstance.dismiss('cancel');
        };
        //to do: ngModel не обновляется если мы вставили текст в поле через контекстное меню мышкой
        ctrl.pasteUrl = function ($event) {
            const paste =
                $event.originalEvent.clipboardData && $event.originalEvent.clipboardData.getData
                    ? $event.originalEvent.clipboardData.getData('text/plain') // Standard
                    : $window[0].clipboardData && $window[0].clipboardData.getData
                      ? $window[0].clipboardData.getData('Text') // MS
                      : null;

            $timeout(() => {
                ctrl.url = paste;
            });
        };
    };

    ModalPictureUploaderCtrl.$inject = ['$uibModalInstance', '$window', '$timeout'];

    ng.module('uiModal').controller('ModalPictureUploaderCtrl', ModalPictureUploaderCtrl);
})(window.angular);
