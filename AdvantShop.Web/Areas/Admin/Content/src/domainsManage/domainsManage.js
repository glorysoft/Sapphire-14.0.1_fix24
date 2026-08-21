(function (ng) {
    

    const DomainsManageCtrl = function ($window, $document, $timeout, urlHelper, $scope) {
        const ctrl = this;

        ctrl.$onInit = function () {
            ctrl.switchOnDomainsManage();
            ctrl.addOnLoadIframe();

            if ($window.location.search == '?modal=open') {
                ctrl.connectYourDomain('#iframeDomainsManage');
            }
        };

        ctrl.$postLink = function () {
            ctrl.pageIsReady = true;

            const selectedValueDomainBinding = urlHelper.getUrlParamByName('selectedValueDomainBinding');
            if (selectedValueDomainBinding != null && selectedValueDomainBinding.length > 0) {
                ctrl.connectYourDomain('#iframeDomainsManage', selectedValueDomainBinding);
            }

            const openFunnelId = urlHelper.getUrlParamByName('openFunnel');
            if (openFunnelId != null && openFunnelId.length > 0) {
                ctrl.sendMessage('#iframeDomainsManage', 'openFunnel', openFunnelId);
            }
        };

        ctrl.switchOnDomainsManage = function (injectToNg) {
            ctrl.iframeType = 'domainsManage';
            if (injectToNg) {
                $scope.$digest();
            }
        };

        ctrl.switchOnPay = function () {
            ctrl.iframeType = 'pay';
            doPostMessageDeleteCallback('domainDataLoaded');
        };

        ctrl.connectYourDomain = function (iframeId, selectedValue) {
            if (ctrl.iframeType !== 'domainsManage') {
                ctrl.switchOnDomainsManage();
            }
            ctrl.togglePopover = false;

            $timeout(() => {
                doPostMessageWait('domainDataLoaded', () => {
                    doPostMessage($document[0].querySelector(iframeId), JSON.stringify({ name: 'connectYourDomain', selectedValue }));
                });
            }, 100);
        };

        ctrl.sendMessage = function (iframeId, name, selectedValue) {
            if (ctrl.iframeType !== 'domainsManage') {
                ctrl.switchOnDomainsManage();
            }

            $timeout(() => {
                doPostMessageWait('domainDataLoaded', () => {
                    doPostMessage($document[0].querySelector(iframeId), JSON.stringify({ name, selectedValue }));
                });
            }, 100);
        };

        ctrl.addOnLoadIframe = function () {
            window.onLoadIframeHandler = function () {
                ctrl.loadedIframe = true;
            };
        };
    };

    DomainsManageCtrl.$inject = ['$window', '$document', '$timeout', 'urlHelper', '$scope'];

    ng.module('domainsManage', []).controller('DomainsManageCtrl', DomainsManageCtrl);
})(window.angular);
