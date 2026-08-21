import { carouselScopeEvents } from '../carousel.constants.js';
/* @ngInject */
const CarouselCtrl = function ($attrs, $compile, $element, $scope, $q, carouselService, carouselDefault) {
    const ctrl = this;
    const carouselImgList = {};
    const deferList = [];
    const slidesMap = new Map();
    const slidesMapWaiting = new Set();

    // eslint-disable-next-line complexity
    ctrl.$onInit = function () {
        ctrl.isVertical ??= carouselDefault.isVertical;
        ctrl.scrollCount ??= carouselDefault.scrollCount;
        ctrl.nav ??= carouselDefault.nav;
        ctrl.dots ??= carouselDefault.dots;
        ctrl.speed ??= carouselDefault.speed;
        ctrl.auto ??= carouselDefault.auto;
        ctrl.autoPause ??= carouselDefault.autoPause;
        ctrl.indexActive = angular.isNumber(ctrl.indexActive) ? ctrl.indexActive : carouselDefault.indexActive;
        ctrl.prevIcon ??= carouselDefault.prevIcon;
        ctrl.nextIcon ??= carouselDefault.nextIcon;
        ctrl.prevIconVertical ??= carouselDefault.prevIconVertical;
        ctrl.nextIconVertical ??= carouselDefault.nextIconVertical;
        ctrl.prevClass ??= carouselDefault.prevClass;
        ctrl.nextClass ??= carouselDefault.nextClass;
        ctrl.dotsClass ??= carouselDefault.dotsClass;
        ctrl.dotsItemClass ??= carouselDefault.dotsItemClass;
        ctrl.dotsItemSelectedClass ??= carouselDefault.dotsItemSelectedClass;
        ctrl.dotsItemInnerSelectedClass ??= carouselDefault.dotsItemInnerSelectedClass;
        ctrl.visibleMax ??= carouselDefault.visibleMax;
        ctrl.visibleMin ??= carouselDefault.visibleMin;
        ctrl.itemSelectClass ??= carouselDefault.itemSelectClass;
        ctrl.stretch ??= carouselDefault.stretch;
        ctrl.navPosition ??= carouselDefault.navPosition;
        ctrl.heightAuto ??= carouselDefault.heightAuto;
        ctrl.carouselOptions = {
            isVertical: ctrl.isVertical,
            scrollCount: ctrl.scrollCount,
            nav: ctrl.nav,
            dots: ctrl.dots,
            speed: ctrl.speed,
            auto: ctrl.auto,
            autoPause: ctrl.autoPause,
            indexActive: ctrl.indexActive,
            prevIcon: ctrl.prevIcon,
            nextIcon: ctrl.nextIcon,
            prevIconVertical: ctrl.prevIconVertical,
            nextIconVertical: ctrl.nextIconVertical,
            prevClass: ctrl.prevClass,
            nextClass: ctrl.nextClass,
            filterFn:
                $attrs.filterFn && ctrl.filterFn
                    ? function (item, index, array) {
                          return ctrl.filterFn({
                              item,
                              index,
                              array,
                          });
                      }
                    : null,
            dotsClass: ctrl.dotsClass,
            dotsItemClass: ctrl.dotsItemClass,
            dotsItemSelectedClass: ctrl.dotsItemSelectedClass,
            dotsItemInnerSelectedClass: ctrl.dotsItemInnerSelectedClass,
            visibleMax: ctrl.visibleMax,
            visibleMin: ctrl.visibleMin,
            itemSelectClass: ctrl.itemSelectClass,
            itemActiveClass: ctrl.itemActiveClass,
            carouselClass: ctrl.carouselClass,
            stretch: ctrl.stretch,
            navPosition: ctrl.navPosition,
            animateString: ctrl.animateString,
            heightAuto: ctrl.heightAuto,
            initFn(carousel) {
                if (ctrl.initFn) {
                    ctrl.initFn({ carousel });
                }
                if (slidesMap.size > 0) {
                    ctrl.slideFireScopeEvent(carouselScopeEvents.init, ctrl.carouselNative.options.indexActive, carousel);
                }
                $scope.$apply();
            },
            itemSelect(carousel, item, index) {
                ctrl.itemSelect({
                    carousel,
                    item: item.carouselItemData,
                    index,
                });

                $scope.$apply();
            },
            responsive: ctrl.responsive,
            asNavFor: ctrl.asNavFor,
            scrollNav: ctrl.scrollNav === true,
            onLazyLoad(img, carouselItem) {
                ctrl.callFnFromCarouselImg(img, carouselItem);

                $scope.$apply();
            },
            onDoClone(cloneResult) {
                $compile(cloneResult.clonesPrev.concat(cloneResult.clonesNext))($scope);
                $scope.$apply();
            },
            onUpdate(carousel) {
                if (ctrl.onUpdate) {
                    ctrl.onUpdate({ carousel });
                    $scope.$apply();
                }
            },
            onGotoStart(distance, useAnimate, speed, index, slide) {
                if (ctrl.onGotoStart) {
                    ctrl.onGotoStart({
                        distance,
                        useAnimate,
                        speed,
                        index,
                        slide,
                    });
                }
                if (slidesMap.size > 0) {
                    ctrl.slideFireScopeEvent(carouselScopeEvents.onGotoStart, index, {
                        distance,
                        useAnimate,
                        speed,
                        index,
                        slide,
                    });
                }
            },
            onGoto(slide) {
                if (ctrl.onGoto) {
                    ctrl.onGoto({ slide });
                }
            },
            onGotoFinish(distance, useAnimate, speed, index, slide) {
                if (ctrl.onGotoFinish) {
                    ctrl.onGotoFinish({ distance, useAnimate, speed, index, slide });
                }
                if (slidesMap.size > 0) {
                    ctrl.slideFireScopeEvent(carouselScopeEvents.onGotoFinish, index, {
                        distance,
                        useAnimate,
                        speed,
                        index,
                        slide,
                    });
                }
            },
            onCalc(carousel) {
                if (ctrl.onCalc) {
                    ctrl.onCalc({ carousel });
                    $scope.$apply();
                }
            },
            dragContainer: ctrl.dragContainer,
        };
    };

    ctrl.init = function () {
        const element = $element[0];
        const images = element.querySelectorAll('img:not([data-src]), video:not([data-src])');

        return carouselService.waitLoadImages(images, ctrl.carouselOptions).then(() => {
            setTimeout(() => {
                let carouselEl = element;

                if (ctrl.initilazeTo) {
                    carouselEl = carouselEl.querySelector(ctrl.initilazeTo);
                }
                /* eslint-disable no-undef */
                ctrl.carouselNative = new Carousel(carouselEl, ctrl.carouselOptions).init();

                if (deferList.length > 0) {
                    deferList.forEach((item) => {
                        item.resolve(ctrl);
                    });
                }

                if (slidesMapWaiting.size > 0) {
                    Array.from(slidesMapWaiting.values()).forEach((slide) => ctrl.processSlide(slide));
                    slidesMapWaiting.clear();
                    ctrl.slideFireScopeEvent(carouselScopeEvents.init, ctrl.carouselNative.options.indexActive);
                }

                $scope.$digest();
            }, 0);
        });
    };

    ctrl.addCarouselImg = function (carouselImg) {
        const id = ctrl.generateCarouselImgId();
        carouselImgList[id] = carouselImg;
        return id;
    };

    ctrl.callFnFromCarouselImg = function (img) {
        const id = img.dataset.carouselImgId;
        if (carouselImgList[id]) {
            carouselImgList[id].callback();
        }
    };

    ctrl.generateCarouselImgId = function () {
        return `carouselImgId_${Math.random()}`;
    };

    ctrl.whenCarouselInit = function () {
        const defer = $q.defer();
        if (typeof ctrl.carouselNative === 'undefined' || ctrl.carouselNative === null) {
            deferList.push(defer);
        } else {
            defer.resolve(ctrl);
        }

        return defer.promise;
    };

    ctrl.addSlide = function (carouselSlide) {
        if (ctrl.carouselNative) {
            ctrl.processSlide(carouselSlide);
        } else {
            slidesMapWaiting.add(carouselSlide);
        }
    };

    ctrl.removeSlide = function (carouselSlide) {
        slidesMapWaiting.delete(carouselSlide);
        if (typeof carouselSlide.index !== 'undefined') {
            slidesMap.delete(carouselSlide.index);
        }
    };

    ctrl.processSlide = function (carouselSlide) {
        if (!document.body.contains(carouselSlide.element)) {
            return;
        }

        let index = ctrl.carouselNative.items.indexOf(carouselSlide.element);

        if (index === -1) {
            if (!this.carouselNative.cloneResult || !carouselSlide.isClone()) {
                return;
            }
            index = Array.from(ctrl.carouselNative.list.children).indexOf(carouselSlide.element) - ctrl.carouselNative.countVisible;
            carouselSlide.index = index;
        } else {
            carouselSlide.index = ctrl.carouselNative.items[index].carouselItemData.index;
        }

        slidesMap.set(index, carouselSlide);
    };

    ctrl.slideFireScopeEvent = function (scopeEventName, index, data) {
        let slide = slidesMap.get(index);
        if (typeof slide === 'undefined') {
            if (!this.carouselNative.cloneResult) {
                return;
            }

            slide = slidesMap.get(ctrl.carouselNative.items.length - index);
        }

        slide.fireScopeEvent(scopeEventName, data);
    };
};

export default CarouselCtrl;
