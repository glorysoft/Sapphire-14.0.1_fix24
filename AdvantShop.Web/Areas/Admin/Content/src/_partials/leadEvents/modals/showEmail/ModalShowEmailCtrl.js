import './showEmail.html';
(function (ng) {
    

    /* @ngInject */
    const ModalShowEmailCtrl = function ($uibModalInstance, $http) {
        const ctrl = this;

        ctrl.$onInit = function () {
            const params = ctrl.$resolve.params;
            ctrl.id = params != null ? params.id : null;
            ctrl.folder = params != null ? params.folder : null;
            ctrl.emailData = params != null ? params.emailData : null;
            ctrl.customerId = params != null ? params.customerId : null;

            if (ctrl.id != null) {
                ctrl.getEmail();
            } else if (ctrl.emailData != null) {
                ctrl.getSendedEmail();
            }
        };

        ctrl.close = function () {
            $uibModalInstance.dismiss('cancel');
        };

        ctrl.onWriteAnswerClose = function () {
            $uibModalInstance.close();
        };

        ctrl.getEmail = function () {
            $http.get('crmEvents/getEmail', { params: { id: ctrl.id, folder: ctrl.folder } }).then((response) => {
                ctrl.email = response.data;
                ctrl.addHtmlBody();
            });
        };

        ctrl.getSendedEmail = function () {
            $http.get('crmEvents/getSendedEmail', { params: ctrl.emailData }).then((response) => {
                if (response.data != null) {
                    ctrl.email = response.data;
                    ctrl.addHtmlBody();
                }
            });
        };

        ctrl.addHtmlBody = function () {
            if (ctrl.email == null || ctrl.email.HtmlBody == null) return;

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
            doc.writeln(ctrl.email.HtmlBody);
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

    ng.module('uiModal').controller('ModalShowEmailCtrl', ModalShowEmailCtrl);
})(window.angular);
