; (function (ng) {

    'use strict';

    var RADShowNFCtrl = function ($http, $sce, toaster, productService, modalService) {
        var ctrl = this;

        ctrl.form = {};
        ctrl.FormRequest = {};
        var modalsStorage = {};

        ctrl.$onInit = function () {
            ctrl.currentPage = 'main';
            ctrl.FormRequest.ProductOfferId = productService.getProduct().offerSelected.ArtNo;
            ctrl.FormRequest.ProductId = productService.getProduct().productId;
            ctrl.FormRequest.SendNotification = false;
            ctrl.showNotificationForm();
        };
        
        ctrl.$postLink = function (){
            if (document.documentElement.classList.contains('is-mobile') === false) {
                const RADbutton = document.querySelector('#RemindDiscountModuleShowNotificationFormBlock');
                if (RADbutton != null) {
                    RADbutton.style.marginLeft = '10px';
                    RADbutton.style.marginBottom = '10px';

                    let elButtonBlock = document.querySelector('.details-payment .details-payment-price');
                    if (elButtonBlock != null){
                        elButtonBlock.append(RADbutton);
                    }
                }
            }
        }

        ctrl.showNotificationForm = function () {
            $http.get('landingrarclient/getRadNotificationForm').then(function success(response) {
                ctrl.form = response.data.Form;
                ctrl.form.ImagePath = response.data.Form.ImagePath;
                ctrl.form.TextForUser = response.data.Form.TextForUser;
                ctrl.form.HeaderForm = $sce.trustAsHtml(ctrl.form.FormHeader);
                ctrl.form.ShowCommentInForm = response.data.Form.ShowCommentInForm;
                ctrl.form.ShowEmailInForm = response.data.Form.ShowEmailInForm;
                ctrl.form.ShowNameInForm = response.data.Form.ShowNameInForm;
                ctrl.form.ShowSurnameInForm = response.data.Form.ShowSurnameInForm;
                ctrl.form.ShowPhoneNumberInForm = response.data.Form.ShowPhoneNumberInForm;
                ctrl.form.AfterFormTextForUser = $sce.trustAsHtml(ctrl.form.AfterFormTextForUser);

                ctrl.FormRequest.Email = ctrl.form.Email;
                ctrl.FormRequest.Name = ctrl.form.FirstName;
                ctrl.FormRequest.Surname = ctrl.form.LastName;
                ctrl.FormRequest.PhoneNumber = ctrl.form.Phone;
                ctrl.form.IsShowUserAgreementText = response.data.Form.IsShowUserAgreementText;
                ctrl.form.UserAgreementText = response.data.Form.UserAgreementText;
            });
        };

        ctrl.validate = function () {
            if (ctrl.form.ShowEmailInForm === true &&
                (ctrl.FormRequest.Email === undefined || ctrl.FormRequest.Email === null || ctrl.FormRequest.Email === '')) {
                toaster.pop('error', '', 'Введите Email!');
                return false;
            }
            if (ctrl.form.ShowNameInForm === true &&
                (ctrl.FormRequest.Name === undefined || ctrl.FormRequest.Name === null || ctrl.FormRequest.Name === '')) {
                toaster.pop('error', '', 'Введите имя!');
                return false;
            }
            if (ctrl.form.ShowSurnameInForm === true &&
                (ctrl.FormRequest.Surname === undefined || ctrl.FormRequest.Surname === null || ctrl.FormRequest.Surname === '')) {
                toaster.pop('error', '', 'Введите фамилию!');
                return false;
            }
            if (ctrl.form.ShowPhoneNumberInForm === true &&
                (ctrl.FormRequest.PhoneNumber === undefined || ctrl.FormRequest.PhoneNumber === null || ctrl.FormRequest.PhoneNumber === '')) {
                toaster.pop('error', '', 'Введите номер телефона!');
                return false;
            }
            if (ctrl.form.IsShowUserAgreementText === true &&
                (ctrl.FormRequest.Agreement === undefined || ctrl.FormRequest.Agreement === false)){
                toaster.pop('error', '', 'Необходимо принять пользовательское соглашение!');
                return false;
            }
            return true;
        };

        ctrl.sending = function () {
            if (!ctrl.validate()) {
                return;
            }

            ctrl.FormRequest.SendNotification = false;
            ctrl.FormRequest.ProductOfferId = productService.getProduct().offerSelected.ArtNo;

            $http.post('landingrarclient/radsendinfo', { FormRequest: ctrl.FormRequest }).then(function success(response) {
                if (response.data === true) {
                    ctrl.currentPage = 'success';
                    toaster.pop('success', '', 'Ваша заявка успешно отправлена');
                } else {
                    toaster.pop('error', '', 'Не удалось отправить заявку');
                }
            });
        };
        
        ctrl.modalRender = function (parentScope, modalId) {
            modalService.renderModal(modalId,
                null,
                '<div data-ng-include="\'/modules/remindaboutreceipt/Content/Scripts/radShowNotificationForm/templates/radShowNotificationFormModal.html\'"></div>',
                null,
                {
                    'isOpen': false,
                    'backgroundEnable': true,
                    anchor: modalId,
                    'modalClass': 'rad-notification-modal'
                }, { radShowNF: parentScope });
            modalService.getModal(modalId).then(function (modal) {
                modal.modalScope.open();
            });
        };

        ctrl.modalOpen = function (modalId) {
            if (!modalsStorage[modalId]) {
                ctrl.modalRender(ctrl, modalId);
            } else {
                modalService.open(modalId);
            }
            modalsStorage[modalId] = modalId;
        };

        ctrl.modalClose = function (modalId) {
            modalService.close(modalId);
        };
    };

    RADShowNFCtrl.$inject = ['$http', '$sce', 'toaster', 'productService', 'modalService'];

    ng.module('RADShowNF', [])
        .controller('RADShowNFCtrl', RADShowNFCtrl)
        .component('radShowNF', {
            templateUrl: 'modules/RemindAboutReceipt/content/scripts/radShowNotificationForm/templates/radShowNotificationForm.html',
            controller: 'RADShowNFCtrl'
        });

})(window.angular);