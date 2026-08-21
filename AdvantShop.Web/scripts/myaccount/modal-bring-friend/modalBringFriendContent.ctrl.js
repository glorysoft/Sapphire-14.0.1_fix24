/* @ngInject */
const ModalBringFriendContentCtrl = function ($http, $translate, toaster) {
    const ctrl = this;

    ctrl.$onInit = () => {
        ctrl.getUrlForReferral();
    };

    ctrl.getUrlForReferral = function () {
        $http.get('myAccount/getUrlForReferral').then((response) => {
            if (response.data) {
                ctrl.urlReferralBringFriend = response.data;

                const url = new URL(response.data);
                ctrl.referralCode = url.searchParams.get('referralCode');
            } else {
                toaster.pop('error', $translate.instant('Js.MyAccount.CouldNotCopyLink'));
            }
        });
    };

    ctrl.copyToClipboard = function (elementId) {
        const input = document.getElementById(elementId);
        input.select();

        if (document.execCommand('copy')) {
            toaster.pop(
                'success',
                '',
                elementId.includes('url') ? $translate.instant('Js.MyAccount.LinkCopied') : $translate.instant('Js.MyAccount.CodeCopied'),
            );
        } else {
            toaster.pop('error', '', $translate.instant('Js.MyAccount.CouldNotCopyLink'));
        }
    };
};

export default ModalBringFriendContentCtrl;
