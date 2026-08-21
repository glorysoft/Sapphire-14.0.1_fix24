const memoryItemsAsClone = (ngElement) => {
    let { children } = ngElement[0];

    if (children && children.length > 0) {
        if (children.length === 1 && children[0].classList.contains('carousel-inner')) {
            children = children[0];
        }

        if (children) {
            for (let i = 0, len = children.length; i < len; i++) {
                children[i].carouselItemData ??= {};
                children[i].carouselItemData.originalClone = children[i].cloneNode(true);
            }
        }
    }
};

/* @ngInject */
function carouselDirective($document, $window) {
    return {
        restrict: 'A',
        scope: {
            isVertical: '<?',
            scrollCount: '<?',
            nav: '<?',
            dots: '<?',
            speed: '<?',
            auto: '<?',
            autoPause: '<?',
            indexActive: '=?',
            prevIcon: '@',
            nextIcon: '@',
            filterFn: '&',
            prevIconVertical: '@',
            nextIconVertical: '@',
            prevClass: '@',
            nextClass: '@',
            dotsClass: '@',
            dotsItemClass: '@',
            dotsItemSelectedClass: '@',
            dotsItemInnerSelectedClass: '@',
            visibleMax: '<?',
            visibleMin: '<?',
            itemSelectClass: '@',
            itemActiveClass: '@',
            carouselClass: '@',
            stretch: '<?',
            navPosition: '@',
            initOnLoad: '<?',
            load: '=?',
            initFn: '&',
            itemSelect: '&',
            initilazeTo: '@',
            responsive: '<?', //пример: {768: {slidesToShow : 3}}
            asNavFor: '@', // accept id carousel
            scrollNav: '<?',
            onGotoStart: '&',
            onGotoFinish: '&',
            onGoto: '&',
            onUpdate: '&',
            onCalc: '&',
            heightAuto: '<?',
            dragContainer: '@',
        },
        controller: 'CarouselCtrl',
        controllerAs: 'carousel',
        bindToController: true,
        link(scope, element, _attrs, ctrl) {
            function _initWrap() {
                if (ctrl.initOnLoad === true) {
                    const unbind = scope.$watch('carousel.load', (newValue) => {
                        if (newValue) {
                            ctrl.init();
                            unbind();
                        }
                    });
                } else {
                    ctrl.init();
                }
            }

            memoryItemsAsClone(element);

            if ($document[0].readyState !== 'complete') {
                $window.addEventListener('load', () => {
                    _initWrap();
                });
            } else {
                _initWrap();
            }
        },
    };
}

/* @ngInject */
function carouselImgDirective($parse) {
    return {
        require: '^carousel',
        link(scope, _element, attrs, carouselCtrl) {
            const callbackParsed = $parse(attrs.carouselImg);

            const callback = (img, carouselItem) => callbackParsed(scope, { img, carouselItem });

            const carouselImgId = carouselCtrl.addCarouselImg({
                callback,
            });

            attrs.$set('dataCarouselImgId', carouselImgId);
        },
    };
}

function carouselSlideDirective() {
    return {
        require: {
            carousel: '^carousel',
        },
        scope: true,
        controller: 'CarouselSlideCtrl',
        controllerAs: 'carouselSlide',
        bindToController: true,
    };
}

export { carouselDirective, carouselImgDirective, carouselSlideDirective };
