(function (ng) {
    

    const ModalViewEmailCtrl = function ($uibModalInstance, $http, toaster) {
        const ctrl = this;

        ctrl.$onInit = function () {
            ctrl.id = ctrl.$resolve.id;

            if (ctrl.id != null) {
                ctrl.getEmail();
            }
        };

        ctrl.close = function () {
            $uibModalInstance.dismiss('cancel');
        };

        ctrl.getEmail = function () {
            $http.get('emailings/getEmail', { params: { id: ctrl.id } }).then((response) => {
                ctrl.email = response.data;
                ctrl.addHtmlBody();
            });
        };

        ctrl.addHtmlBody = function () {
            if (ctrl.email.Message == null) return;

            // add email in iframe
            const iframe = document.getElementById('emailBody');
            iframe.style.display = 'block';

            let doc = iframe.document;
            if (iframe.contentDocument) {
                doc = iframe.contentDocument;
            } else if (iframe.contentWindow) {
                doc = iframe.contentWindow.document;
            }
            doc.open();
            doc.writeln(ctrl.email.Message);
            doc.close();

            // add style to break long words
            const css = '* {word-break: break-word;} html {font-family: arial, sans-serif;font-size: 14px;} pre {white-space: pre-wrap;}',
                head = doc.head || doc.getElementsByTagName('head')[0],
                style = doc.createElement('style');

            style.type = 'text/css';
            if (style.styleSheet) {
                style.styleSheet.cssText = css;
            } else {
                style.appendChild(document.createTextNode(css));
            }
            head.appendChild(style);

            // set iframe height
            setTimeout(() => {
                iframe.style.height = `${iframe.contentWindow.document.body.offsetHeight + 30  }px`;
            }, 150);
        };
    };

    ModalViewEmailCtrl.$inject = ['$uibModalInstance', '$http', 'toaster'];

    ng.module('uiModal').controller('ModalViewEmailCtrl', ModalViewEmailCtrl);
})(window.angular);
