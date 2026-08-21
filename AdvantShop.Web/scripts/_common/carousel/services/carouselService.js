import { carouselMediaTypes, checkMediaType, checkNeedLoad, getMediaType, waitImageLoad, waitVideoLoad } from '../carouselNative.helpers.js';

/* @ngInject */
const carouselService = function ($q, $timeout) {
    // eslint-disable-next-line no-invalid-this
    const service = this;

    service.waitLoadImages = function (mediaElementList, carouselOptions) {
        const deferMain = $q.defer(),
            promises = [];

        if (mediaElementList.length <= 0) {
            deferMain.resolve();
            return deferMain.promise;
        }

        return $timeout(() => {
            const countLoadInit = carouselOptions.visibleMax;
            let countLoad;

            if (countLoadInit) {
                countLoad = mediaElementList.length - 1 <= countLoadInit ? mediaElementList.length - 1 : countLoadInit;
            } else {
                countLoad = mediaElementList.length - 1;
            }

            let mediaElementTemp, mediaElementType;
            for (let i = 0; i <= countLoad; i++) {
                mediaElementTemp = mediaElementList[i];
                mediaElementType = getMediaType(mediaElementTemp);

                if (!checkMediaType(mediaElementType)) {
                    throw new Error(`carousel: invalid media type ${mediaElementType}`);
                }

                if (checkNeedLoad(mediaElementTemp, mediaElementType) === true) {
                    promises.push(
                        mediaElementType === carouselMediaTypes.image
                            ? waitImageLoad(mediaElementTemp.src?.length > 0 ? mediaElementTemp.src : mediaElementTemp.dataset.src)
                            : waitVideoLoad(mediaElementTemp),
                    );
                }

                if (
                    (typeof mediaElementTemp.src === 'undefined' || mediaElementTemp.src === null || mediaElementTemp.src.length === 0) &&
                    mediaElementTemp.dataset?.src.length > 0
                ) {
                    mediaElementTemp.src = mediaElementTemp.dataset.src;

                    if (mediaElementType === carouselMediaTypes.video) {
                        mediaElementTemp.preload = 'metadata';
                    }
                }
            }

            if (carouselOptions.auto === true && countLoadInit) {
                for (let j = mediaElementList.length - 1; j >= mediaElementList.length - countLoadInit; j--) {
                    mediaElementTemp = mediaElementList[j];
                    mediaElementType = getMediaType(mediaElementTemp);

                    if (!checkMediaType(mediaElementType)) {
                        throw new Error(`carousel: invalid media type ${mediaElementType}`);
                    }

                    if (checkNeedLoad(mediaElementTemp, mediaElementType) === true) {
                        promises.push(
                            mediaElementType === carouselMediaTypes.image
                                ? waitImageLoad(mediaElementTemp.src?.length > 0 ? mediaElementTemp.src : mediaElementTemp.dataset.src)
                                : waitVideoLoad(mediaElementTemp),
                        );
                    }

                    if (
                        (typeof mediaElementTemp.src === 'undefined' || mediaElementTemp.src === null || mediaElementTemp.src.length === 0) &&
                        mediaElementTemp.dataset.src &&
                        mediaElementTemp.dataset.src.length > 0
                    ) {
                        mediaElementTemp.src = mediaElementTemp.dataset.src;
                        if (mediaElementType === carouselMediaTypes.video) {
                            mediaElementTemp.preload = 'metadata';
                        }
                    }
                }
            }

            if (promises.length === 0) {
                promises.push(deferMain.promise);
                deferMain.resolve();
            }

            return $q.all(promises);
        });
    };
};

export default carouselService;
