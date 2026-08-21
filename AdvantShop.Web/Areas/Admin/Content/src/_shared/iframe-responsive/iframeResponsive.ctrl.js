(function (ng) {
    

    // в клиентке есть такой же файл
    const IframeResponsiveCtrl = function ($sce, iframeResponsiveService, $scope, $timeout) {
        let ctrl = this,
            stateChangeFlag = true;

        ctrl.showContent = function () {
            ctrl.isShowContent = true;
            if (ctrl.deviceMobile && ctrl.asBackground) {
                if (ctrl.useVimeo) {
                    const vimeoVideoId = iframeResponsiveService.getVideoIdFromVimeo(ctrl.src);
                    iframeResponsiveService.getVimeoCover(vimeoVideoId).then((response) => {
                        if (response.data != null) {
                            ctrl.coverVideoPath = response.data.thumbnail_url;
                        }
                    });
                } else if (ctrl.useYouTube) {
                    const YTVideoId = iframeResponsiveService.getVideoIdFromYouTube(ctrl.src);
                    ctrl.coverVideoPath = iframeResponsiveService.getYTCover(YTVideoId);
                }
            } else {
                if (ctrl.isPlayerCode) {
                    ctrl.playerCode = ctrl.src;
                } else {
                    ctrl.src = iframeResponsiveService.getSrc(ctrl.src);
                }

                if (ctrl.inModal === true) {
                    ctrl.pasteVideoForModal(ctrl.src);
                } else {
                    //$timeout(function () {
                    ctrl.pasteVideo(ctrl.src, ctrl.autoplay, ctrl.loop);
                    //}, 0);
                }
            }
        };

        ctrl.pasteVideoForModal = function (src) {
            ctrl.stopOthersVideo();
            ctrl.showVideo();
            ctrl.hideCover();
            if (ctrl.useYouTube) {
                src = iframeResponsiveService.getYouTubeCode(src, true);
            }
            if (ctrl.useVimeo) {
                src = iframeResponsiveService.getVimeoCode(src, true);
            }

            ctrl.iframeSrc = $sce.trustAsResourceUrl(src);
        };

        ctrl.onPlayerReady = function () {
            if (ctrl.autoplay) {
                ctrl.player.mute();
                ctrl.player.playVideo();
            }

            if (stateChangeFlag) {
                stateChangeFlag = false;
            }
        };

        ctrl.onPlayerStateChange = function (event) {
            ctrl.videoLoaded = true;
            if (event.data === -1) {
                ctrl.muteOn = true; // autoplay

                $timeout(() => {
                    ctrl.hideCover();
                }, 100);
            } else if (event.data === 1) {
                if (!ctrl.disabledStop) {
                    iframeResponsiveService.run(ctrl, 'youtube');
                }
            }
        };

        ctrl.showVideo = function () {
            ctrl.visibleVideo = true;
        };

        ctrl.hideVideo = function () {
            ctrl.visibleVideo = false;
        };

        ctrl.showCover = function () {
            ctrl.visibleCover = true;
        };

        ctrl.hideCover = function () {
            ctrl.visibleCover = false;
        };

        ctrl.stopOthersVideo = function () {
            if (!ctrl.disabledStop) {
                iframeResponsiveService.run(ctrl, 'vimeo');
                iframeResponsiveService.run(ctrl, 'youtube');
            }
        };

        ctrl.pasteYTIframeSrc = function (src, playerId, autoplay, loop) {
            const YTVideoId = iframeResponsiveService.getVideoIdFromYouTube(src);
            ctrl.coverVideoPath = iframeResponsiveService.getYTCover(YTVideoId);
            $timeout(() => {
                if (!iframeResponsiveService.checkInitYouTubeIframeAPI()) {
                    iframeResponsiveService
                        .addOnYouTubeIframeAPIReady()
                        .then(() => {
                            ctrl.player = iframeResponsiveService.getYTPlayerAPI(
                                playerId,
                                YTVideoId,
                                { onReady: ctrl.onPlayerReady, onStateChange: ctrl.onPlayerStateChange },
                                autoplay,
                                loop,
                            );
                        })
                        .catch((error) => {
                            console.error(error);
                        });
                } else {
                    ctrl.player = iframeResponsiveService.getYTPlayerAPI(
                        ctrl.playerId,
                        YTVideoId,
                        { onReady: ctrl.onPlayerReady, onStateChange: ctrl.onPlayerStateChange },
                        autoplay,
                    );
                }
            });
            const YTCode = iframeResponsiveService.getYouTubeCode(src, autoplay, YTVideoId, loop);
            ctrl.iframeSrc = $sce.trustAsResourceUrl(YTCode);
        };

        ctrl.pasteVimeoIframeSrc = function (src, playerId, autoplay, loop) {
            const vimeoVideoId = iframeResponsiveService.getVideoIdFromVimeo(src);

            iframeResponsiveService.getVimeoCover(vimeoVideoId).then((response) => {
                if (response.data != null) {
                    ctrl.coverVideoPath = response.data.thumbnail_url;
                }
            });
            $timeout(() => {
                if (!iframeResponsiveService.checkInitVimeoIframeAPI()) {
                    iframeResponsiveService
                        .addVimeoIframeAPI()
                        .then(() => {
                            ctrl.player = iframeResponsiveService.getVimeoPlayerAPI(playerId, vimeoVideoId, autoplay, loop);
                            ctrl.player.on('play', () => {
                                ctrl.stopOthersVideo();
                                iframeResponsiveService.run(ctrl, 'vimeo');
                                ctrl.hideCover();
                                $scope.$digest();
                            });
                        })
                        .catch((error) => {
                            console.error(error);
                        });
                } else {
                    ctrl.player = iframeResponsiveService.getVimeoPlayerAPI(playerId, vimeoVideoId, autoplay, loop);
                }
            });
        };

        ctrl.pasteRutubeIframeSrc = function (link, playerId, autoplay, loop) {
            const videoId = iframeResponsiveService.getVideoIdFromRutube(link);

            $timeout(() => {
                const player = document.getElementById(playerId);
                if (player != null && (ctrl.player == null || ctrl.player.getId() !== playerId)) {
                    ctrl.player = iframeResponsiveService.getRutubePlayer(playerId, {
                        events: {
                            onReady: ctrl.onPlayerReadyRutube,
                            onStateChange: ctrl.onPlayerStateChangeRutube,
                            onComplete: ctrl.onCompleteRutube,
                        },
                    });
                }

                if (ctrl.player != null) {
                    ctrl.stopOthersVideo();
                }
            });
            const code = iframeResponsiveService.getRutubeCode(link, autoplay, videoId, loop);
            ctrl.iframeSrc = $sce.trustAsResourceUrl(code);
        };

        ctrl.pasteVkIframeSrc = function (link, playerId, autoplay, loop) {
            const [oid, id] = iframeResponsiveService.getVideoIdsFromVk(link);
            if (oid && id) {
                iframeResponsiveService
                    .addVkAPI()
                    .then(() => {
                        const src = `https://vk.com/video_ext.php?oid=${oid}&id=${id}&hd=2&autoplay=${autoplay ? '1' : '0'}&repeat=${loop ? '1' : '0'}&js_api=1`;
                        ctrl.iframeSrc = $sce.trustAsResourceUrl(src);
                        const iframe = document.getElementById(playerId);
                        iframe.src = src;
                        if (iframe) {
                            ctrl.player = iframeResponsiveService.getVkPlayer(iframe);
                            ctrl.player?.on('started', ctrl.onPlayerStateChangeVk);
                        }
                    })
                    .catch((e) => {
                        throw new Error(e);
                    });
            }
        };

        ctrl.onPlayerReadyRutube = function onPlayerReady() {
            if (ctrl.autoplay) {
                try {
                    ctrl.player.mute();
                    ctrl.player.play();
                    $timeout(() => {
                        ctrl.hideCover();
                    }, 100);
                } catch {
                   
                }
            }
        };

        ctrl.onPlayerStateChangeRutube = function (event) {
            if (event.playerState.PLAYING || event.playerState.PREROLL) {
                $timeout(() => {
                    ctrl.hideCover();
                }, 100);
            }
        };

        ctrl.onCompleteRutube = function () {
            if (ctrl.loop) {
                try {
                    ctrl.player.seekTo({ time: 0 });
                    ctrl.player.play();
                } catch {
                   
                }
            }
        };

        ctrl.pasteVideo = function (src, autoplay, loop) {
            ctrl.playerId = iframeResponsiveService.getPlayerId();
            if (ctrl.useYouTube) {
                ctrl.pasteYTIframeSrc(src, ctrl.playerId, autoplay, loop);
            }
            if (ctrl.useVimeo) {
                ctrl.pasteVimeoIframeSrc(src, ctrl.playerId, autoplay, loop);
            }
            if (ctrl.useRutube) {
                ctrl.pasteRutubeIframeSrc(src, ctrl.playerId, autoplay, loop);
            }
            if (ctrl.useVk) {
                ctrl.pasteVkIframeSrc(src, ctrl.playerId, autoplay, loop);
            }
        };
    };

    ng.module('iframeResponsive').controller('IframeResponsiveCtrl', IframeResponsiveCtrl);

    IframeResponsiveCtrl.$inject = ['$sce', 'iframeResponsiveService', '$scope', '$timeout'];
})(window.angular);
