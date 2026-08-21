import socialTemplate from '../templates/partials/_social.html';
import carouselTemplate from '../templates/partials/_carousel.html';
import generalRightTemplate from '../templates/partials/_general-right.html';
import generalTemplate from '../templates/partials/_general.html';
import blocks from '../templates/blocks/blocks.js';
(function (ng) {

    /* @ngInject */
    const BlocksConstructorCtrl = function (
        $window,
        modalService,
        blocksConstructorService,
        Upload,
        toaster,
        $q,
        $element,
        $transclude,
        $translate,
        $scope,
        tabsService,
        $timeout,
        $location,
    ) {
        const ctrl = this;

        ctrl.$onInit = function () {
            ctrl.isMobile = window.matchMedia('(max-width: 768px)').matches;

            ctrl.modalSettingsBlockData = {};
            ctrl.modalAddSubblockData = {};

            blocksConstructorService.getBlockConstructorContainer(ctrl.blockId).then((blocksConstructorContainerCtrl) => {
                ctrl.blocksConstructorContainerCtrl = blocksConstructorContainerCtrl;
            });

            if (ctrl.templateCustom) {
                $transclude($scope, (clone, scope) => {
                    scope.blocksConstructor = ctrl;
                    $element.html(clone);
                });
            }
        };

        ctrl.addBlock = function (top) {
            const parentData = {
                modalData: {
                    landingpageId: ctrl.landingpageId,
                    blockId: ctrl.blockId,
                    sortOrder: ctrl.sortOrder,
                    onApplyNewBlock: function onApplyNewBlock(blockName, sortOrder, top, blockId) {
                        blocksConstructorService
                            .addBlock(ctrl.landingpageId, blockName, sortOrder, null, top, blockId)
                            .then((response) => {
                                if (response.result === true) {
                                    $window.location.reload();
                                } else {
                                    return $q.reject($translate.instant('Admin.Js.Langings.BlocksConstructor.ErrorAddingBlock'));
                                }
                            })
                            .catch((err) => {
                                toaster.error($translate.instant('Admin.Js.Langings.BlocksConstructor.ErrorAddingBlock'));
                            });
                    },
                    onApplyByCategories: function onApplyByCategories(blocks, sortOrder, top, blockId) {
                        blocksConstructorService
                            .addListBlock(ctrl.landingpageId, blocks, sortOrder, null, top, blockId)
                            .then((response) => {
                                if (response.result === true) {
                                    $window.location.reload();
                                } else {
                                    return $q.reject($translate.instant('Admin.Js.Langings.BlocksConstructor.ErrorAddingBlocks'));
                                }
                            })
                            .catch((err) => {
                                toaster.error($translate.instant('Admin.Js.Langings.BlocksConstructor.ErrorAddingBlocks'));
                            });
                    },
                    onRemoveByCategories (category) {
                        blocksConstructorService
                            .removeAllBlockByCategory(ctrl.landingpageId, category)
                            .then((response) => {
                                if (response.result === true) {
                                    $window.location.reload();
                                } else {
                                    return $q.reject($translate.instant('Admin.Js.Langings.BlocksConstructor.ErrorDeletingBlocks'));
                                }
                            })
                            .catch((err) => {
                                toaster.error($translate.instant('Admin.Js.Langings.BlocksConstructor.ErrorDeletingBlocks'));
                            });
                    },
                    top,
                    experemental: $window.location.search.indexOf('addexp') !== -1,
                },
            };

            if (modalService.hasModal('modalNewBlock') === false) {
                modalService.renderModal(
                    'modalNewBlock',
                    '{{(\'Admin.Js.Landings.BlocksConstructor.Controllers.Constructor.AddNewBlock\'|translate)}}',
                    '<blocks-constructor-modal-new-block data-modal-data="modalData" data-on-apply="modalData.onApplyNewBlock(blockName, sortOrder, top, blockId)" data-on-apply-by-categories="modalData.onApplyByCategories(blocks, sortOrder, top, blockId)" experemental="modalData.experemental" on-remove-by-categories="modalData.onRemoveByCategories(categoryName)" />',
                    null,
                    {
                        modalClass: 'blocks-constructor-modal blocks-constructor-modal-new-item',
                        modalOverlayClass: 'blocks-constructor-modal-new-item-overlay',
                    },
                    parentData,
                );
            }

            modalService.getModal('modalNewBlock').then((modal) => {
                modal.modalScope.open();
            });
        };

        ctrl.showOptionsBlock = function (tabId) {
            ctrl.blocksConstructorContainerCtrl.getData().then((blockOptions) => {
                const modalId = `modalSettingsBlock_${  ctrl.blockId}`;

                const backup = ng.copy(blockOptions);

                ctrl.addCallback = function (callback) {
                    ctrl.callback = callback;
                };

                ctrl.modalSettingsBlockData.data = {
                    modalData: {
                        disallowSave: false,
                        applySettingsInProcess: false,
                        landingpageId: ctrl.landingpageId,
                        blockId: ctrl.blockId,
                        name: ctrl.name,
                        type: ctrl.type,
                        sortOrder: ctrl.sortOrder,
                        settings: blockOptions.Settings,
                        data: blockOptions,
                        templateUrlByType: blocks.get(ctrl.type),
                        generalOptionsTemplateUrl: generalTemplate,
                        generalRightOptionsTemplateUrl: generalRightTemplate,
                        carouselOptionsTemplateUrl: carouselTemplate,
                        socialTemplateUrl: socialTemplate,
                        uploadFileBackground: ctrl.uploadFileBackground,
                        addCallback: ctrl.addCallback,
                        onApplySettings: function onApplySettings(blockId, data, modalData) {
                            modalData.applySettingsInProcess = true;

                            const videoSettings = data.Subblocks.find((elem) => elem.Name === 'video') || null;

                            if (videoSettings && videoSettings.Settings) {
                                if (videoSettings.Settings.VideoMode === 'Code') {
                                    const codeVideoSrc = ctrl.getSrcFromIframe(videoSettings.Settings.codeVideo);
                                    videoSettings.Settings.codeVideoSrc = codeVideoSrc;
                                }

                                if (videoSettings.Settings.VideoMode === 'Link') {
                                    const urlVid = videoSettings.Settings.urlVideo;

                                    if (urlVid.indexOf('src') > 0) {
                                        videoSettings.Settings.urlVideo = ctrl.getSrcFromIframe(urlVid);
                                    } else if (urlVid.indexOf('youtube') > 0 || urlVid.indexOf('youtu.be') > 0) {
                                            const id = ctrl.getYTVideoId(urlVid);

                                            const splitedParams = urlVid.split('?');

                                            const params = splitedParams.length > 1 ? `?${  urlVid.split('?')[1]}` : '';

                                            videoSettings.Settings.urlVideo = `https://www.youtube.com/embed/${  id  }${params}`;
                                        } else if (urlVid.indexOf('vkvideo') > 0 || urlVid.indexOf('vk.com') > 0) {
                                            videoSettings.Settings.urlVideo = ctrl.getVKVideoString(urlVid);
                                        } else {
                                            videoSettings.Settings.urlVideo = ctrl.getVideoString(urlVid);
                                        }
                                }
                            }

                            $q.when(ctrl.callback != null ? ctrl.callback(data) : true)
                                .then(() => {
                                    if (modalData.pictureLoaderSaveFn != null) {
                                        return modalData.pictureLoaderSaveFn();
                                    }

                                    return true;
                                })
                                .then(() => blocksConstructorService.saveBlockSettings(blockId, data))
                                .then((response) => {
                                    if (response.result === true) {
                                        $window.location.hash = `#block_${  blockId}`;
                                        $window.location.reload(true);
                                    } else {
                                        toaster.error($translate.instant('Admin.Js.Langings.BlocksConstructor.ErrorWhenApplyingSettings'));
                                    }

                                    //if (ctrl.blocksConstructorContainerCtrl.callbacks != null) {
                                    //    ctrl.blocksConstructorContainerCtrl.callbacks();
                                    //}
                                })
                                .catch(() => {
                                    toaster.error($translate.instant('Admin.Js.Langings.BlocksConstructor.ErrorWhenApplyingSettings'));
                                })
                                .finally(() => {
                                    modalData.applySettingsInProcess = false;
                                });
                        },
                        onCancel: function onCancel() {
                            //if (ctrl.modalSettingsBlockData.data.modalData.settings.background_settings != null && ctrl.modalSettingsBlockData.data.modalData.settings.background_settings.parallax) {
                            //    $('#block_' + ctrl.blockId + '_inner').enllax('destroy');
                            //}
                            blockOptions = ng.extend(blockOptions, backup);
                        },
                        colorSchemeList: blocksConstructorService.getColorSchemeList(),
                        onModalClose () {
                            $timeout(() => $location.hash(''));
                        },
                    },
                };
                //if (modalService.hasModal(modalId) === false) {
                modalService.renderModal(
                    modalId,
                    '{{(\'Admin.Js.Langings.BlocksConstructor.BlockSettings\'|translate)}}',
                    '<blocks-constructor-modal-settings-block data-modal-data="modalData" data-on-apply="modalData.onApplySettings(blockId, data)" data-on-upload-file-background="modalData.onUploadFileBackground($file)" data-on-update-file-background="modalData.onUpdateFileBackground(result, data, file)" data-on-delete-file-background="modalData.onDeleteFileBackground()" data-on-cancel="modalData.onCancel()" in-progress="modalData.disallowSave" />',
                    '<button type="button" ladda="modalData.applySettingsInProcess" class="blocks-constructor-btn-confirm" data-e2e="SaveSettingsBtn" data-button-validation data-button-validation-success="modalData.onApplySettings(modalData.blockId, modalData.data, modalData)" ng-disabled="modalData.disallowSave">{{(\'Admin.Js.Landings.BlocksConstructor.Controllers.Constructor.Save\'|translate)}}</button><input type="button" class="blocks-constructor-btn-cancel blocks-constructor-btn-mar" data-e2e="CancelSettingsBtn" data-modal-close="" data-modal-close-callback="modalData.onCancel()" value="{{(\'Admin.Js.Landings.BlocksConstructor.Controllers.Constructor.Cancel\'|translate)}}" />',
                    {
                        modalClass: 'blocks-constructor-modal',
                        modalOverlayClass: 'blocks-constructor-modal-floating-wrap blocks-constructor-modal--settings',
                        isFloating: true,
                        backgroundEnable: false,
                        destroyOnClose: true,
                        closeEsc: false,
                        callbackClose: 'modalData.onModalClose()',
                    },
                    ng.extend($scope, ctrl.modalSettingsBlockData.data),
                );
                //}

                modalService.getModal(modalId).then((modal) => {
                    modal.modalScope.open();

                    if (tabId != null) {
                        $timeout(() => {
                            tabsService.change(tabId);
                        }, 100);
                    }
                });
            });
        };

        ctrl.moveUpBlock = function () {
            blocksConstructorService
                .saveBlockSortOrder(ctrl.blockId, true)
                .then((response) => {
                    if (response.result === true) {
                        ctrl.blocksConstructorContainerCtrl.moveUpBlock();
                    } else {
                        toaster.error($translate.instant('Admin.Js.Langings.BlocksConstructor.ErrorWhenMovingBlock'));
                    }
                })
                .catch(() => {
                    toaster.error($translate.instant('Admin.Js.Langings.BlocksConstructor.ErrorWhenMovingBlock'));
                });
        };

        ctrl.moveDownBlock = function () {
            blocksConstructorService
                .saveBlockSortOrder(ctrl.blockId, false)
                .then((response) => {
                    if (response.result === true) {
                        ctrl.blocksConstructorContainerCtrl.moveDownBlock();
                    } else {
                        alert($translate.instant('Admin.Js.Langings.BlocksConstructor.ErrorWhenMovingBlockDown'));
                    }
                })
                .catch(() => {
                    toaster.error($translate.instant('Admin.Js.Langings.BlocksConstructor.ErrorWhenMovingBlockDown'));
                });
        };

        ctrl.removeBlock = function () {
            blocksConstructorService
                .removeBlock(ctrl.blockId)
                .then((response) => {
                    if (response.result === true) {
                        ctrl.blocksConstructorContainerCtrl.removeBlock();
                    } else {
                        toaster.error($translate.instant('Admin.Js.Langings.BlocksConstructor.ErrorDeletingBlock'));
                    }
                })
                .catch(() => {
                    toaster.error($translate.instant('Admin.Js.Langings.BlocksConstructor.ErrorDeletingBlock'));
                });
        };

        ctrl.getYTVideoId = function (url) {
            if (url.indexOf('watch') > 0 || url.indexOf('embed') > 0 || url.indexOf('shorts') > 0) {
                return url.match(/(youtu.*be.*)\/(watch\?v=|embed\/|v|shorts|)(.*?((?=[&#?])|$))/)[3];
            }
            return url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/)[1];
        };

        ctrl.getVideoString = function (url) {
            if (url.indexOf('src') > 0) {
                return ctrl.getSrcFromIframe(url);
            }

            if (url.indexOf('shorts') > 0) {
                return url.replace(/shorts/g, 'video');
            }

            return url;
        };

        ctrl.getSrcFromIframe = function (url) {
            const regex = /<iframe\s+[^>]*src="([^"]*)"[^>]*><\/iframe>/i;
            const match = url.match(regex);

            if (match && match[1]) {
                return match[1];
            }

            return false;
        };

        ctrl.getVKVideoString = function (url) {
            if (url.indexOf('src') > 0) {
                return ctrl.getSrcFromIframe(url);
            }

            if (url.indexOf('oid') < 0 || url.indexOf('id') < 0) {
                const regex1 = /(?:video|clip)-(\d+)_/;
                const match1 = url.match(regex1);
                const regex2 = /_(\d+)$/;
                const match2 = url.match(regex2);
                let number1, number2;

                if (match1) {
                    number1 = match1[1];
                }

                if (match2) {
                    number2 = match2[1];
                }

                return 'https://' + `vk.com/video_ext.php?oid=-${number1}&id=${number2}&hd=2`;
            }

            return url;
        };
    };

    ng.module('blocksConstructor').controller('BlocksConstructorCtrl', BlocksConstructorCtrl);
})(window.angular);
