const imageExts = ['.jpg', '.jpeg', '.gif', '.png', '.webp'];

function create(target, opts, $ocLazyLoad, $injector) {
    let el;
    let type;

    if (target.nodeName === `A`) {
        const href = target.getAttribute('href');
        if (href.startsWith('#')) {
            type = 'html';
        } else if (imageExts.some((ext) => href.endsWith(ext))) {
            type = 'image';
        }
    } else {
        type = 'image';
    }

    if (type === 'image') {
        let withoutTagImg = false;

        if (target.nodeName !== `A`) {
            target.addEventListener(`click`, (event) => {
                if (event.target.closest('a')) {
                    event.preventDefault();
                }
            });
            el = target;
        } else {
            el = target.querySelector(`img`);
        }

        if (!el) {
            withoutTagImg = true;
            const img = new Image();
            img.dataset.original = target.getAttribute('href');
            el = img;
        }

        return import(
            './viewerjs.module.js'
            ).then((module) => {
            const viewer = new module.default(
                el,
                ({
                    moveLimit: true,
                    toggleSizeToInitial: true,
                    url(image) {
                        return image.dataset.original || image.closest(`a`).href;
                    },
                    viewed() {
                        viewer.options.minZoomRatio = Math.min(viewer.imageData.width / viewer.imageData.naturalWidth, 1);
                    },
                    ready() {
                        if (!viewer.images || viewer.images.length === 1) {
                            viewer.options.toolbar = false;
                            //viewer.update();
                            viewer.toolbar.remove();
                        }
                    },
                    ...opts,
                }),
            );

            if (target.nodeName === `A`) {
                target.addEventListener(`click`, (event) => {
                    event.preventDefault();
                    event.stopPropagation();

                    if (withoutTagImg) {
                        viewer.show();
                    }
                });
            }

            if(target.tagName !== 'IMG'){
                const observer = new MutationObserver(mutationRecords => {
                    const changes = mutationRecords.some(item => item.addedNodes.length > 0 || item.removedNodes.length > 0);
                    if(changes){
                        viewer.update();
                    }
                });


                observer.observe(target, {
                    childList: true, // наблюдать за непосредственными детьми
                    subtree: true, // и более глубокими потомками
                });
            }

            return viewer;
        });
    } else if (type === 'html' || opts.type === 'iframe') {
        target.addEventListener(`click`, (event) => {
            event.preventDefault();
            const href = target.getAttribute('href');

            return new Promise((resolve, reject) => {
                if ($ocLazyLoad.isLoaded('modal') === false) {
                    import(
                        '../modal/modal.module'
                        )
                        .then(() => $ocLazyLoad.inject('modal'))
                        .then(() => resolve())
                        .catch((err) => reject(err));
                } else {
                    resolve();
                }
            })
                .then(() => $injector.get('modalService'))
                .then((modalService) => {
                    if (type === 'html') {
                        modalService.renderModal(href.slice(1), null, document.querySelector(href).innerHTML, null, {
                            isOpen: true,
                            destroyOnClose: true,
                        });
                        return  true;
                    } else if (opts.type === 'iframe') {
                        return new Promise((resolve, reject) => {
                            if ($ocLazyLoad.isLoaded('iframeResponsive') === false) {
                                import(
                                    '../iframe-responsive/iframeResponsive.module.js'
                                    )
                                    .then(() => $ocLazyLoad.inject('iframeResponsive'))
                                    .then(() => resolve())
                                    .catch((err) => reject(err));
                            } else {
                                resolve();
                            }
                        })
                            .then(() => $ocLazyLoad.inject('iframeResponsive'))
                            .then(() => {
                                modalService.renderModal(
                                    href.replace(/[\W]/gu, ''),
                                    null,
                                    `<iframe-responsive src="${href}" autoplay="true" in-modal="true" data-from-upload="false"></iframe-responsive>`,
                                    null,
                                    {
                                        isOpen: true,
                                        destroyOnClose: true,
                                        modalClass: 'photo-viewer-modal',
                                    },
                                );
                            });
                    }
                    throw new Error('photoViewer: unknown error')
                });
        });
    } else {
        throw new Error(`photoViewer: unknown type ${type}`);
    }
}

//https://stackoverflow.com/questions/3960843/how-to-find-the-nearest-common-ancestors-of-two-or-more-nodes
function getCommonAncestor(node1, node2) {
    const method = 'contains' in node1 ? 'contains' : 'compareDocumentPosition',
        test = method === 'contains' ? 1 : 0x0010;

    // eslint-disable-next-line no-param-reassign
    while ((node1 = node1.parentNode)) {
        if ((node1[method](node2) && test) === test) return node1;
    }

    return null;
}

/*@ngInject*/
function pluginDirective(photoViewerDefaultOptions, $ocLazyLoad, $injector, $q, $parse) {
    return {
        link(scope, element, attrs) {
            if (attrs.plugin === 'fancybox') {
                const rel = element[0].getAttribute(`rel`);

                let el;

                if (rel) {
                    const allItems = Array.from(document.querySelectorAll(`[data-plugin="fancybox"][rel="${rel}"]`));
                    if (allItems.length === 1) {
                        [el] = element;
                    } else if (allItems[0].nextElementSibling === allItems[1]) {
                        el = element[0].parentNode;
                    } else {
                        el = getCommonAncestor(allItems[0], allItems[1]);
                    }
                } else {
                    [el] = element;
                }

                $q.when(
                    create(
                        el,
                        angular.extend({}, photoViewerDefaultOptions, {
                            url(image) {
                                const src = image.closest('[data-plugin="fancybox"]')?.href;
                                return src || image.dataset.original;
                            },
                        }),
                        $ocLazyLoad,
                        $injector,
                    ),
                ).then((photoViewer) => {
                    scope.photoViewer = {
                        original: photoViewer,
                    };
                    if (attrs.photoViewerOnLoad) {
                        $parse(attrs.photoViewerOnLoad)(scope);
                    }
                });
            }
        },
    };
}

/*@ngInject*/
function magnificPopupDirective($parse, photoViewerDefaultOptions, $ocLazyLoad, $injector, $q) {
    return {
        link(scope, element, attrs) {
            $q.when(
                create(element[0], angular.extend({}, photoViewerDefaultOptions, $parse(attrs.magnificPopupOptions)(scope)), $ocLazyLoad, $injector),
            ).then((photoViewer) => {
                scope.photoViewer = {
                    original: photoViewer,
                };

                scope.photoViewer.update = function() {
                    setTimeout(() => photoViewer.updateItemHTML(), 100);
                };

                if (attrs.photoViewerOnLoad) {
                    $parse(attrs.photoViewerOnLoad)(scope);
                }
            });
        },
    };
}

/*@ngInject*/
function photoViewerDirective($parse, photoViewerDefaultOptions, $ocLazyLoad, $injector, $q) {
    return {
        link(scope, element, attrs) {
            $q.when(
                create(
                    element[0],
                    angular.extend({}, photoViewerDefaultOptions, $parse(attrs.photoViewerDefaultOptions)(scope)),
                    $ocLazyLoad,
                    $injector,
                ),
            ).then((photoViewer) => {
                scope.photoViewer = {
                    original: photoViewer,
                };

                scope.photoViewer.update = function() {
                    setTimeout(() => photoViewer.update(), 100);
                };

                if (attrs.photoViewerOnLoad) {
                    $parse(attrs.photoViewerOnLoad)(scope);
                }
            });
        },
    };
}

export { pluginDirective, magnificPopupDirective, photoViewerDirective };
