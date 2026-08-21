import appDependency from './appDependency.js';
import { projectsNames } from '../node_scripts/shopVariables.js';
import { IsMobileService } from '../Areas/Admin/Content/src/_shared/is-mobile/is-mobile.js';
import { modalVariants } from './_common/modal/constant/modalConstant.ts';
/* убираем BFCache в FF */
// eslint-disable-next-line @typescript-eslint/no-empty-function
window.addEventListener('unload', () => {});

angular
    .module('app', appDependency.get())
    .config(
        /* @ngInject*/
        (
            $anchorScrollProvider,
            $compileProvider,
            $cookiesProvider,
            $httpProvider,
            $localeProvider,
            $translateProvider,
            $locationProvider,
            sweetalertDefaultOptions,
            $uibTooltipProvider,
        ) => {
            $uibTooltipProvider.options({ trigger: 'outsideClick' });
            $anchorScrollProvider.disableAutoScrolling();

            const date = new Date();
            const currentYear = date.getFullYear();
            date.setFullYear(currentYear + 1);

            // Turn off URL manipulation in AngularJS
            // this code breaking preventDefault for anchors with empty href
            // $provide.decorator('$browser', ['$delegate', function ($delegate) {
            //    $delegate.onUrlChange = function () { };
            //    $delegate.url = function () { return "" };
            //    return $delegate;
            // }]);

            // #region compile debug
            $compileProvider.debugInfoEnabled(false);
            // #endregion

            // #region set cookie expires
            $cookiesProvider.defaults.expires = date;
            $cookiesProvider.defaults.path = '/';

            if (window.location.protocol === 'https:') {
                $cookiesProvider.defaults.secure = true;
                $cookiesProvider.defaults.samesite = 'none';
            }

            if (
                window.location.hostname !== 'localhost' &&
                window.location.hostname !== 'server' &&
                !/^(?!0)(?!.*\.$)(?<temp1>(?<temp2>1?\d?\d|25[0-5]|2[0-4]\d)(?<temp3>\.|$)){4}$/u.test(window.location.hostname)
            ) {
                $cookiesProvider.defaults.domain = `.${window.location.hostname.replace('www.', '')}`;
            }

            // #endregion

            // #region prepera ajax url in absolute path

            // $httpProvider.useApplyAsync(true);

            const tokens = document.getElementsByName('__RequestVerificationToken');
            if (tokens.length > 0) {
                $httpProvider.defaults.headers.post.__RequestVerificationToken = tokens[0].value;
            }
            $httpProvider.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

            const lpId = document.getElementsByName('lpId');
            if (lpId.length > 0) {
                $httpProvider.defaults.headers.common['X-Lp'] = lpId[0].value;
            }

            $httpProvider.interceptors.push([
                'urlHelper',
                'isMobileService',
                function (urlHelper, isMobileService) {
                    return {
                        request(config) {
                            const urlOld = config.url;
                            let template;

                            config.url = urlHelper.normalizeBundleFilesUrl(
                                urlHelper.getPhysicalPath(projectsNames.store, isMobileService.getValue()),
                                config.url,
                            );

                            config.url = urlHelper.getAbsUrl(config.url);

                            if (typeof window.v !== 'undefined' && urlOld.indexOf('../') === 0 && config.url.indexOf('.html') !== -1) {
                                config.url += `?v=${config.url.indexOf('localhost') !== -1 ? Math.random() : window.v}`;
                            }

                            // for templates
                            if (urlOld !== config.url && angular.isObject(config.cache) && typeof config.cache.get(urlOld) !== 'undefined') {
                                template = config.cache.get(urlOld);
                                config.cache.remove(urlOld);
                                config.cache.put(config.url, template);
                            }

                            // config.headers['Pragma'] = 'no-cache';
                            // config.headers['Expires'] = '-1';
                            // config.headers['Cache-Control'] = 'no-cache, no-store';

                            return config;
                        },
                    };
                },
            ]);

            // #endregion

            /* Прописано для # в URL вместо /#/ */
            $locationProvider.html5Mode({
                enabled: true,
                requireBase: true,
                rewriteLinks: false,
            });
            $locationProvider.hashPrefix('#');

            // #region localization

            const localeId = $localeProvider.$get().id;
            $translateProvider
                .translations(localeId, window.AdvantshopResource)
                .preferredLanguage(localeId)
                .useSanitizeValueStrategy('sanitizeParameters');
            // #endregion

            sweetalertDefaultOptions.customClass ||= {};
            sweetalertDefaultOptions.customClass.confirmButton = 'btn btn-small btn-confirm';
            sweetalertDefaultOptions.customClass.cancelButton = 'btn btn-small btn-action';
        },
    )
    .run(
        /* @ngInject */
        ($timeout, toaster, isMobileService, choiceDefaultConfig, $window, $document, scrollToBlockService, $q) => {
            if (!isMobileService.getHeuristicValue()) {
                const testEl = document.createElement('div');
                testEl.style.width = '100vw';
                testEl.style.position = 'absolute';
                testEl.style.visibility = 'hidden';
                testEl.style.pointerEvents = 'none';
                document.documentElement.appendChild(testEl);

                // Измеряем ширину, которую браузер даёт для 100vw
                const vwWidth = testEl.offsetWidth;
                const clientWidth = document.documentElement.clientWidth;
                const tolerance = 1; // небольшая погрешность

                let scrollbarWidth;
                if (Math.abs(vwWidth - clientWidth) < tolerance) {
                    // 100vw = clientWidth (новое поведение) – скролл не вычитаем
                    scrollbarWidth = 0;
                } else {
                    // 100vw = window.innerWidth (старое поведение) – вычитаем скролл
                    scrollbarWidth = window.innerWidth - clientWidth;
                }

                // Устанавливаем CSS-переменную
                document.documentElement.style.setProperty('--scrollbar-width', `${scrollbarWidth}px`);

                // Удаляем тестовый элемент
                document.documentElement.removeChild(testEl);
            }

            const toasterContainer = document.querySelector('[data-toaster-container]');
            let toasterItems;

            $timeout(() => {
                if (toasterContainer !== null) {
                    toasterItems = document.querySelectorAll('[data-toaster-type]');
                    if (toasterItems !== null) {
                        for (let i = 0, len = toasterItems.length; i < len; i++) {
                            toaster.pop({
                                type: toasterItems[i].getAttribute('data-toaster-type'),
                                body: toasterItems[i].innerHTML,
                                bodyOutputType: 'trustedHtml',
                            });
                        }
                    }
                }
            });

            if (isMobileService.getValue() === true) {
                choiceDefaultConfig.classNames.containerOuter.push('choices-container--mobile');
            }

            const deferLoad = $q.defer();

            if ($document[0].readyState !== 'complete') {
                $window.addEventListener(
                    'load',
                    () => {
                        deferLoad.resolve();
                    },
                    { once: true },
                );
            } else {
                deferLoad.resolve();
            }
            deferLoad.promise.then(() => {
                setTimeout(() => {
                    if ($window.location.hash !== '') {
                        const element = $document[0].querySelector($window.location.hash);
                        if (element !== null && element.clientWidth > 0 && element.clientHeight > 0) {
                            scrollToBlockService.scrollToBlock(element);
                        }
                    }
                }, 100);
            });
        },
    )
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    .controller('AppCtrl', () => {})
    .filter('sanitize', [
        '$sce',
        function ($sce) {
            return function (htmlCode) {
                return $sce.trustAsHtml(htmlCode);
            };
        },
    ])
    .filter('sanitizeUrl', [
        '$sce',
        function ($sce) {
            return function (htmlCode) {
                return $sce.trustAsResourceUrl(htmlCode);
            };
        },
    ])
    .factory('modalConfigFactory', [
        'modalConfig',
        function (modalConfig) {
            const isMobile = new IsMobileService();
            // переопределяем поведение модального окна для мобильной версии
            modalConfig.modalVariant = isMobile.getValue() ? modalVariants.SHEET : modalVariants.DEFAULT;
            function getModalConfig() {
                return modalConfig;
            }
            return {
                getModalConfig,
            };
        },
    ]);
