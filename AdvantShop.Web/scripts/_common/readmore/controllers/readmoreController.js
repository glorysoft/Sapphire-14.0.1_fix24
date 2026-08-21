(function (ng) {
    const ReadmoreCtrl = function ($document, $element, $timeout, readmoreConfig, $window, $scope) {
        const ctrl = this;
        let timer;

        ctrl.$onInit = function () {
            ctrl.maxHeight = ctrl.maxHeight || readmoreConfig.maxHeight;
            ctrl.moreText = ctrl.moreText || readmoreConfig.moreText;
            ctrl.lessText = ctrl.lessText || readmoreConfig.lessText;
            ctrl.speed = ctrl.speed || readmoreConfig.speed;
            ctrl.expanded = ctrl.expanded != null ? ctrl.expanded : readmoreConfig.expanded;
            ctrl.isLineClampMode = Boolean(ctrl.lineClamp);
            if (ctrl.isLineClampMode) {
                $element[0].style.setProperty('--line-clamp', ctrl.lineClamp);
            }
        };

        ctrl.init = function () {
            ctrl.checkSizes($element).then((isActive) => {
                ctrl.isActive = isActive;
                if (!ctrl.isLineClampMode) {
                    ctrl.expanded = ctrl.isActive === true ? ctrl.expanded : true;
                } else {
                    ctrl.expanded = ctrl.isActive !== true;
                }

                ctrl.text = ctrl.expanded ? ctrl.lessText : ctrl.moreText;
            });
        };

        ctrl.$postLink = function () {
            if ($document[0].readyState === `complete`) {
                $window.whenAdvantshopStylesLoaded().then(() => ctrl.create());
            } else {
                $window.addEventListener(
                    `load`,
                    () => {
                        $window.whenAdvantshopStylesLoaded().then(() => ctrl.create());
                    },
                    { once: true },
                );
            }
        };

        ctrl.create = function () {
            ctrl.init();
            $window.addEventListener('resize', ctrl.init);
            $scope.$on('$destroy', () => {
                $window.removeEventListener('resize', ctrl.init);
            });
            ctrl.$onChanges = function (changesObj) {
                ctrl.init();
            };
        };

        ctrl.switch = function (expanded) {
            if (expanded === true) {
                ctrl.expanded = false;
                ctrl.text = ctrl.moreText;
            } else {
                ctrl.expanded = true;
                ctrl.text = ctrl.lessText;
            }
        };

        ctrl.checkSizes = function ($el) {
            if (timer != null) {
                $timeout.cancel(timer);
            }

            timer = $timeout(() => {
                let content = $element.find('.js-readmore-inner-content'),
                    clone = content.clone(),
                    result = false;

                clone.addClass('readmore-unvisible').css('width', content.width());
                $element.after(clone);
                if (ctrl.isLineClampMode) {
                    clone.addClass('readmore-reset');
                    const originalHeight = clone[0].offsetHeight;
                    clone.removeClass('readmore-reset');
                    clone[0].style.setProperty('--line-clamp', ctrl.lineClamp);
                    clone.addClass('readmore-clamp');
                    const clampHeight = clone[0].offsetHeight;
                    result = originalHeight > clampHeight;
                } else {
                    result = ctrl.maxHeight < clone[0].offsetHeight;
                }
                clone.remove();
                return result;
            });

            return timer;
        };
    };

    ReadmoreCtrl.$inject = ['$document', '$element', '$timeout', 'readmoreConfig', '$window', '$scope'];

    angular.module('readmore').controller('ReadmoreCtrl', ReadmoreCtrl);
})(window.angular);
