(function (ng) {
    const ModalSalesChannelsCtrl = function (
        $http,
        $window,
        SweetAlert,
        toaster,
        $timeout,
        domService,
        $sce,
        $document,
        $translate,
        $uibModalInstance,
    ) {
        const ctrl = this;

        ctrl.$onInit = function () {
            if (ctrl.$resolve.data != null) {
                if (ctrl.$resolve.data.selectedChannelTypeStr != null) {
                    ctrl.externalChannelTypeStr = ctrl.$resolve.data.selectedChannelTypeStr;
                }
                ctrl.closeOnComplete = ctrl.$resolve.data.closeOnComplete === true;
            }
            $timeout(() => {
                ctrl.scrollableElement = document.querySelector('.simple-modal__body');
            }, 0);

            ctrl.getList();
            ctrl.isLoadCarousel = false;
        };

        ctrl.close = function () {
            $uibModalInstance.dismiss('cancel');
        };

        ctrl.closeDetails = function () {
            ctrl.closeDetailsChannel = false;
        };

        ctrl.openDetails = function () {
            ctrl.closeDetailsChannel = true;
        };
        /* не стал делать через ng-class т.к. быстрее отрабатывает (перед отработкой angular)*/
        ctrl.resetCSSClases = function (element) {
            element.classList.remove('show-details-channel');
            element.classList.remove('hide-details-channel');
        };

        ctrl.addHideCSSClass = function (element) {
            element.classList.add('hide-details-channel');
            element.classList.remove('show-details-channel');
        };

        ctrl.addShowCSSClass = function (element) {
            element.classList.add('show-details-channel');
            element.classList.remove('hide-details-channel');
        };
        /**/
        ctrl.changeSaleChannel = function (event, item) {
            if (event != null) {
                if (ctrl.scrollableElement) {
                    ctrl.scrollChosenSale = ctrl.scrollableElement.scrollTop;
                    ctrl.scrollableElement.scrollTop = 0;
                }
            }
            ctrl.selectedChannel = item;
            ctrl.closeDetails();
        };

        ctrl.hiddenAnimatedElements = function (event, scope) {
            const element = scope.element[0];
            if (event.target !== element) {
                return;
            }

            if (ctrl.closeDetailsChannel) {
                ctrl.addHideCSSClass(element);
                $timeout(() => {
                    ctrl.selectedChannel = null;
                    ctrl.isLoadCarousel = false;
                }, 0);
            } else {
                ctrl.addShowCSSClass(element);
            }
        };

        ctrl.showAnimatedElements = function (event, scope) {
            const element = scope.element[0];
            if (event.target !== element) {
                return;
            }
            ctrl.resetCSSClases(element);
            $timeout(() => {
                if (ctrl.scrollableElement) {
                    if (ctrl.closeDetailsChannel) {
                        ctrl.scrollableElement.scrollTop = ctrl.scrollChosenSale;
                    } else {
                        ctrl.isLoadCarousel = true;
                    }
                }
            }, 0);
        };

        ctrl.addSaleChannel = function () {
            ctrl.addIsLoading = true;

            if (ctrl.selectedChannel.Type == 'Module') {
                //  && ctrl.selectedChannel.Details.Price == 0

                const data = {
                    stringId: ctrl.selectedChannel.ModuleStringId,
                    id: ctrl.selectedChannel.ModuleId,
                    version: ctrl.selectedChannel.ModuleVersion,
                    active: true,
                };

                $http.post('modules/installModule', data).then((response) => {
                    if (response.data.result === true) {
                        $window.location = response.data.obj;
                        toaster.pop('success', '', 'Канал продаж установлен');
                    } else {
                        toaster.pop('error', '', $translate.instant('Admin.Js.Modules.ErrorInstallingModule'));
                        ctrl.addIsLoading = false;
                    }
                });
            } else {
                $http
                    .post('salesChannels/add', {
                        type: ctrl.selectedChannel.Type,
                        moduleStringId: ctrl.selectedChannel.ModuleStringId,
                    })
                    .then((response) => {
                        const data = response.data;
                        if (data.result === true) {
                            if (ctrl.closeOnComplete) {
                                $uibModalInstance.close(true);
                            } else if (data.obj.url == null || ctrl.externalChannelTypeStr != null) {
                                $window.location.reload();
                            } else {
                                $window.location.assign(data.obj.url);
                            }
                            toaster.pop('success', '', 'Канал продаж установлен');
                        } else {
                            ctrl.addIsLoading = false;
                        }
                    });
            }
        };

        ctrl.removeSaleChannel = function () {
            SweetAlert.confirm('Вы уверены что хотите удалить канал?', {
                title: 'Удаление',
            }).then((result) => {
                if (result.value === true && !result.isDismissed) {
                    ctrl.removeIsLoading = true;

                    if (ctrl.selectedChannel.Type == 'Module') {
                        $http
                            .post('modules/uninstallModule', {
                                stringId: ctrl.selectedChannel.ModuleStringId,
                            })
                            .then((response) => {
                                if (response.data.result === true) {
                                    toaster.pop('success', '', 'Канал продаж удален');
                                    const basePath = document.getElementsByTagName('base')[0].getAttribute('href');
                                    $window.location.assign(basePath);
                                } else {
                                    ctrl.removeIsLoading = false;
                                }
                            });
                    } else {
                        $http
                            .post('salesChannels/delete', {
                                type: ctrl.selectedChannel.Type,
                                moduleStringId: ctrl.selectedChannel.ModuleStringId,
                            })
                            .then((response) => {
                                const data = response.data;
                                if (response.data.result === true) {
                                    if (data.obj != null && data.obj.url != null) {
                                        $window.location.assign(data.obj.url);
                                    } else {
                                        toaster.pop('success', '', 'Канал продаж удален');
                                        const basePath = document.getElementsByTagName('base')[0].getAttribute('href');
                                        $window.location.assign(basePath);
                                    }
                                } else {
                                    ctrl.removeIsLoading = false;
                                }
                            });
                    }
                }
            });
        };

        ctrl.getList = function () {
            $http.get('salesChannels/getList').then((response) => {
                ctrl.channels = response.data;

                ctrl.salesChannelsEnabled = ctrl.channels.filter((x) => x.Enabled);
                ctrl.salesChannelsNotEnabled = ctrl.channels.filter((x) => !x.Enabled);

                if (ctrl.externalChannelTypeStr != null) {
                    const items = ctrl.salesChannelsNotEnabled.filter((element) => {
                        if (element.TypeStr == ctrl.$resolve.data.selectedChannelTypeStr) {
                            return element;
                        }
                    });
                    if (items != null && items.length > 0) {
                        ctrl.changeSaleChannel(null, items[0]);
                    }
                }
            });
        };

        ctrl.backToMenu = function () {
            const iframeVideo = $document[0].getElementById('funnelVideo');
            if (iframeVideo) {
                iframeVideo.contentWindow.postMessage('{"event":"command","func":"' + 'stopVideo' + '","args":""}', '*');
            }
            ctrl.openDetails();
            // ctrl.selectedChannel = null;
            // $timeout(function () {
            //     ctrl.isLoadCarousel = false;
            // });
        };

        ctrl.getTrustVideoSrc = function (videoSrc) {
            return (ctrl.urlVideo = $sce.trustAsResourceUrl(`${videoSrc}?enablejsapi=1&version=3&playerapiid=funnelVideo`));
        };

        ctrl.setIsRenderedImages = function (typeData) {
            if (typeData === 'images') {
                ctrl.isRenderedImages = true;
            } else if (typeData === 'videos') {
                ctrl.isRenderedVideos = true;
            }
        };
    };

    ModalSalesChannelsCtrl.$inject = [
        '$http',
        '$window',
        'SweetAlert',
        'toaster',
        '$timeout',
        'domService',
        '$sce',
        '$document',
        '$translate',
        '$uibModalInstance',
    ];

    ng.module('modalSalesChannels', [])
        .controller('ModalSalesChannelsCtrl', ModalSalesChannelsCtrl)
        .directive('animationObserver', () => ({
            restrict: 'A',
            scope: {
                animationend: '&',
                animationstart: '&',
            },
            link(scope, element) {
                const eventsEnd = 'animationend webkitAnimationEnd MSAnimationEnd transitionend webkitTransitionEnd';
                const eventsStart = 'animationstart transitionstart webkitTransitionStart';
                scope.element = element;
                if (scope.animationend != null) {
                    element.on(eventsEnd, (event) => {
                        scope.animationend({ event, scope });
                    });
                }

                if (scope.animationstart != null) {
                    element.on(eventsStart, (event) => {
                        scope.animationstart({
                            event,
                            scope,
                        });
                    });
                }

                scope.$on('$destroy', () => {
                    element.off(eventsEnd);
                    element.off(eventsStart);
                });
            },
        }));
})(window.angular);
