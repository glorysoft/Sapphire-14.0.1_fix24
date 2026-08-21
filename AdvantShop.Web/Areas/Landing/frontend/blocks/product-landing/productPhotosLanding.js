(function (ng) {
    

    const ProductPhotosLandingCtrl = function ($timeout, $parse, $scope) {
        let ctrl = this,
            isMainPhoto = null,
            isSetMainPhoto = null,
            colorIds = [],
            initColorsId = false,
            slickHeightFor,
            slicksArray = [];

        ctrl.$onInit = function () {
            ctrl.hideCarouselNav = false;
            ctrl.showDefaultPhoto = false;

            ctrl.carouselOptionsNav = {
                event: {
                    init: ctrl.initSlick,
                    reInit: ctrl.reIndex,
                },
                slidesToShow: 2,
                slidesToScroll: 1,
                centerMode: false,
                asNavFor: '.modal-quickview .product-details__carousel-for',
                dots: false,
                slickFilter: 'productLanding.filterCarouselItems()',
                centerPadding: "'0px'",
                arrows: true,
                mobileFirst: false,
                focusOnSelect: true,
                variableWidth: false,
            };

            ctrl.carouselOptionsFor = {
                focusOnSelect: true,
                event: {
                    init: ctrl.initSlick,
                    setPosition: ctrl.calcHeightSlick,
                },
                slickFilter: 'productLanding.filterCarouselItems()',
                slidesToShow: 1,
                centerMode: true,
                centerPadding: "'0px'",
                slidesToScroll: 1,
                arrows: true,
                mobileFirst: false,
                asNavFor: '.modal-quickview .product-details__carousel-nav',
            };
        };

        ctrl.initSlick = function (event, slick) {
            slicksArray.push(slick);
            ctrl.slick = slick;
            ctrl.callFilterSlick([slick]);
        };

        ctrl.calcHeightSlick = function (slick) {
            slickHeightFor = slick.target.offsetHeight;
            return slick.target.offsetHeight;
        };

        ctrl.getHeightSlickFor = function () {
            return slickHeightFor != null ? `${slickHeightFor  }px` : 'auto';
        };

        ctrl.reIndex = function (slick) {
            if (slick.$slides != null) {
                slick.$slides.each((index, element) => {
                    $(element).attr('data-slick-index', index);
                });
            }
        };

        ctrl.callFilterSlick = function (slicksArray) {
            if (slicksArray != null && slicksArray.length > 0) {
                slicksArray.forEach((item) => {
                    isSetMainPhoto = false;

                    item.slickUnfilter();

                    item.slickFilter(ctrl.filterCarouselItems);
                    ctrl.reIndex(item);

                    if (item.slideCount === 0) {
                        item.slickUnfilter();
                        item.slickFilter(ctrl.setMainPhoto);
                        ctrl.hideCarouselNav = true;
                    } else if (item.slideCount === 1) {
                            ctrl.hideCarouselNav = true;
                        } else {
                            ctrl.hideCarouselNav = false;
                        }

                    if (ctrl.photoViewer != null) {
                        const clonedSlides = item.$slider.find('.slick-cloned');
                        if (clonedSlides.length > 0) {
                            clonedSlides.each((index, item) => {
                                $(item).find('a.js-details-carousel-item__link').addClass('ignore-baguette');
                            });
                        }
                        ctrl.photoViewer.reinit();
                    }
                });
            }
        };

        ctrl.loadData = function (productCtrl) {
            if (ctrl.productCtrl == null) {
                ctrl.productCtrl = productCtrl;
            }

            if (productCtrl.filterPhotos != null) {
                const oldFn = productCtrl.filterPhotos;

                productCtrl.filterPhotos = function () {
                    oldFn.apply(productCtrl, arguments);

                    if (ctrl.photoViewer != null) {
                        ctrl.photoViewer.reinit();
                    }
                };
            }

            if (productCtrl.changeColor != null) {
                const oldFnChangeColor = productCtrl.changeColor;
                productCtrl.changeColor = function () {
                    oldFnChangeColor.apply(productCtrl, arguments);
                    ctrl.setColor(productCtrl.colorSelected.ColorId);
                };
            }
        };

        ctrl.setColor = function (colorId) {
            ctrl.colorId = colorId;
            ctrl.callFilterSlick(slicksArray);
        };

        ctrl.setMainPhoto = function (index, el) {
            const target = el.querySelector('.js-details-carousel-item') || el;

            if (!isSetMainPhoto) {
                isSetMainPhoto = true;
                if (isMainPhoto) {
                    return $parse(target.dataset.parameters)($scope).main === true;
                } 
                    return true;
                
            } 
                return false;
            
        };

        ctrl.filterCarouselItems = function (index, el) {
            const target = el.querySelector('.js-details-carousel-item') || el;

            if (target != null) {
                const targetColorId = target.dataset.colorId;
                const parameters = $parse(target.dataset.parameters)($scope);
                if (parameters != null && parameters.main === true) {
                    isMainPhoto = true;
                }

                return targetColorId == null || parseInt(targetColorId) === ctrl.colorId;
            }

            return false;
        };
        ctrl.addPhotoViewer = function (photoViewer) {
            ctrl.photoViewer = photoViewer;
        };

        ctrl.filterPhoto = function (item, index, array) {
            const colorId = item.carouselItemData.parameters.colorId;

            if (colorId == null) {
                return true;
            }

            if (colorIds.indexOf(colorId) === -1 && !initColorsId) {
                colorIds.push(colorId);
            }

            if (index === array.length - 1) {
                initColorsId = true;
            }

            if (initColorsId && colorIds.indexOf(ctrl.productCtrl.colorSelected.ColorId) === -1) {
                return item.carouselItemData.parameters.main;
            } 
                return item != null && (ctrl.productCtrl.colorSelected.ColorId == null || colorId == ctrl.productCtrl.colorSelected.ColorId);
            
        };
    };

    ProductPhotosLandingCtrl.$inject = ['$timeout', '$parse', '$scope'];

    ng.module('productPhotosLanding', ['product', 'advBaguetteBox']).controller('ProductPhotosLandingCtrl', ProductPhotosLandingCtrl);
})(window.angular);
