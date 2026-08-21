export const carouselMediaTypes = {
    image: 'image',
    video: 'video',
};

export const getMediaType = (element) => (element.tagName === 'IMG' ? 'image' : element.tagName.toLowerCase());
export const checkMediaType = (mediaType) => Object.hasOwn(carouselMediaTypes, mediaType);
export const waitImageLoad = (imageSrc) =>
    new Promise((resolve, reject) => {
        if (typeof imageSrc === 'undefined' || imageSrc === null) {
            reject(new Error(`carousel: src null or undefined`));
        }

        const imageFake = new Image();

        imageFake.addEventListener(
            'load',
            (event) => {
                resolve(event);
            },
            { once: true },
        );

        imageFake.addEventListener(
            'error',
            (event) => {
                reject(event);
            },
            { once: true },
        );

        imageFake.src = imageSrc;
    });

export const waitVideoLoad = (videoElement) =>
    new Promise((resolve, reject) => {
        videoElement.addEventListener(
            'loadeddata',
            (event) => {
                resolve(event);
            },
            { once: true },
        );

        videoElement.addEventListener(
            'error',
            (event) => {
                reject(event);
            },
            { once: true },
        );
    });

export const checkNeedLoad = (mediaElement, mediaType) => {
    if (mediaType === carouselMediaTypes.image) {
        return !mediaElement.complete || typeof mediaElement.naturalWidth === 'undefined' || mediaElement.naturalWidth === 0;
    } else if (mediaType === carouselMediaTypes.video) {
        return mediaElement.readyState === HTMLMediaElement.HAVE_NOTHING;
    }

    throw new Error(`carousel: unknown media type ${mediaType}`);
};

export const debounce = (func, ms) => {
    let timer;

    return function (...args) {
        if (timer) {
            clearTimeout(timer);
        }

        // eslint-disable-next-line no-invalid-this
        const vm = this;

        timer = setTimeout(() => {
            func.apply(vm, args);
        }, ms);
    };
};

export const getMediaQuery = (value) => window.matchMedia(`(min-width:${value}px)`);

export const clearStyleSlide = (slide, carousel) => {
    slide.style[carousel.propName] = 'auto';
    slide.style['flex-basis'] = 'auto';
    slide.style.msFlexPreferredSize = 'auto';
    slide.style.webkitFlexBasis = 'auto';

    if (carousel.propName === 'width') {
        slide.style.maxWidth = 'none';
    } else {
        slide.style.maxHeight = 'none';
    }
};

const clonesForCreate = {};
export const createComponent = (tagName, attrs = {}) => {
    if (!clonesForCreate[tagName]) {
        clonesForCreate[tagName] = document.createElement(tagName);
        for (const [attr, value] of Object.entries(attrs)) {
            clonesForCreate[tagName].setAttribute(attr, value);
        }
    }

    return clonesForCreate[tagName].cloneNode();
};

export const smoothScroll = (element, scrollEnd, speed = 700, isVertical = false, useAnimate = true, animation = 'easeInOutCubic') =>
    new Promise((resolve) => {
        if (!useAnimate) {
            // Если анимация отключена, просто скроллим сразу
            element.scrollTo({
                [isVertical ? 'top' : 'left']: scrollEnd,
                behavior: 'instant',
            });
            resolve({
                distance: scrollEnd,
                useAnimate: false,
                speed,
            });
            return;
        }

        const scrollValue = Math.floor(isVertical ? element.scrollTop : element.scrollLeft);
        const scrollEndNormalize = Math.floor(scrollEnd);
        const distance = scrollEndNormalize - scrollValue;

        // Если дистанция нулевая, завершаем сразу
        if (distance === 0) {
            resolve({
                distance: scrollEndNormalize,
                useAnimate: true,
                speed,
            });
            return;
        }

        let startTime = null;

        // Выбор функции анимации
        const easingFunctions = {
            linear: (time) => time,
            easeInOutCubic: (time) => (time < 0.5 ? 4 * time * time * time : (time - 1) * (2 * time - 2) * (2 * time - 2) + 1),
            // Можно добавить другие easing-функции (easeInQuad, easeOutExpo и т.д.)
        };

        const easingFunction = easingFunctions[animation] || easingFunctions.easeInOutCubic;

        function animateScroll(timestamp) {
            if (!startTime) startTime = timestamp;
            const elapsed = timestamp - startTime;
            const progress = Math.min(elapsed / speed, 1);
            const easedProgress = easingFunction(progress);
            const newPosition = Math.floor(scrollValue + distance * easedProgress);

            // Прокрутка
            element.scrollTo({
                [isVertical ? 'top' : 'left']: newPosition,
            });

            // Продолжаем анимацию, если не достигли конца
            if (progress < 1) {
                window.requestAnimationFrame(animateScroll);
            } else {
                resolve({
                    distance: scrollEndNormalize,
                    useAnimate: true,
                    speed,
                });
            }
        }

        window.requestAnimationFrame(animateScroll);
    });

export const closest = (element, selector) => {
    let parent = element;

    if (!parent) {
        return null;
    }

    const matchesSelector = parent.matches || parent.webkitMatchesSelector || parent.mozMatchesSelector || parent.msMatchesSelector;

    while (parent && parent !== document.body && parent !== document) {
        if (typeof selector === 'string') {
            if (matchesSelector.bind(parent)(selector) === true) {
                return parent;
            }
        } else if (parent === selector) {
            return parent;
        }

        parent = parent.parentNode;
    }

    return null;
};

const getVideoElement = (element) => element.querySelector('video');

export const tryVideoPlay = (slide) => {
    if (typeof slide === 'undefined') {
        return null;
    }
    const videoElem = getVideoElement(slide);

    if (videoElem) {
        videoElem.currentTime = 0;
        videoElem.play();
        return videoElem;
    }
    return null;
};

export const tryVideoStop = (slide) => {
    if (typeof slide === 'undefined') {
        return null;
    }

    const videoElem = getVideoElement(slide);

    if (videoElem) {
        videoElem.currentTime = 0;
        videoElem.play();
        return videoElem;
    }
    return null;
};
