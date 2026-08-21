import {
    carouselMediaTypes,
    checkMediaType,
    clearStyleSlide,
    closest,
    createComponent,
    debounce,
    getMediaQuery,
    getMediaType,
    smoothScroll,
    tryVideoPlay,
    tryVideoStop,
} from './carouselNative.helpers.js';

const isTouchDevice = 'ontouchstart' in document.documentElement,
    storage = {},
    deferList = {},
    transformName = 'transform',
    transitionDurationName = 'transitionDuration';

let autoStop = false,
    idIncrement = 0,
    isOverScrollX = false,
    isScrolling = false;

const onlyItemsOriginal = (item) =>
    item.classList.contains('js-carousel-clone') === false && item.classList.contains('js-carousel-item-ignore') === false;

class Carousel {
    constructor(element, options) {
        const id = element.getAttribute('id') || `carousel_${(idIncrement += 1)}`;

        this.list = element;
        this.items = Array.prototype.slice.call(element.children).filter(onlyItemsOriginal);
        this.options = options;
        this.responsive = options.responsive;
        this.responsiveOption = this.options.responsive ? this.checkResponsive() : null;
        this.propName = this.getPropName(this.getIsVerticalOption());
        this.cache = this.items.slice();
        this.id = id;
        this.dots = [];

        storage[id] = {
            state: { callAsNav: false },
            obj: this,
        };

        this.resolveAsNavForReady(this.id);
    }

    addToCache(item) {
        this.cache.push(item);
    }

    getFromCache(item) {
        let index;

        if (typeof item === 'number') {
            index = item;
        } else {
            index = this.cache.indexOf(item);
        }

        return this.cache[index];
    }

    removeFromCache(item) {
        let index;

        if (typeof item === 'number') {
            index = item;
        } else {
            index = this.cache.indexOf(item);
        }

        if (index !== -1) {
            this.cache.splice(index, 1);
        }

        return this.cache[index];
    }

    clearCache() {
        this.cache.length = 0;
    }

    getSize(totalCount, maxWidth, maxHeight, isVertical, diff) {
        const size = {};

        if (isVertical === false) {
            size.width = totalCount * maxWidth - (diff || 0);
            size.height = maxHeight;
        } else {
            size.width = maxWidth;
            size.height = totalCount * maxHeight - (diff || 0);
        }

        return size;
    }

    getPropName(isVertical) {
        return isVertical === false ? 'width' : 'height';
    }

    getItemsMaxSizes(items) {
        let maxWidth = 0,
            maxHeigth = 0;

        for (let i = items.length - 1; i >= 0; i--) {
            if (typeof items[i].carouselItemData === 'undefined' || items[i].carouselItemData === null) {
                continue;
            }

            const tempWidth = items[i].carouselItemData.originalWidth;

            if (tempWidth > maxWidth) {
                maxWidth = tempWidth;
            }

            const tempHeight = items[i].carouselItemData.originalHeight;

            if (tempHeight > maxHeigth) {
                maxHeigth = tempHeight;
            }
        }

        return {
            width: maxWidth,
            height: maxHeigth,
        };
    }

    setItemSize(item, value) {
        const vm = this,
            valueStr = `${value}px`;

        item.style[vm.propName] = valueStr;
        //item.style['min' + vm.propName.charAt(0).toUpperCase() + vm.propName.slice(1)] = valueStr;
        item.style[`max${vm.propName.charAt(0).toUpperCase()}${vm.propName.slice(1)}`] = valueStr;
        item.style.flexBasis = valueStr;
        item.style.msFlexPreferredSize = valueStr;
        item.style.webkitFlexBasis = valueStr;
    }

    processItems(items, saveStyleAttribute) {
        const vm = this;

        for (let i = 0, len = items.length - 1; i <= len; i++) {
            vm.processItem(items[i], i, saveStyleAttribute);
        }
    }

    processItem(item, index, saveStyleAttribute) {
        const vm = this;

        const { width, height } = item.getBoundingClientRect();

        item.carouselItemData ??= {};
        item.carouselItemData.originalWidth = width;
        item.carouselItemData.originalHeight = height;
        item.carouselItemData.index = typeof index !== 'undefined' && index !== null ? index : vm.items.length;
        item.carouselItemData.parameters =
            // eslint-disable-next-line no-new-func
            item.dataset.parameters !== null ? new Function(`return ${item.dataset.parameters}`)() : null;
        item.carouselItemData.stylesRaw =
            saveStyleAttribute === true ? item.getAttribute('style') : item.carouselItemData ? item.carouselItemData.stylesRaw : null;

        item.classList.add('js-carousel-item');
        item.classList.add('carousel-item');

        return item;
    }

    setSizes(_wrapSize, innerSize, listSize, itemsSizes) {
        const vm = this;

        //if (wrapSize != null) {
        //    vm.wrap.style[vm.propName] = wrapSize[vm.propName] + 'px';
        //}
        if (innerSize) {
            vm.inner.style[vm.propName] = `${innerSize[vm.propName]}px`;
        }

        if (listSize) {
            vm.list.style[vm.propName] = `${listSize[vm.propName]}px`;
        }

        if (itemsSizes) {
            for (let i = vm.items.length - 1; i >= 0; i--) {
                vm.setItemSize(vm.items[i], itemsSizes[vm.propName]);
            }
        }
    }

    calc(items, options, responsiveOptions) {
        const vm = this;

        const result = responsiveOptions ? vm.calcResponsive(items, options, responsiveOptions) : vm.calcAuto(items, options);

        vm.countVisible = result.countVisible;
        vm.wrapSize = result.wrapSize;
        vm.listSize = result.listSize;
        vm.innerSize = result.innerSize;
        vm.itemsSize = result.itemsSize;
        vm.slidesSize = result.slidesSize;

        if (vm.options.onCalc) {
            vm.options.onCalc(vm);
        }

        return result;
    }

    getCarouselSize() {
        const vm = this;
        let carouselPaddingLeft, carouselPaddingRight, carouselPaddingTop, carouselPaddingBottom;

        const carouselStylesComputed = getComputedStyle(vm.wrap);

        carouselPaddingLeft = parseInt(carouselStylesComputed['padding-left'], 10);
        carouselPaddingRight = parseInt(carouselStylesComputed['padding-right'], 10);
        carouselPaddingTop = parseInt(carouselStylesComputed['padding-top'], 10);
        carouselPaddingBottom = parseInt(carouselStylesComputed['padding-bottom'], 10);

        carouselPaddingLeft = isNaN(carouselPaddingLeft) ? 0 : carouselPaddingLeft;
        carouselPaddingRight = isNaN(carouselPaddingRight) ? 0 : carouselPaddingRight;
        carouselPaddingTop = isNaN(carouselPaddingTop) ? 0 : carouselPaddingTop;
        carouselPaddingBottom = isNaN(carouselPaddingBottom) ? 0 : carouselPaddingBottom;

        const { width, height } = vm.wrap.getBoundingClientRect();

        return {
            width: width - carouselPaddingLeft - carouselPaddingRight,
            height: height - carouselPaddingTop - carouselPaddingBottom,
        };
    }

    // eslint-disable-next-line complexity
    calcAuto(items, options, retry) {
        const vm = this;

        let countVisible, dimension, result, slidesSize;

        const { propName } = vm;
        const carouselSizes = vm.getCarouselSize();

        const slidesMaxSize = vm.getItemsMaxSizes(items);
        const countVisibleDirty = carouselSizes[propName] / (slidesMaxSize[propName] || 1);

        countVisible = Math.floor(countVisibleDirty); //Math.round

        //dimension число с плавающей точкой
        if (options.visibleMin && options.visibleMin > items.length) {
            countVisible = items.length;
            dimension = countVisibleDirty - countVisible;
        } else if (countVisible > items.length) {
            countVisible = items.length;
            dimension = 0;
        } else if (countVisible < 1) {
            countVisible = 1;
            dimension = countVisibleDirty - countVisible;
        } else {
            dimension = countVisibleDirty - countVisible;
        }

        if ((options.visibleMax && options.visibleMax < countVisible) || (options.visibleMin && options.visibleMin > countVisible)) {
            if (options.visibleMax && options.visibleMax < countVisible) {
                countVisible = options.visibleMax;
            } else if (options.visibleMin && options.visibleMin > countVisible) {
                countVisible = options.visibleMin;
                slidesMaxSize[propName] = carouselSizes.width / countVisible;
            }

            if (options.stretch) {
                slidesMaxSize[propName] = carouselSizes[propName] / countVisible;
            } else {
                //carouselSizes[propName] = carouselSizes[propName] - (slidesMaxSize[propName] * countVisible);
                const sizeSlides = slidesMaxSize[propName] * countVisible;
                carouselSizes[propName] =
                    sizeSlides >= carouselSizes[propName]
                        ? carouselSizes[propName]
                        : carouselSizes[propName] - (carouselSizes[propName] - sizeSlides);
            }
        } else if (!isNaN(dimension) && dimension !== 0) {
            if (options.stretch) {
                slidesMaxSize[propName] += (slidesMaxSize[propName] * dimension) / countVisible;
            } else if (dimension > 0) {
                // eslint-disable-next-line operator-assignment
                carouselSizes[propName] = carouselSizes[propName] - slidesMaxSize[propName] * dimension;
            } else {
                slidesMaxSize[propName] += (slidesMaxSize[propName] * dimension) / countVisible;

                if (slidesMaxSize[propName] <= 0) {
                    slidesMaxSize[propName] = carouselSizes[propName];
                }
            }
        }

        if (countVisible <= 1) {
            countVisible = 1;
            result = slidesMaxSize[propName];
        } else {
            result = slidesMaxSize[propName];
        }

        if (!retry && countVisible < vm.items.length) {
            vm.wrap.classList.add('carousel-nav-show');
            return vm.calcAuto(items, options, true);
        }

        const diff = countVisible < items.length ? vm.getScrollDiff(result, countVisible) : 0;

        if (options.isVertical === false) {
            slidesSize = {
                width: result - diff,
                height: slidesMaxSize.height,
            };
        } else {
            slidesSize = {
                width: slidesMaxSize.width,
                height: result - diff,
            };
        }

        return {
            countVisible,
            wrapSize: carouselSizes,
            listSize: vm.getSize(vm.items.length, slidesMaxSize.width, slidesMaxSize.height, options.isVertical, diff * vm.items.length),
            innerSize: vm.getSize(countVisible, slidesMaxSize.width, slidesMaxSize.height, options.isVertical),
            itemsSize: slidesSize,
            slidesSize,
        };
    }

    calcResponsive(items, options, responsiveOptions) {
        const vm = this,
            { propName } = vm;
        let countVisible, slidesSize;
        if (responsiveOptions.slidesToShow) {
            countVisible = responsiveOptions.slidesToShow;
        } else {
            throw new Error('Count sliders to show is not set');
        }

        const carouselSizes = vm.getCarouselSize();
        let slidesMaxSize = vm.getItemsMaxSizes(items);

        if (options.visibleMin && options.visibleMin > items.length) {
            countVisible = items.length;
        } else if (countVisible > items.length) {
            countVisible = items.length;
        }

        if (options.stretch) {
            slidesMaxSize[propName] = carouselSizes[propName] / countVisible;
        } else {
            //carouselSizes[propName] = carouselSizes[propName] - (slidesMaxSize[propName] * countVisible);
            const sizeSlides = slidesMaxSize[propName] * countVisible;
            carouselSizes[propName] =
                sizeSlides >= carouselSizes[propName] ? carouselSizes[propName] : carouselSizes[propName] - (carouselSizes[propName] - sizeSlides);
        }

        slidesMaxSize = {
            width: carouselSizes.width / countVisible,
            height: carouselSizes.height / countVisible,
        };

        const isVertical = vm.getIsVerticalOption();
        const diff = vm.getScrollDiff(slidesMaxSize[vm.getPropName(isVertical)], countVisible);

        if (isVertical === false) {
            slidesSize = {
                width: slidesMaxSize.width - diff,
                //height: slidesMaxSize.height
            };
        } else {
            slidesSize = {
                //width: slidesMaxSize.width,
                height: slidesMaxSize.height - diff,
            };
        }

        return {
            countVisible,
            wrapSize: carouselSizes,
            listSize: vm.getSize(vm.items.length, slidesMaxSize.width, slidesMaxSize.height, isVertical, diff * vm.items.length),
            innerSize: vm.getSize(countVisible, slidesMaxSize.width, slidesMaxSize.height, isVertical),
            itemsSize: slidesSize,
            slidesSize,
        };
    }

    checkDots() {
        const vm = this;
        let need;
        if (vm.options.dots === true) {
            need = vm.items.length !== 1 && vm.countVisible !== vm.items.length;

            if (need === false) {
                if (vm.dotsContainer?.parentNode) {
                    vm.dotsContainer.parentNode.removeChild(vm.dotsContainer);
                }

                vm.dotsContainer = null;
                vm.dots.length = 0;
            } else {
                vm.renderDots();
                vm.selectDots(vm.options.indexActive);
            }
        }
    }

    renderDots() {
        const vm = this;
        let dot,
            isRenderContaner = false,
            itemTemp;

        if (typeof vm.dotsContainer === 'undefined' || vm.dotsContainer === null) {
            vm.dotsContainer = vm.wrap.querySelector('.carousel-dots');

            if (vm.dotsContainer) {
                Array.prototype.forEach.call(vm.dotsContainer.children, (el) => {
                    vm.dots.push(el);
                });
            } else {
                vm.dotsContainer = createComponent('ul');
                vm.dotsContainer.className = `carousel-dots ${vm.options.dotsClass || ''}`;
                isRenderContaner = true;
            }
        }

        const newCount = vm.items.length / vm.options.scrollCount;
        const dim = vm.dots.length - newCount;
        const dimAbs = Math.abs(dim);

        if (dim < 0) {
            for (let i = 0, len = dimAbs; i < len; i++) {
                dot = createComponent('li');
                dot.classList.add('carousel-dots-item');
                dot.innerHTML = `<i class="carousel-dots-item-inner ${vm.options.dotsItemClass || ''}" />`;
                vm.dotsContainer.appendChild(dot);
                vm.dots.push(dot);
            }

            vm.dots.forEach((el, index) => {
                el.setAttribute('data-index', index);
            });

            if (isRenderContaner === true) {
                vm.wrap.appendChild(vm.dotsContainer);
            }
        } else {
            for (let i = dimAbs - 1; i >= 0; i--) {
                itemTemp = vm.dots.pop();
                itemTemp.parentNode.removeChild(itemTemp);
            }
        }
    }

    renderNav() {
        const vm = this;
        let nav = vm.wrap.querySelector('.carousel-nav'),
            navPrev,
            navNext,
            needRenderNav,
            needRenderPrev,
            needRenderNext;

        //#region nav find or create
        if (nav === null || nav.parentNode !== vm.wrap) {
            nav = createComponent('div');
            needRenderNav = true;
        }

        nav.className = `carousel-nav carousel-nav-${vm.options.navPosition}`;

        vm.nav = nav;
        //#endregion
        //#region prev find or create
        navPrev = nav.querySelector('.carousel-nav-prev');

        if (navPrev === null) {
            navPrev = createComponent('button', {
                type: 'button',
                role: 'button',
                'aria-label': 'Предыдущий слайд',
            });
            needRenderPrev = true;
        }

        vm.navPrev = navPrev;

        //var isVertical = vm.getIsVerticalOption();
        //navPrev.className = 'carousel-nav-prev ' + (isVertical ? vm.options.prevIconVertical : vm.options.prevIcon);
        //if (vm.options.prevClass) {
        //    vm.options.prevClass.split(' ').forEach(function (item) {
        //        navPrev.classList.add(item);
        //    });
        //}
        vm.navPrev = navPrev;
        //#endregion
        //#region next find or create
        navNext = nav.querySelector('.carousel-nav-next');

        if (navNext === null) {
            navNext = createComponent('button', {
                type: 'button',
                role: 'button',
                'aria-label': 'Следующий слайд',
            });
            needRenderNext = true;
        }
        vm.navNext = navNext;

        vm.addDirectionClassFromNav();

        //navNext.className = 'carousel-nav-next ' + (isVertical ? vm.options.nextIconVertical : vm.options.nextIcon);
        //if (vm.options.nextClass) {
        //    vm.options.nextClass.split(' ').forEach(function (item) {
        //        navNext.classList.add(item);
        //    });
        //}
        //#endregion
        if (needRenderPrev === true) {
            nav.appendChild(navPrev);
        }

        if (needRenderNext === true) {
            nav.appendChild(navNext);
        }

        if (needRenderNav === true) {
            vm.wrap.appendChild(nav);
        }
    }

    removeDirectionClassFromNav() {
        const isVertical = this.getIsVerticalOption();
        const vm = this;

        vm.navNext.className = isVertical ? vm.options.nextIconVertical : vm.options.nextIcon;

        if (vm.options.nextClass) {
            vm.options.nextClass.split(' ').forEach((item) => {
                vm.navNext.classList.remove(item);
            });
        }

        vm.navPrev.className = isVertical ? vm.options.prevIconVertical : vm.options.prevIcon;

        if (vm.options.prevClass) {
            vm.options.prevClass.split(' ').forEach((item) => {
                vm.navPrev.classList.remove(item);
            });
        }
    }

    addDirectionClassFromNav() {
        const isVertical = this.getIsVerticalOption();
        const vm = this;

        vm.navNext.className = `carousel-nav-next ${isVertical ? vm.options.nextIconVertical : vm.options.nextIcon}`;

        if (vm.options.nextClass) {
            vm.options.nextClass.split(' ').forEach((item) => {
                vm.navNext.classList.add(item);
            });
        }

        vm.navPrev.className = `carousel-nav-prev ${isVertical ? vm.options.prevIconVertical : vm.options.prevIcon}`;

        if (vm.options.prevClass) {
            vm.options.prevClass.split(' ').forEach((item) => {
                vm.navPrev.classList.add(item);
            });
        }
    }

    generate(element) {
        const vm = this;
        let wrap, inner, needRenderInner, needRenderWrap;

        element.classList.add('carousel-list');

        if (vm.options.itemActiveClass?.length > 0) {
            vm.options.itemActiveClass.split(' ').forEach((classNameValue) => {
                vm.items[vm.options.indexActive].classList.add(classNameValue);
            });
        }

        if (vm.options.itemSelectClass?.length > 0) {
            vm.options.itemSelectClass.split(' ').forEach((classNameValue) => {
                vm.items[vm.options.indexActive].classList.add(classNameValue);
            });
        }

        //#region inner find or create
        if (vm.list.parentNode?.classList.contains('carousel-inner') === true) {
            inner = vm.list.parentNode;
        } else {
            inner = createComponent('div');
            needRenderInner = true;
        }

        inner.classList.add('carousel-inner');

        vm.inner = inner;
        //#endregion
        //#region wrap find or create
        if (vm.inner.parentNode?.classList.contains('carousel') === true) {
            wrap = vm.inner.parentNode;
        } else {
            wrap = createComponent('div');
            needRenderWrap = true;
        }

        const isVertical = vm.getIsVerticalOption();

        wrap.classList.add(
            'carousel',
            `carousel-${isVertical ? 'vertical' : 'horizontal'}`,
            `carousel-wrap-nav-${vm.options.navPosition}`,
            vm.options.heightAuto ? 'carousel--height-auto' : undefined,
        );

        if (vm.options.carouselClass?.length > 0) {
            vm.options.carouselClass
                .split(' ')
                .filter((item) => item.length > 0)
                .forEach((item) => {
                    wrap.classList.add(item);
                });
        }

        if (vm.options.scrollNav === true) {
            wrap.classList.add('carousel-scroll-nav');
        }

        vm.wrap = wrap;
        //#endregion
        if (needRenderInner) {
            wrap.appendChild(inner);
        }

        if (needRenderWrap) {
            //element.parentNode.appendChild(wrap);
            element.insertAdjacentElement('beforebegin', wrap);
        }

        if (needRenderInner) {
            inner.appendChild(element);
        }
    }

    selectDots(index) {
        const vm = this;

        if (typeof vm.dots === 'undefined' || vm.dots === null || vm.dotActive === vm.dots[index]) {
            return;
        }

        if (vm.dotActive) {
            vm.dotActive.classList.remove('carousel-dots-selected');

            if (vm.options.dotsItemSelectedClass?.length > 0) {
                vm.options.dotsItemSelectedClass.split(' ').forEach((classNameValue) => {
                    vm.dotActive.classList.remove(classNameValue);
                });
            }

            if (vm.options.dotsItemInnerSelectedClass?.length > 0) {
                vm.options.dotsItemInnerSelectedClass.split(' ').forEach((classNameValue) => {
                    vm.dotActive.children[0].classList.remove(classNameValue);
                });
            }
        }

        const dotSelectedIndex = vm.dots.find((x) => parseFloat(x.dataset.index) + vm.options.scrollCount - 1 >= index);

        if (dotSelectedIndex) {
            vm.dotActive = dotSelectedIndex;
            dotSelectedIndex.classList.add('carousel-dots-selected');

            if (vm.options.dotsItemSelectedClass?.length > 0) {
                vm.options.dotsItemSelectedClass.split(' ').forEach((classNameValue) => {
                    dotSelectedIndex.classList.add(classNameValue);
                });
            }

            if (vm.options.dotsItemInnerSelectedClass?.length > 0) {
                vm.options.dotsItemInnerSelectedClass.split(' ').forEach((classNameValue) => {
                    dotSelectedIndex.children[0].classList.add(classNameValue);
                });
            }
        }
    }

    doClone() {
        const vm = this;
        let clonePrev, cloneNext;

        const clonesNext = [];
        const clonesPrev = [];

        //#region find and delete old clones
        const oldClones = vm.list.querySelectorAll('.js-carousel-clone');
        for (let i = oldClones.length - 1; i >= 0; i--) {
            oldClones[i].parentNode.removeChild(oldClones[i]);
        }

        for (let i = vm.items.length - 1; i >= 0; i--) {
            delete vm.items[i].carouselItemData.clone;
        }

        vm.list.style.marginLeft = '0px';

        //#endregion
        if (vm.countVisible >= vm.items.length) {
            return null;
        }

        const itemsDuplicate = vm.items.slice();

        const itemsClonePrev = Array.prototype.slice.call(itemsDuplicate.reverse(), 0, vm.countVisible).reverse();
        const itemsCloneNext = Array.prototype.slice.call(itemsDuplicate.reverse(), 0, vm.countVisible);

        const fragmentPrev = document.createDocumentFragment();
        const fragmentNext = document.createDocumentFragment();

        for (let i = 0, len = itemsClonePrev.length; i < len; i++) {
            clonePrev = (itemsClonePrev[i].carouselItemData.originalClone || itemsClonePrev[i]).cloneNode(true);
            clonePrev.classList.add('js-carousel-clone', 'js-carousel-clone--prev');

            vm.setItemSize(clonePrev, vm.slidesSize[vm.propName]);

            fragmentPrev.appendChild(clonePrev);
            clonesPrev.push(clonePrev);

            itemsClonePrev[i].carouselItemData.clone = clonePrev;
        }

        itemsCloneNext.forEach((item) => {
            cloneNext = (item.carouselItemData.originalClone || item).cloneNode(true);
            cloneNext.classList.add('js-carousel-clone', 'js-carousel-clone--next');

            vm.setItemSize(cloneNext, vm.slidesSize[vm.propName]);

            fragmentNext.appendChild(cloneNext);
            clonesNext.push(cloneNext);

            item.carouselItemData.clone = cloneNext;
        });

        //insert for prev
        vm.list.insertBefore(fragmentPrev, vm.items[0]);

        //insert for next
        vm.list.appendChild(fragmentNext);

        const marginLeftValue = -itemsClonePrev.length * vm.slidesSize[vm.propName];

        vm.list.style.marginLeft = `${marginLeftValue}px`;

        vm.hasClones = true;

        vm.countClone = itemsClonePrev.length + itemsCloneNext.length;

        vm.clonesInOneDirection = (itemsClonePrev.length + itemsCloneNext.length) / 2;

        const result = {
            clonesNext,
            clonesPrev,
            clonesNextCount: itemsCloneNext.length,
            clonesPrevCount: itemsClonePrev.length,
            marginLeftValue,
        };

        if (vm.options.onDoClone) {
            vm.options.onDoClone(result);
        }

        return result;
    }

    getMoveData(index) {
        const vm = this;
        let result;

        if (vm.items.length > vm.countVisible) {
            result = Math.abs(index) * vm.slidesSize[vm.propName] * (index < 0 ? 1 : -1);
        } else {
            result = 0;
        }

        return result;
    }

    move(transformValue, useAnimate) {
        const _useAnimate = useAnimate ?? true;

        const vm = this;

        const isVertical = vm.getIsVerticalOption();

        const transformObj = {
            [isVertical ? 'top' : 'left']: transformValue,
        };

        vm.transformValue = transformValue;

        if (vm.options.scrollNav === false) {
            return new Promise((resolve) => {
                if (_useAnimate) {
                    vm.list.addEventListener(
                        'transitionend',
                        () => {
                            resolve({
                                distance: transformValue,
                                useAnimate,
                                speed: vm.options.speed,
                            });
                        },
                        { once: true },
                    );
                }

                vm.list.style[transitionDurationName] = _useAnimate === false ? '0ms' : `${vm.options.speed / 1000}s`;
                vm.list.style[transformName] = ['translate3d(', transformObj.left || 0, 'px,', ' ', transformObj.top || 0, 'px, 0px)'].join('');

                if (!_useAnimate) {
                    resolve({
                        distance: transformValue,
                        useAnimate,
                        speed: vm.options.speed,
                    });
                }
            });
        }
        const scrollValueEnd = Math.floor(Math.abs((isVertical ? transformObj.top : transformObj.left) || 0));

        return smoothScroll(vm.inner, scrollValueEnd, vm.options.speed, isVertical);
    }

    moveAuto() {
        const vm = this;

        if (autoStop === true) {
            return;
        }

        clearTimeout(vm.timerAuto);

        vm.timerAuto = setTimeout(() => {
            if (autoStop === true) {
                return;
            }

            vm.next();

            vm.moveAuto();
        }, vm.options.autoPause);
    }

    stopAuto() {
        const vm = this;
        autoStop = true;

        if (typeof vm.timerAuto !== 'undefined' && vm.timerAuto !== null) {
            clearTimeout(vm.timerAuto);
        }
    }

    startAuto() {
        const vm = this;

        autoStop = false;

        vm.moveAuto();
    }

    checkNav() {
        const vm = this,
            itemsCount = vm.items.length;

        vm.isPrevDisabled = (vm.options.auto === false && vm.options.indexActive === 0) || vm.countVisible >= itemsCount;
        vm.isNextDisabled =
            (vm.options.auto === false && vm.options.indexActive + vm.countVisible === vm.items.length) || vm.countVisible >= itemsCount;
        vm.isNavNotShow = itemsCount <= vm.countVisible;

        if (vm.isPrevDisabled) {
            vm.navPrev.setAttribute('disabled', 'disabled');
        } else {
            vm.navPrev.removeAttribute('disabled');
        }

        if (vm.isNextDisabled) {
            vm.navNext.setAttribute('disabled', 'disabled');
        } else {
            vm.navNext.removeAttribute('disabled');
        }

        vm.wrap.classList.toggle('carousel-nav-not-show', vm.isNavNotShow);
        vm.wrap.classList.toggle('carousel-nav-show', !vm.isNavNotShow);
    }

    prev() {
        const vm = this;
        const carouselAsNavFor = vm.getCarouselAsNav();

        if (vm.isPrevDisabled === true || vm.animationLoop === true) {
            return;
        }

        const newIndex = vm.options.indexActive - vm.options.scrollCount;

        //go to last item
        if (vm.options.auto === true && newIndex < 0) {
            vm.animationLoop = true;

            vm.goto(newIndex, true).then(() => {
                vm.animationLoop = false;
                vm.goto(vm.items.length - 1, false);

                if (carouselAsNavFor) {
                    carouselAsNavFor.goto(vm.items.length - 1, false);
                }
            });

            if (carouselAsNavFor) {
                carouselAsNavFor.goto(newIndex, true);
            }
            return;
        }

        vm.goto(newIndex, true);

        if (carouselAsNavFor) {
            carouselAsNavFor.goto(newIndex, true);
        }
    }

    next() {
        const vm = this;
        const carouselAsNavFor = vm.getCarouselAsNav();

        if (vm.isNextDisabled === true || vm.animationLoop === true) {
            return;
        }

        let newIndex = vm.options.indexActive + vm.options.scrollCount;
        //go to first item
        if (vm.options.auto === true && newIndex > vm.items.length) {
            vm.goto(0, false);
            newIndex = vm.options.scrollCount;
            setTimeout(() => {
                vm.goto(newIndex, true);
            }, 0);
            return;
        }

        if (vm.options.auto === true && newIndex === vm.items.length) {
            // newIndex > vm.items.length - vm.countVisible
            vm.animationLoop = true;

            vm.goto(newIndex, true).then(() => {
                vm.animationLoop = false;
                vm.goto(0, false);

                if (carouselAsNavFor) {
                    carouselAsNavFor.goto(0, false);
                }
            });

            if (carouselAsNavFor) {
                carouselAsNavFor.goto(newIndex, true);
            }
            return;
        }

        vm.goto(newIndex, true);

        if (carouselAsNavFor) {
            carouselAsNavFor.goto(newIndex, true);
        }
    }

    loadImg(objForLoad, preload) {
        const vm = this;
        let list, mediaElementTemp, mediaElementType;

        if (objForLoad) {
            list = Array.prototype.slice.call(objForLoad instanceof NodeList ? objForLoad : [objForLoad]);
            let dataSetKey;
            for (let i = 0, len = list.length; i < len; i++) {
                mediaElementTemp = list[i];
                mediaElementType = getMediaType(mediaElementTemp);

                if (!checkMediaType(mediaElementType)) {
                    throw new Error(`carousel: invalid media type ${mediaElementType}`);
                }

                dataSetKey = mediaElementTemp.dataset?.src ? 'src' : mediaElementTemp.dataset?.srcset ? 'srcset' : null;

                if (mediaElementTemp.dataset.carouselImg) {
                    if (vm.options.onLazyLoad) {
                        // eslint-disable-next-line no-loop-func
                        mediaElementTemp.addEventListener('load', () => {
                            mediaElementTemp.classList.remove('carousel-placeholder');
                            if (vm.initilized) {
                                vm.updateCarouselItemData(mediaElementTemp);
                            }
                            if (vm.options.heightAuto) {
                                vm.calcHeightList();
                            }
                        });
                        vm.options.onLazyLoad(mediaElementTemp, mediaElementTemp);
                    }
                } else if (
                    dataSetKey &&
                    mediaElementTemp.classList.contains('loaded') === false &&
                    mediaElementTemp.dataset[dataSetKey].indexOf('{{') === -1
                ) {
                    // {{ - выражение ангуляра
                    // eslint-disable-next-line no-loop-func
                    mediaElementTemp.addEventListener(mediaElementType === 'image' ? 'load' : 'loadeddata', () => {
                        mediaElementTemp.classList.remove('carousel-placeholder');
                        if (vm.initilized) {
                            vm.updateCarouselItemData(mediaElementTemp);
                        }
                        if (vm.options.heightAuto) {
                            vm.calcHeightList();
                        }
                    });
                    if (mediaElementType === carouselMediaTypes.video) {
                        mediaElementTemp.preload = 'metadata';
                    }
                    mediaElementTemp[dataSetKey] = mediaElementTemp.dataset[dataSetKey];
                    mediaElementTemp.classList.add('loaded');

                    if (preload === true) {
                        // eslint-disable-next-line max-depth
                        if (mediaElementType === 'image') {
                            const fakeImg = new Image();
                            fakeImg[dataSetKey] = mediaElementTemp.dataset[dataSetKey];
                        } else {
                            throw new Error(`carousel: invalid media type ${mediaElementType}`);
                        }
                    }
                }
            }
        }
    }

    loadImgInsideItems(start, end) {
        const vm = this;
        let list = [];
        let _start;
        if (vm.options.auto === true) {
            _start = start < 0 ? 0 : start;
            list = list.concat(vm.cloneResult.clonesPrev.slice());
            list = list.concat(vm.items, vm.cloneResult ? vm.cloneResult.clonesNext : []);
        } else {
            list = list.concat(vm.items);
        }

        for (let i = _start; i < end; i++) {
            vm.loadImg(list[i].querySelectorAll('img,video'));
        }
    }

    // eslint-disable-next-line complexity
    goto(index, isAnimate) {
        const vm = this;
        const carouselAsNavFor = vm.getCarouselAsNav();
        const indexOld = vm.options.indexActive;
        if (vm.options.itemActiveClass?.length > 0) {
            vm.options.itemActiveClass.split(' ').forEach((classNameValue) => {
                vm.items[vm.options.indexActive].classList.remove(classNameValue);
                vm.items[index].classList.add(classNameValue);
            });
        }

        if (vm.countVisible === 1) {
            if (vm.options.itemSelectClass?.length > 0) {
                vm.options.itemSelectClass.split(' ').forEach((classNameValue) => {
                    vm.items[vm.options.indexActive].classList.remove(classNameValue);
                    vm.items[index].classList.add(classNameValue);
                });
            }

            if (carouselAsNavFor) {
                vm.callFnCarouselAsNavFor(vm.setItemSelect, [index]);
            }
        }

        vm.options.indexActive = index;
        if (index > -1 && index < vm.items.length) {
            vm.options.onGoto(vm.items[index]);
        }

        let maxIndex;
        if (vm.items.length < vm.countVisible) {
            maxIndex = 0;
        } else {
            maxIndex = vm.items.length - vm.countVisible + (vm.options.auto === true ? vm.countVisible : 0);
        }

        const minIndex = 0 - (vm.options.auto === true ? vm.countVisible : 0);

        if (vm.options.auto === false) {
            if (index < minIndex) {
                vm.options.indexActive = minIndex;
            } else if (index > maxIndex) {
                vm.options.indexActive = maxIndex;
            }
        }

        const _isAnimate = isAnimate ?? true;

        const transform = vm.getMoveData(vm.options.indexActive);

        if (vm.options.onGotoStart) {
            vm.options.onGotoStart(transform, _isAnimate, vm.options.speed, index, vm.items[index]);
        }

        const videoPreventSlide = indexOld !== vm.options.indexActive ? tryVideoStop(vm.items[indexOld]) : null;
        const videoCurrentSlide = tryVideoPlay(vm.items[vm.options.indexActive]);

        if (vm.options.auto === true) {
            if (videoCurrentSlide) {
                this.stopAuto();
                videoCurrentSlide.addEventListener(
                    'ended',
                    () => {
                        vm.next();
                    },
                    { once: true },
                );
            } else if (!videoCurrentSlide && videoPreventSlide) {
                this.startAuto();
            }
        }

        if (vm.options.heightAuto) {
            vm.calcHeightList();
        }

        return vm.move(transform, _isAnimate).then(() => {
            if (vm.options.nav === true) {
                vm.checkNav();
            }

            if (vm.options.dots) {
                let dotsIndex = vm.options.indexActive;
                if (vm.options.auto === true && vm.options.indexActive === vm.items.length) {
                    dotsIndex = 0;
                } else if (vm.options.auto === true && vm.options.indexActive < 0) {
                    dotsIndex = vm.items.length - -vm.options.indexActive;
                }
                vm.selectDots(dotsIndex);
            }

            if (vm.options.onGotoFinish) {
                vm.options.onGotoFinish(transform, _isAnimate, vm.options.speed, index, vm.items[index]);
            }
        });
    }

    removeItem(child, keepInCache) {
        const vm = this;
        let clone;

        const index = vm.items.indexOf(child);

        if (index < 0) {
            return undefined;
        }

        const _keepInCache = keepInCache ?? true;

        if (child?.parentNode) {
            if (vm.options.auto === true && child.carouselItemData.clone) {
                clone = child.carouselItemData.clone;
                clone.parentNode.removeChild(clone);
            }

            child.parentNode.removeChild(child);
            vm.items.splice(index, 1);
            vm.options.indexActive -= 1;
        }

        if (_keepInCache === false) {
            vm.removeFromCache(child);
        }

        vm.checkDots();

        return child;
    }

    addItem(item, positonIndex) {
        const vm = this,
            index = vm.cache.indexOf(item);
        let indexSibling = index - 1;

        if (
            index === -1 ||
            vm.items.length === 0 ||
            typeof vm.items[indexSibling] === 'undefined' ||
            vm.items[indexSibling] === null ||
            typeof vm.items[indexSibling].carouselItemData === 'undefined' ||
            vm.items[indexSibling].carouselItemData === null
        ) {
            indexSibling = null;
        }

        if (vm.items.length === 0 || (indexSibling === null && (typeof positonIndex === 'undefined' || positonIndex === null))) {
            vm.items.push(item);
            vm.list.insertAdjacentElement('beforeend', item);
        } else {
            vm.items.splice(positonIndex ?? indexSibling + 1, 0, item);
            vm.items[positonIndex ? positonIndex - 1 : indexSibling].insertAdjacentElement('afterend', item);
        }

        if (!item.carouselItemData) {
            vm.processItem(item);
        }

        return item;
    }

    updateItems(newItems, keepInCache) {
        const vm = this;
        const insertContent = document.createDocumentFragment();

        vm.items.length = 0;
        const _keepInCache = keepInCache ?? true;

        if (_keepInCache === false) {
            vm.clearCache();
        }

        for (let i = 0, len = newItems.length; i < len; i++) {
            insertContent.appendChild(newItems[i]);

            if (i < vm.countVisible) {
                vm.loadImg(newItems[i].querySelectorAll('img, video'), true);
            }
        }

        vm.list.innerHTML = '';
        vm.list.appendChild(insertContent);

        vm.processItems(newItems, true);

        return newItems;
    }

    getItems() {
        return this.items;
    }

    filterItems(filterFunction) {
        const vm = this,
            arrayAll = vm.cache;

        const carouselAsNavFor = vm.getCarouselAsNav();

        let _filterFunction = filterFunction;
        if (vm.options.filterFn) {
            _filterFunction = vm.options.filterFn;
        }

        const itemsForVisible = arrayAll.filter(_filterFunction).filter(onlyItemsOriginal);

        if (vm.observer) {
            for (let i = 0, len = arrayAll.length - 1; i <= len; i++) {
                if (arrayAll[i]) {
                    const img = arrayAll[i].querySelector('img');
                    if (img) {
                        img.classList.remove('loaded');
                        vm.observer.unobserve(img);
                    }
                }
            }
        }

        vm.items = vm.updateItems(itemsForVisible, true);

        if (vm.observer) {
            for (let j = 0; itemsForVisible.length > j; j++) {
                if (itemsForVisible[j]) {
                    const img = itemsForVisible[j].querySelector('img');
                    if (img) {
                        vm.observer.observe(img);
                    }
                }
            }
        }

        vm.options.indexActive = 0;

        vm.update();

        if (carouselAsNavFor) {
            vm.callFnCarouselAsNavFor(vm.filterItems, [filterFunction]);
        }

        return vm.items;
    }

    clearFilterItems() {
        const vm = this;

        vm.filterItems(() => true);
    }

    getActiveItem() {
        return this.items[this.options.indexActive];
    }

    getSelectedItem() {
        return this.itemSelected;
    }

    setItemSelect(itemForSelect) {
        if (typeof itemForSelect === 'undefined' || itemForSelect === null) {
            return;
        }
        const vm = this;
        let itemIndex;
        const carouselAsNavFor = vm.getCarouselAsNav();
        let item;
        vm.itemSelected = null;

        if (typeof itemForSelect === 'number') {
            itemIndex = itemForSelect;
            item = vm.items[itemIndex];

            if (typeof item === 'undefined' || item === null) {
                return;
            }
        } else {
            itemIndex = vm.items.indexOf(itemForSelect);
            item = itemForSelect;
        }

        vm.items.forEach((item1) => {
            if (vm.options.itemSelectClass) {
                vm.options.itemSelectClass.split(' ').forEach((classNameValue) => {
                    item1.classList.remove(classNameValue);
                });
            }

            if (item1.carouselItemData) {
                item1.carouselItemData.isSelect = false;
            }
        });

        if (vm.options.itemSelectClass) {
            vm.options.itemSelectClass.split(' ').forEach((cssClass) => {
                item.classList.add(cssClass);

                if (vm.options.auto === true && item.carouselItemData?.clone) {
                    item.carouselItemData.clone.classList.add(cssClass);
                }
            });
        }

        if (item.carouselItemData) {
            item.carouselItemData.isSelect = true;
            vm.itemSelected = item;
        }

        if (carouselAsNavFor) {
            vm.callFnCarouselAsNavFor(vm.setItemSelect, [itemIndex]);
        }
    }

    dotClick(event) {
        const vm = this;
        let currentDot;

        if (event.target.tagName.toLowerCase() === 'i') {
            currentDot = event.target.parentNode;
        } else if (event.target.tagName.toLowerCase() === 'li') {
            currentDot = event.target;
        } else {
            return;
        }

        const index = parseFloat(currentDot.dataset.index);

        vm.goto(index === 0 ? 0 : index + vm.options.scrollCount - 1);
    }

    itemClick(item) {
        const vm = this;
        let itemIndex;
        let itemObj;
        const carouselAsNavFor = vm.getCarouselAsNav();

        if (typeof item === 'number') {
            itemIndex = item;
            itemObj = vm.items[itemIndex];
        } else {
            itemIndex = vm.items.indexOf(item);
            itemObj = item;
        }

        vm.setItemSelect(itemObj);

        if (vm.options.itemSelect) {
            vm.options.itemSelect(vm, itemObj, itemIndex);
        }

        if (carouselAsNavFor) {
            if (carouselAsNavFor.isVisibleItem(itemIndex) === false) {
                carouselAsNavFor.goto(itemIndex, true);
            }

            vm.callFnCarouselAsNavFor(vm.itemClick, [itemIndex]);
        }
    }

    pointerSwape() {
        const vm = this;
        let startCoords, movedCoords;
        let isClick = true;

        function pointerStart(event) {
            startCoords = vm.getCoordinates(event);
            movedCoords = startCoords;
            isClick = true;

            if (vm.options.auto === true) {
                vm.stopAuto();
            }

            event.currentTarget.addEventListener('pointermove', pointerMove, { passive: true });
            event.currentTarget.addEventListener('pointerup', pointerEnd, { passive: true });
        }

        function pointerStartScroll() {
            const scrollEvent = debounce(() => {
                vm.inner.removeEventListener('scroll', scrollEvent);
                vm.inner.removeEventListener('pointerup', scrollEvent);
                const isVertical = vm.getIsVerticalOption();
                const newIndex = Math.ceil(vm.inner.scrollLeft / vm.itemsSize[vm.getPropName(isVertical)]);
                vm.goto(newIndex, true);
            }, 700);

            vm.inner.addEventListener('scroll', scrollEvent, { passive: true });
            vm.inner.addEventListener('pointerup', scrollEvent, { passive: true });
        }

        function pointerMove(event) {
            let validSwipe;
            const coords = vm.getCoordinates(event);
            const dim = coords.main - movedCoords.main;
            const dimAllTime = movedCoords.main - startCoords.main;

            isOverScrollX = vm.listSize.width + Math.abs(dimAllTime) - vm.slidesSize.width > vm.listSize.width;

            if (vm.options.auto === true) {
                vm.goToFirstInMobile();
            }

            // Проверяем, было ли движение больше минимального порога
            const minSwipeDistance = 5; // Минимальное расстояние для свайпа в пикселях
            if (Math.abs(coords.main - startCoords.main) > minSwipeDistance) {
                vm.animationLoop = false;
                isClick = false; // Если перемещение больше порога - это не клик
            } else {
                return;
            }

            vm.wrap.classList.add('carousel--grabbing');

            if (!isScrolling) {
                validSwipe = vm.validSwipe(startCoords, coords, dim >= 0 ? 1 : -1);
                isScrolling = Boolean(validSwipe);
            }
            if (isScrolling) {
                event.stopPropagation();
                vm.move((vm.transformValue || 0) + dim, false);
                movedCoords = coords;
            } else {
                if (vm.options.scrollNav === false) {
                    event.currentTarget.removeEventListener('pointermove', pointerMove);
                }

                event.currentTarget.removeEventListener('pointerup', pointerEnd);

                vm.wrap.classList.remove('carousel--grabbing');

                if (vm.options.auto === true) {
                    vm.startAuto();
                }
            }
        }

        function pointerEnd(event) {
            event.currentTarget.removeEventListener('pointermove', pointerMove);
            event.currentTarget.removeEventListener('pointerup', pointerEnd);
            const dim = movedCoords.main - startCoords.main;

            // Если это был клик (минимальное перемещение), отменяем перетаскивание
            if (isClick) {
                // Восстанавливаем автопрокрутку если нужно
                if (vm.options.auto === true) {
                    vm.startAuto();
                }

                vm.wrap.classList.remove('carousel--grabbing');
                isScrolling = false;
                return; // Прерываем выполнение функции, не вызывая gotoByTouhMove
            }

            if (isScrolling) {
                gotoByTouhMove(dim);
            }

            if (vm.options.auto === true) {
                vm.startAuto();
            }

            isScrolling = false;
            vm.wrap.classList.remove('carousel--grabbing');
        }

        function gotoByTouhMove(dim) {
            const dimAllTime = movedCoords.main - startCoords.main;
            const maxIndex = vm.items.length - vm.countVisible + (vm.options.auto === true ? vm.countVisible - 1 : 0);
            const minIndex = 0 - (vm.options.auto === true ? vm.countVisible - 1 : 0);
            const isVertical = vm.getIsVerticalOption();
            const touchMoveItemsCount = Math.abs(Math.round(dimAllTime / vm.slidesSize[vm.getPropName(isVertical)])) || 1;
            let index = dimAllTime < 0 ? vm.options.indexActive + touchMoveItemsCount : vm.options.indexActive - touchMoveItemsCount;
            const carouselAsNavFor = vm.getCarouselAsNav();
            const direction = dim >= 0 ? 'forward' : 'backward';

            if (vm.options.auto === false && index > maxIndex) {
                index = maxIndex;
            } else if (vm.options.auto === false && index < minIndex) {
                index = minIndex;
            }

            if (vm.options.auto === true && isOverScrollX && direction === 'backward') {
                index = vm.items.length - vm.countVisible + vm.clonesInOneDirection;
            } else if (vm.options.auto === true && isOverScrollX && direction === 'forward') {
                index = 0 - vm.countVisible;
            }

            if (carouselAsNavFor && carouselAsNavFor.isVisibleItem(index) === false) {
                carouselAsNavFor.goto(index, true);
            }

            vm.goto(index, true);

            isOverScrollX = false;
        }

        (vm.options.dragContainer ? vm.wrap.querySelector(vm.options.dragContainer) : vm.list).addEventListener(
            'pointerdown',
            vm.options.scrollNav === false ? pointerStart : pointerStartScroll,
            {
                passive: true,
            },
        );
    }

    getCoordinates(event) {
        const vm = this;
        const originalEvent = event.originalEvent || event;
        const touches = originalEvent.touches && originalEvent.touches.length ? originalEvent.touches : [originalEvent];
        const eventTouches = (originalEvent.changedTouches && originalEvent.changedTouches[0]) || touches[0];
        let result;
        const isVertical = vm.getIsVerticalOption();
        if (isVertical) {
            result = {
                main: eventTouches.clientY,
                alt: eventTouches.clientX,
            };
        } else {
            result = {
                main: eventTouches.clientX,
                alt: eventTouches.clientY,
            };
        }

        return result;
    }

    validSwipe(startCoords, coords) {
        const deltaAlt = Math.abs(coords.alt - startCoords.alt);
        const deltaMain = Math.abs(coords.main - startCoords.main);
        const vm = this;
        const touchAngle = (Math.atan2(Math.abs(deltaAlt), Math.abs(deltaMain)) * 180) / Math.PI;
        const isVertical = vm.getIsVerticalOption();
        if (isVertical === false && touchAngle > 45) {
            return false;
        }
        if (!isVertical && touchAngle <= 45) {
            return true;
        }
        return isVertical && 90 - touchAngle > 45;
    }

    bindIt() {
        const vm = this,
            { options } = vm;

        if (window.ResizeObserver) {
            // Пересчёт при любом изменении размера контейнера. Покрывает случаи, когда
            // touch-устройство не шлёт resize/orientationchange (например, webview mini-app,
            // получающий реальный размер уже после init), из-за чего карусель оставалась
            // с нулевыми размерами слайдов до следующего ре-рендера.
            let lastSize = 0;

            vm.resizeObserver = new ResizeObserver(
                debounce(() => {
                    const current = vm.wrap.getBoundingClientRect()[vm.propName];

                    if (current > 0 && current !== lastSize) {
                        lastSize = current;
                        vm.update();
                    }
                }, 100),
            );

            vm.resizeObserver.observe(vm.wrap);
        } else if (isTouchDevice === true) {
            window.addEventListener('orientationchange', vm.update.bind(vm));
        } else {
            window.addEventListener('resize', () => {
                vm.update();
            });
        }

        vm.pointerSwape();

        if (options.auto === true && isTouchDevice === false) {
            vm.wrap.addEventListener('pointerenter', () => {
                vm.stopAuto();
            });

            vm.wrap.addEventListener('pointerleave', () => {
                vm.startAuto();
            });
        }

        vm.wrap.addEventListener('click', (event) => {
            if (options.nav === true) {
                if (event.target === vm.navNext) {
                    vm.next();
                    return;
                } else if (event.target === vm.navPrev) {
                    vm.prev();
                    return;
                }
            }

            if (options.dots === true && closest(event.target, vm.dotsContainer) !== null) {
                vm.dotClick(event);
                return;
            }

            const itemClicked = event.target.closest('.js-carousel-item');

            if (itemClicked !== null) {
                vm.itemClick(itemClicked);
            }
        });

        if (vm.options.responsive) {
            Object.keys(vm.options.responsive).forEach((mqRule) => {
                const mq = getMediaQuery(mqRule);

                mq.addListener((event) => {
                    if (event.matches === true) {
                        vm.update();
                    }
                });
            });
        }
        if (vm.options.auto) {
            document.addEventListener('visibilitychange', () => {
                if (document.visibilityState === 'visible') {
                    vm.startAuto();
                } else {
                    vm.stopAuto();
                }
            });
        }
    }

    init() {
        const vm = this;

        //vm.cache.length = 0;
        vm.processItems(vm.items, true);

        vm.generate(vm.list);

        vm.sizes = vm.calc(
            vm.items,
            vm.options,
            typeof vm.options.responsive !== 'undefined' && vm.options.responsive !== null ? vm.responsiveOption : null,
        ); //vm.wrap, vm.inner, vm.list,

        vm.setSizes(vm.sizes.wrapSize, vm.sizes.innerSize, vm.sizes.listSize, vm.sizes.itemsSize);

        vm.checkDots();

        if (vm.options.nav === true) {
            vm.renderNav();
        }

        if (vm.options.auto === true && vm.countVisible < vm.items.length) {
            vm.cloneResult = vm.doClone();

            vm.sizes.listSize[vm.propName] += Math.abs(vm.cloneResult.marginLeftValue) * 2; //2 - с обеих сторон ширина клонированных слайдов

            vm.setSizes(vm.sizes.wrapSize, vm.sizes.innerSize, vm.sizes.listSize, vm.sizes.itemsSize);

            vm.goto(vm.options.indexActive, false);
        }

        if (vm.options.nav === true) {
            vm.checkNav();
        }

        if (vm.options.auto === true && autoStop !== true) {
            vm.startAuto();
        }

        if (vm.dots) {
            vm.selectDots(vm.options.indexActive);
        }

        if (vm.options.initFn) {
            vm.options.initFn(vm);
        }

        vm.bindIt();

        vm.setIntersectionObserver();

        vm.initilized = true;

        vm.wrap.classList.add('carousel-initilized');
        vm.addDirectionCarouselClass();

        return vm;
    }

    resetSizes(callback) {
        const vm = this;
        const isVertical = vm.getIsVerticalOption();

        vm.wrap.style[vm.propName] = isVertical ? '100%' : 'auto';
        vm.inner.style[vm.propName] = isVertical ? '100%' : 'auto';
        vm.list.style[vm.propName] = isVertical ? '100%' : 'auto';

        vm.list.style.marginLeft = '0';

        vm.removeDirectionCarouselClass();
        if (vm.navPref && vm.navNext) {
            vm.removeDirectionClassFromNav();
        }

        const oldClones = vm.list.querySelectorAll('.js-carousel-clone');
        for (let i = oldClones.length - 1; i >= 0; i--) {
            clearStyleSlide(oldClones[i], vm);
        }

        for (let i = vm.items.length - 1; i >= 0; i--) {
            clearStyleSlide(vm.items[i], vm);
            vm.items[i].setAttribute('style', vm.items[i].carouselItemData.stylesRaw || '');
        }

        if (vm.options.heightAuto) {
            vm.setHeightList(null);
        }

        setTimeout(() => {
            callback();
        }, 500);
    }

    update() {
        const vm = this;
        let sizes;

        vm.wrap.classList.remove('carousel-nav-not-show', 'carousel-nav-show');
        vm.wrap.classList.add('carousel-update');

        vm.resetSizes(() => {
            let childrenWithoutClone;
            if (vm.list.children?.length > 0) {
                childrenWithoutClone = Array.prototype.filter.call(vm.list.children, onlyItemsOriginal);
            } else {
                return;
            }

            vm.responsiveOption = vm.options.responsive ? vm.checkResponsive() : null;
            const isVertical = vm.getIsVerticalOption();
            vm.addDirectionCarouselClass();
            if (vm.navPref && vm.navNext) {
                vm.addDirectionClassFromNav();
            }
            vm.propName = vm.getPropName(isVertical);

            vm.items = Array.prototype.slice.call(childrenWithoutClone);
            vm.processItems(vm.items);
            sizes = vm.calc(vm.items, vm.options, vm.responsiveOption);

            vm.setSizes(sizes.wrapSize, sizes.innerSize, sizes.listSize, sizes.itemsSize);

            if (vm.options.auto === true) {
                vm.cloneResult = vm.doClone();

                if (vm.cloneResult) {
                    sizes.listSize[vm.propName] += Math.abs(vm.cloneResult.marginLeftValue) * 2; //2 - с обеих сторон ширина клонированных слайдов
                }

                vm.setSizes(sizes.wrapSize, sizes.innerSize, sizes.listSize, sizes.itemsSize);

                //vm.options.indexActive = 0;
            } else if (vm.options.nav === true) {
                vm.checkNav();
            }

            vm.goto(vm.options.indexActive, false);

            if (vm.options.dots === true) {
                vm.checkDots();
                vm.selectDots(vm.options.indexActive);
            }

            vm.reinitIntersectionObserver();

            vm.wrap.classList.remove('carousel-update');

            if (vm.options.onUpdate) {
                vm.options.onUpdate();
            }
        });
    }

    checkResponsive() {
        const vm = this;
        let mq;
        let mqOptions;
        const mqRules = Object.keys(this.options.responsive);

        for (let i = mqRules.length - 1; i >= 0; i--) {
            mq = getMediaQuery(mqRules[i]);
            mqOptions = vm.options.responsive[mqRules[i]];

            if (mq.matches === true) {
                break;
            }
        }

        return mqOptions;
    }

    getCarouselAsNav() {
        return storage[this.options.asNavFor] && storage[this.options.asNavFor].obj;
    }

    callFnCarouselAsNavFor(fn, params) {
        const vm = this;
        if (
            vm.options.asNavFor &&
            vm.options.asNavFor.length > 0 &&
            storage[vm.options.asNavFor] &&
            storage[vm.options.asNavFor].state.callAsNav !== true
        ) {
            storage[vm.options.asNavFor].state.callAsNav = true;
            fn.apply(storage[vm.options.asNavFor].obj, params);
            storage[vm.options.asNavFor].state.callAsNav = false;
        }
    }

    whenAsNavForReady(idAsNavFor, callback) {
        if (storage[idAsNavFor]) {
            callback(storage[idAsNavFor]);
        } else {
            deferList[idAsNavFor] = callback;
        }
    }

    resolveAsNavForReady(idAsNavFor) {
        if (deferList[idAsNavFor]) {
            deferList[idAsNavFor](storage[idAsNavFor]);
        }
    }

    isVisibleItem(item) {
        const vm = this;
        const itemObj = typeof item === 'number' ? vm.items[item] : item;
        const itemIndex = itemObj.carouselItemData.index;
        const isVertical = vm.getIsVerticalOption();
        const minIndex =
            (vm.options.scrollNav === true ? vm.inner.scrollLeft : Math.abs(vm.transformValue)) / vm.slidesSize[vm.getPropName(isVertical)];
        const maxIndex = minIndex + vm.countVisible;
        return minIndex < itemIndex && maxIndex > itemIndex;
    }

    getScrollDiff(itemSize, countVisible) {
        return this.options.scrollNav === true ? Math.ceil(itemSize / 2 / countVisible) : 0;
    }

    goToFirstInMobile() {
        const vm = this;
        if (vm.options.indexActive >= vm.items.length + vm.clonesInOneDirection - vm.countVisible) {
            vm.goto(0, false);
        } else if (vm.options.indexActive <= 0 - vm.clonesInOneDirection) {
            vm.goto(vm.items.length - vm.countVisible, false);
        }
    }

    setIntersectionObserver(objOptions, funcCallback, classElement) {
        const vm = this;
        const targetArr = vm.inner.querySelectorAll(classElement || 'img, video');

        if (targetArr && targetArr.length > 0) {
            const isVertical = vm.getIsVerticalOption();
            // rootMargin завязан на измеренный размер контейнера. Если на момент init размер
            // схлопнулся в 0 (скрытый/нулевой webview мини-аппа на первом открытии), отступ
            // станет "0px" и observer не подгрузит соседние слайды — будет виден только первый
            // слайд (у него src проставлен сервером), остальные останутся пустыми плейсхолдерами.
            // Поэтому страхуемся размером вьюпорта как нижней границей.
            const measuredMargin = isVertical ? vm.innerSize.height : vm.innerSize.width;
            const viewportMargin = isVertical ? window.innerHeight : window.innerWidth;
            const rootMargin = Math.max(measuredMargin || 0, viewportMargin || 0);
            const options = objOptions || {
                root: vm.inner,
                rootMargin: `${rootMargin}px`,
                threshold: 0,
            };
            const callback =
                funcCallback ||
                function (entries) {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            const mediaElement = entry.target;

                            vm.loadImg(mediaElement);

                            vm.observer.unobserve(mediaElement);
                        }
                    });
                };

            if (window.IntersectionObserver) {
                vm.observer = new IntersectionObserver(callback, options);

                for (const item of targetArr) {
                    vm.observer.observe(item);
                }
            } else {
                for (const img of targetArr) {
                    vm.loadImg(img);
                }
            }
        }
    }

    reinitIntersectionObserver(objOptions, funcCallback, classElement) {
        const vm = this;
        if (vm.observer) {
            vm.observer.disconnect();
        }
        vm.setIntersectionObserver(objOptions, funcCallback, classElement);
    }

    getIsVerticalOption() {
        const vm = this;
        return vm.responsiveOption?.isVertical ?? vm.options.isVertical;
    }

    removeDirectionCarouselClass() {
        this.wrap.classList.remove('carousel-vertical');
        this.wrap.classList.remove('carousel-horizontal');
    }

    addDirectionCarouselClass() {
        const isVertical = this.getIsVerticalOption();
        this.wrap.classList.add(isVertical ? 'carousel-vertical' : 'carousel-horizontal');
    }

    updateCarouselItemData(el) {
        const vm = this;
        let itemTemp = el;
        let slide;
        while (itemTemp && itemTemp !== document.body) {
            if (itemTemp.parentElement === vm.list) {
                slide = itemTemp;
                break;
            } else {
                itemTemp = itemTemp.parentElement;
            }
        }

        if (!slide || typeof slide.carouselItemData === 'undefined') {
            return;
        }

        const { width, height } = slide.getBoundingClientRect();

        slide.carouselItemData.originalWidth = width;
        slide.carouselItemData.originalHeight = height;

        slide.carouselItemData.parameters =
            // eslint-disable-next-line no-new-func
            slide.dataset.parameters !== null ? new Function(`return ${slide.dataset.parameters}`)() : null;
    }

    calcHeightList() {
        const vm = this;

        let slideNewActive;

        if (vm.cloneResult && vm.options.indexActive < 0) {
            slideNewActive = vm.cloneResult.clonesPrev.at(vm.options.indexActive);
        } else if (vm.cloneResult && vm.options.indexActive >= vm.items.length) {
            slideNewActive = vm.cloneResult.clonesNext.at(vm.options.indexActive - vm.items.length);
        } else {
            slideNewActive = vm.items.at(vm.options.indexActive);
        }

        if (!slideNewActive) {
            return;
        }

        const slideHeight = slideNewActive.carouselItemData?.originalHeight ?? slideNewActive.offsetHeight;
        vm.setHeightList(slideHeight);
    }

    setHeightList(val) {
        const vm = this;
        if (typeof val === 'undefined') {
            throw new Error('carousel: argument function "setHeightList" is undefined');
        } else if (val === null) {
            vm.list.style.removeProperty('--carousel-item-active-height');
        } else {
            vm.list.style.setProperty('--carousel-item-active-height', `${val}px`);
        }
    }
}

window.Carousel = Carousel;
