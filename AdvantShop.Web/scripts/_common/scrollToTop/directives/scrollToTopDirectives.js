//show only desk or more

angular.module('scrollToTop').directive(
    'scrollToTop',
    /* @ngInject */
    ($window) => ({
        restrict: 'A',
        link(_scope, element) {
            $window.addEventListener(
                'scroll',
                () => {
                    if ($window.pageYOffset >= $window.innerHeight) {
                        element[0].classList.add('scroll-to-top-active');
                    } else {
                        element[0].classList.remove('scroll-to-top-active');
                    }
                },
                { passive: true },
            );

            element[0].addEventListener('click', () => {
                $window.scrollTo(0, 0);
            });
        },
    }),
);
