let i = 0;

/* @ngInject */
function InplaceImageCtrl($compile, $element, $scope, $window, domService, Upload, toaster, $translate) {
    const ctrl = this;

    ctrl.$onInit = function () {
        ctrl.tagImage = $element[0];

        ctrl.isActive = false;
        ctrl.isHoverButtons = false;

        i += 1;

        ctrl.i = i;
    };

    ctrl.setPositionButtons = function (buttons) {
        buttons.css({
            top: $element[0].offsetTop + $element[0].height,
            left: $element[0].offsetLeft + $element[0].width - buttons[0].offsetWidth,
        });

        ctrl.buttonsAligned = true;
    };

    ctrl.onLoadButtons = function (buttonsCtrl, _buttonsElement) {
        ctrl.buttons = buttonsCtrl;
        ctrl.buttonsRendered = true;
    };

    ctrl.active = function () {
        ctrl.isActive = true;
        ctrl.showButtons = true;
    };

    ctrl.fileDrop = function (files, event) {
        return ctrl.fileChange(files, event, ctrl.inplaceParams.id && ctrl.inplaceParams.id !== 0 ? 'update' : 'add');
    };

    ctrl.fileChange = function (files, _event, command) {
        if (!command) {
            throw Error("Parameter 'command' required for inplace image");
        }

        //in productview
        if (ctrl.productViewItem) {
            if (typeof ctrl.productViewItem.picture.PhotoId !== 'undefined' && ctrl.productViewItem.picture.PhotoId !== null) {
                angular.extend(ctrl.inplaceParams, { id: ctrl.productViewItem.picture.PhotoId });
            }

            if (typeof ctrl.productViewItem.colorSelected !== 'undefined' && ctrl.productViewItem.colorSelected !== null) {
                angular.extend(ctrl.inplaceParams, { colorId: ctrl.productViewItem.colorSelected.ColorId });
            }
        } else if (ctrl.product) {
            //inplaceService.startProgress();

            if (
                typeof ctrl.product.picture.PhotoId !== 'undefined' &&
                ctrl.product.picture.PhotoId !== null &&
                ctrl.inplaceParams.field !== 'Review'
            ) {
                angular.extend(ctrl.inplaceParams, { id: ctrl.product.picture.PhotoId });
            }

            if (typeof ctrl.product.colorSelected !== 'undefined' && ctrl.product.colorSelected !== null) {
                angular.extend(ctrl.inplaceParams, { colorId: ctrl.product.colorSelected.ColorId });
            }
        }

        ctrl.inplaceParams.command = command;

        return Upload.upload({
            url: ctrl.inplaceUrl,
            data: {
                data: JSON.stringify(angular.extend(ctrl.inplaceParams, { rnd: Math.random() })),
                file: files,
            },
        }).then((response) => {
            const data = response.data;

            if (data[0].error != null) {
                toaster.pop('error', '', $translate.instant(data[0].error));
            }

            if (data.errors) {
                data.errors.forEach((err) => {
                    toaster.pop('error', '', err);
                });
            } else {
                switch (command) {
                    case 'add':
                        ctrl.addedImage(response.data, ctrl.inplaceParams.field);
                        break;
                    case 'update':
                        ctrl.updatedImage(response.data, ctrl.inplaceParams.field);
                        break;
                    case 'delete':
                        ctrl.deletedImage(response.data, ctrl.inplaceParams.field);
                        break;
                    default:
                        throw new Error(`inplaceImage: unknown command: ${command}`);
                }
            }
        });
        //    .finally(function () {
        //    inplaceService.stopProgress();
        //});
    };

    // eslint-disable-next-line complexity
    ctrl.addedImage = function (result, field) {
        const img = ctrl.tagImage;

        let carousel, clone, cloneImg, cloneImgParams, cloneImgButtons, imgButtonsEmpty;

        if (result?.length > 0 && field) {
            switch (field) {
                case 'Logo':
                case 'Brand':
                case 'News':
                case 'CategorySmall':
                case 'CategoryBig':
                case 'Review':
                    img.src = result[0].filename;
                    break;
                case 'Product':
                    for (let index = 0, len = result.length; index < len; index++) {
                        img.src = result[index].filename;
                        // eslint-disable-next-line no-new-func
                        cloneImgParams = new Function(`return ${img.getAttribute('data-inplace-params')}`)();
                        cloneImgParams.id = result[index].id;
                        img.setAttribute('data-inplace-params', JSON.stringify(cloneImgParams).replace(/"/gu, "'"));

                        if (index === 0) {
                            // eslint-disable-next-line max-depth
                            if (ctrl.productViewItem) {
                                ctrl.productViewItem.picture.PhotoId = cloneImgParams.id;
                                ctrl.productViewItem.clearPhotos();
                            } else if (ctrl.product) {
                                $window.location.reload(true);
                            }
                        }
                    }

                    break;
                case 'Carousel': {
                    carousel = ctrl.carousel;

                    clone = carousel.carouselNative.getActiveItem().cloneNode(true);
                    cloneImg = clone.querySelector('[data-inplace-image]');

                    clone.querySelector('.inplace-buttons').parentNode.removeChild(clone.querySelector('.inplace-buttons'));

                    //#region edit inplace params
                    // eslint-disable-next-line no-new-func
                    cloneImgParams = new Function(`return ${cloneImg.getAttribute('data-inplace-params')}`)();
                    cloneImgParams.id = result[0].id;
                    cloneImg.id = `inplaceImage_${result[0].id}`;
                    cloneImg.setAttribute('data-inplace-params', JSON.stringify(cloneImgParams).replace(/"/gu, "'"));
                    //#endregion

                    //#region edit inplace image buttons
                    // eslint-disable-next-line no-new-func
                    cloneImgButtons = new Function(`return ${cloneImg.getAttribute('data-inplace-image-buttons-visible')}`)();
                    cloneImgButtons.add = true;
                    cloneImgButtons.update = true;
                    cloneImgButtons.delete = true;
                    cloneImgButtons.permanentVisible = false;
                    cloneImg.setAttribute('data-inplace-image-buttons-visible', JSON.stringify(cloneImgButtons).replace(/"/gu, "'"));
                    //#endregion

                    cloneImg.src = result[0].filename;

                    //remove special slide for inplace
                    if (carousel.carouselNative.items.length === 1) {
                        // eslint-disable-next-line no-new-func
                        imgButtonsEmpty = new Function(
                            `return ${carousel.carouselNative
                                .getActiveItem()
                                .querySelector('[data-inplace-image]')
                                .getAttribute('data-inplace-image-buttons-visible')}`,
                        )();

                        if (imgButtonsEmpty.add === true && imgButtonsEmpty.update === false && imgButtonsEmpty.delete === false) {
                            carousel.carouselNative.removeItem(carousel.carouselNative.getActiveItem(), false);
                        }
                    }
                    const indexNewSlide = carousel.carouselNative.options.indexActive + 1;
                    carousel.carouselNative.addItem(clone, indexNewSlide);

                    if (!cloneImg.complete || typeof cloneImg.naturalWidth !== 'undefined' || cloneImg.naturalWidth === 0) {
                        cloneImg.onload = function () {
                            carousel.carouselNative.update();
                            carousel.carouselNative.goto(carousel.carouselNative.items.length > 0 ? indexNewSlide : 0);
                        };
                    } else {
                        carousel.carouselNative.update();
                        carousel.carouselNative.goto(carousel.carouselNative.items.length > 0 ? indexNewSlide : 0);
                    }

                    $compile(clone)($scope);
                    break;
                }
                default:
                    throw Error(`Unknow type for inplace image: ${field}`);
            }
        }
    };

    ctrl.updatedImage = function (result, field) {
        const img = ctrl.tagImage;
        let cloneImgParams;

        if (result?.length > 0 && field) {
            switch (field) {
                case 'Logo':
                case 'Brand':
                case 'News':
                case 'CategorySmall':
                case 'CategoryBig':
                    img.src = result[0].filename;
                    break;
                case 'Carousel':
                    img.src = result[0].filename;
                    ctrl.carousel.carouselNative.update();
                    break;
                case 'Product':
                    img.src = result[0].filename;
                    // eslint-disable-next-line no-new-func
                    cloneImgParams = new Function(`return ${img.getAttribute('data-inplace-params')}`)();
                    cloneImgParams.id = result[0].id;
                    img.setAttribute('data-inplace-params', JSON.stringify(cloneImgParams).replace(/"/gu, "'"));

                    if (ctrl.productViewItem) {
                        ctrl.productViewItem.picture.PhotoId = cloneImgParams.id;
                        ctrl.productViewItem.clearPhotos();
                    } else if (ctrl.product) {
                        $window.location.reload();
                    }

                    break;
                case 'Review':
                    img.src = result[0].filename;

                    //cloneImgParams = (new Function('return ' + img.getAttribute('data-inplace-params')))();
                    //cloneImgParams.id = result[0].id;
                    //img.setAttribute('data-inplace-params', JSON.stringify(cloneImgParams).replace(/"/g, '\''));
                    ctrl.inplaceParams.id = result[0].id;
                    break;
                default:
                    throw Error(`Unknow type for inplace image: ${field}`);
            }
        }
    };

    // eslint-disable-next-line complexity
    ctrl.deletedImage = function (result, field) {
        const img = ctrl.tagImage;
        let carousel, itemIndex, clone, cloneImg, cloneImgParams, cloneImgButtons;

        if (result?.length > 0 && field) {
            switch (field) {
                case 'Logo':
                case 'Brand':
                case 'News':
                case 'CategorySmall':
                case 'CategoryBig':
                    img.src = result[0].filename;
                    break;
                case 'Product':
                    img.src = result[0].filename;
                    // eslint-disable-next-line no-new-func
                    cloneImgParams = new Function(`return ${img.getAttribute('data-inplace-params')}`)();
                    cloneImgParams.id = result[0].id;
                    img.setAttribute('data-inplace-params', JSON.stringify(cloneImgParams).replace(/"/gu, "'"));

                    if (ctrl.productViewItem) {
                        ctrl.productViewItem.picture.PhotoId = cloneImgParams.id;
                        ctrl.productViewItem.clearPhotos();
                    } else if (ctrl.product) {
                        $window.location.reload();
                    }

                    break;
                case 'Review':
                    img.src = result[0].filename;

                    //cloneImgParams = (new Function('return ' + img.getAttribute('data-inplace-params')))();
                    //cloneImgParams.id = result[0].id;
                    //img.setAttribute('data-inplace-params', JSON.stringify(cloneImgParams).replace(/"/g, '\''));
                    ctrl.inplaceParams.id = result[0].id;
                    break;
                case 'Carousel':
                    carousel = ctrl.carousel;

                    if (carousel) {
                        //clone element which will deleted
                        if (carousel.carouselNative.items.length === 1) {
                            clone = carousel.carouselNative.getActiveItem().cloneNode(true);
                            cloneImg = clone.querySelector('[data-inplace-image]');

                            clone.querySelector('.inplace-buttons').parentNode.removeChild(clone.querySelector('.inplace-buttons'));

                            //#region edit inplace params
                            // eslint-disable-next-line no-new-func
                            cloneImgParams = new Function(`return ${cloneImg.getAttribute('data-inplace-params')}`)();
                            cloneImgParams.id = 0;
                            cloneImg.removeAttribute('id');
                            cloneImg.setAttribute('data-inplace-params', JSON.stringify(cloneImgParams).replace(/"/gu, "'"));
                            //#endregion

                            //#region edit inplace image buttons
                            // eslint-disable-next-line no-new-func
                            cloneImgButtons = new Function(`return ${cloneImg.getAttribute('data-inplace-image-buttons-visible')}`)();
                            cloneImgButtons.update = false;
                            cloneImgButtons.delete = false;
                            cloneImgButtons.permanentVisible = true;
                            cloneImg.setAttribute('data-inplace-image-buttons-visible', JSON.stringify(cloneImgButtons).replace(/"/gu, "'"));
                            //#endregion

                            cloneImg.src = result[0].filename;
                        }

                        itemIndex = domService.closest(img, '.js-carousel-item').carouselItemData.index;
                        carousel.carouselNative.removeItem(carousel.carouselNative.items[itemIndex], false);

                        if (clone) {
                            carousel.carouselNative.addItem(clone);
                            $compile(clone)($scope);
                        }

                        if (cloneImg && (!cloneImg.complete || typeof cloneImg.naturalWidth !== 'undefined' || cloneImg.naturalWidth === 0)) {
                            cloneImg.onload = function () {
                                carousel.carouselNative.update();
                                carousel.carouselNative.goto(carousel.carouselNative.items.length - 1);
                            };
                        } else {
                            carousel.carouselNative.update();
                            carousel.carouselNative.goto(carousel.carouselNative.items.length - 1);
                        }
                    }
                    break;
                default:
                    throw Error(`Unknow type for inplace image: ${field}`);
            }
        }
    };
}

export default InplaceImageCtrl;
