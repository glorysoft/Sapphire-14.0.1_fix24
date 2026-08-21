(function (ng) {
    
    const GalleryIconsCtrl = /* @ngInject */ function ($element, $filter, $q, $timeout, galleryIconsService) {
        let ctrl = this,
            timerSearch,
            contentScroll;

        ctrl.$onInit = function () {
            ctrl.inProgress = false;
            ctrl.page = 0;
            ctrl.prevTerm = '';
            ctrl.iconColor = 'rgb(0, 0, 0)';

            ctrl.colorPickerOptions = {
                swatchBootstrap: false,
                format: 'rgb',
                alpha: true,
                case: 'lower',
                swatchOnly: false,
                allowEmpty: true,
                required: false,
                preserveInputFormat: false,
                restrictToFormat: false,
                inputClass: 'gallery-icons-search__input',
            };

            ctrl.colorPickerEventApi = {
                onChange (colorPicker, value, event) {
                    return $timeout(() => {
                        colorPicker.getScope().AngularColorPickerController.setNgModel(value);
                        return colorPicker;
                    });
                },
            };
        };

        ctrl.$postLink = function () {
            ctrl.showContent = true;
            contentScroll = $element[0].querySelector('.gallery-icons-scroll');
        };

        ctrl.getData = function (term) {
            let _page = null;

            if (ctrl.itemsLoading === true) {
                return;
            }

            ctrl.itemsLoading = true;

            if (term !== ctrl.prevTerm) {
                ctrl.data = {};
                ctrl.page = 0;
            } else if (ctrl.finish === true) {
                ctrl.itemsLoading = false;
                return;
            }

            _page = ctrl.page += 1;

            //setTimeout - для того чтобы itemsLoading отрисовалось в шаблоне
            return $timeout(() => $q
                    .when(/[а-яА-Я]+/g.test(term) ? galleryIconsService.translate(term) : term)
                    .then((_term) => galleryIconsService.getData(_page, _term != null && _term.length > 0 ? _term : null))
                    .then((result) => {
                        ctrl.finish = result.finish;
                        ng.extend(ctrl.data, result.data);
                        ctrl.totalCount = result.totalCount;
                        ctrl.prevTerm = term;
                        return ctrl.data;
                    })
                    .finally(() => {
                        ctrl.isLoaded = true;
                        ctrl.itemsLoading = false;
                    }), 500);
        };

        ctrl.search = function (term) {
            if (timerSearch != null) {
                clearTimeout(timerSearch);
            }

            timerSearch = setTimeout(() => {
                ctrl.page = 0;
                ctrl.getData(term).then(() => {
                    contentScroll.scrollTo(0, 0);
                });
            }, 700);
        };

        ctrl.select = function (svg, color, width, height) {
            if (ctrl.onSelect != null && ctrl.inProgress === false) {
                ctrl.inProgress = true;

                let svgResult = svg.replace(/(color:)(.+);/, (match, p1, p2) => `${p1 + color  };`);

                if (width != null && width > 0 && height != null && height > 0) {
                    svgResult = $filter('galleryIconsSize')(svgResult, width, height);
                }

                $q.when(ctrl.onSelect({ svg: svgResult, width, height }) || true)
                    .then(() => {
                        galleryIconsService.closeModal();
                    })
                    .finally(() => {
                        ctrl.inProgress = false;
                    });
            }
        };
    };

    ng.module('galleryIcons').controller('GalleryIconsCtrl', GalleryIconsCtrl);
})(window.angular);
