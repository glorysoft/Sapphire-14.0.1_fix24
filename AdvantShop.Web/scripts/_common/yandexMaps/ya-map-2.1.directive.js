
let API_KEY = null;

angular
    .module('yaMap', [])
    .constant('GEOMETRY_TYPES', {
        POINT: 'Point',
        LINESTRING: 'LineString',
        RECTANGLE: 'Rectangle',
        POLYGON: 'Polygon',
        CIRCLE: 'Circle',
    })
    .provider('yaMapSettings', function yaMapSettingsProvider() {
        const options = {
            version: '2.1',
            lang: 'ru_RU',
            // order: 'longlat',
            order: 'latlong',
        };
        this.setLanguage = function (lang) {
            options.lang = lang;
            return this;
        };
        this.setOrder = function (order) {
            options.order = order;
            return this;
        };
        this.setApiKey = function (apiKey) {
            options.apiKey = apiKey;
        };

        this.$get = [
            function () {
                return options;
            },
        ];
    })
    .service('mapApiLoad', [
        'yaMapSettings',
        function (yaMapSettings) {
            // var loaded = false;
            const service = this;
            let loaded = window.ymaps != null;
            const callbacks = [];
            const loadingResolves = [];
            const runCallbacks = function () {
                let callback;
                while (callbacks.length) {
                    callback = callbacks.splice(0, 1);
                    callback[0]();
                }
            };

            const runResolving = function () {
                let resolve;
                while (loadingResolves.length) {
                    resolve = loadingResolves.pop();
                    resolve();
                }
            };
            const loadUrl = (apiKey) => (
                    `https://api-maps.yandex.ru/2.1?apikey=${ 
                    apiKey || API_KEY 
                    }&lang=${ 
                    yaMapSettings.lang 
                    }&coordorder=${ 
                    yaMapSettings.order}`
                );

            let _loading = false;
            service.loadScript = function (apiKey) {
                return new Promise((resolve, reject) => {
                    if (loaded) {
                        resolve();
                        return;
                    }
                    loadingResolves.push(resolve);
                    if (_loading) {
                        return;
                    }

                    _loading = true;
                    const script = document.createElement('script');
                    script.type = 'text/javascript';
                    if (script.readyState) {
                        // IE
                        script.onreadystatechange = function () {
                            if (script.readyState == 'loaded' || script.readyState == 'complete') {
                                script.onreadystatechange = null;
                                ymaps.ready(() => {
                                    loaded = true;
                                    runResolving();
                                    runCallbacks();
                                });
                            }
                        };
                    } else {
                        // Другие броузеры
                        script.onload = function () {
                            ymaps.ready(() => {
                                loaded = true;
                                // resolve();
                                runResolving();
                                runCallbacks();
                            });
                        };
                    }
                    script.onerror = function (err) {
                        reject(err);
                    };
                    script.src = loadUrl(apiKey);
                    document.getElementsByTagName('head')[0].appendChild(script);
                });
            };

            service.addCallback = function (callback, option) {
                callbacks.push(callback);
                if (loaded) {
                    runCallbacks();
                }
                // else {
                //     ymaps.ready(function () {
                //         loaded = true;
                //         runCallbacks();
                //     });
                // }
                // else if (!_loading) {
                //     loadScript(loadUrl(), function () {
                //         ymaps.ready(function () {
                //             loaded = true;
                //             runCallbacks();
                //         });
                //     });
                // }
            };

            // return function (callback, option) {
            //     callbacks.push(callback);
            //     if (loaded) {
            //         runCallbacks();
            //     }
            // else if (!_loading) {
            //     loadScript(loadUrl(), function () {
            //         ymaps.ready(function () {
            //             loaded = true;
            //             runCallbacks();
            //         });
            //     });
            // }
            // };
        },
    ])
    // .factory('mapApiLoad', [
    //     'yaMapSettings',
    //     function (yaMapSettings) {
    //         // var loaded = false;
    //         var loaded = window.ymaps != null;
    //         var callbacks = [];
    //         var runCallbacks = function () {
    //             var callback;
    //             while (callbacks.length) {
    //                 callback = callbacks.splice(0, 1);
    //                 callback[0]();
    //             }
    //         };
    //         var loadUrl = () => {
    //             return 'https://api-maps.yandex.ru/2.1?apikey=' + API_KEY + '&lang=' + yaMapSettings.lang + '&coordorder=' + yaMapSettings.order;
    //         };
    //
    //         var _loading = false;
    //         var loadScript = function (url, callback) {
    //             if (_loading) {
    //                 return;
    //             }
    //             _loading = true;
    //             var script = document.createElement('script');
    //             script.type = 'text/javascript';
    //             if (script.readyState) {
    //                 // IE
    //                 script.onreadystatechange = function () {
    //                     if (script.readyState == 'loaded' || script.readyState == 'complete') {
    //                         script.onreadystatechange = null;
    //                         callback();
    //                     }
    //                 };
    //             } else {
    //                 // Другие броузеры
    //                 script.onload = function () {
    //                     callback();
    //                 };
    //             }
    //             script.src = url;
    //             document.getElementsByTagName('head')[0].appendChild(script);
    //         };
    //
    //         return function (callback, option) {
    //             callbacks.push(callback);
    //             if (loaded) {
    //                 runCallbacks();
    //             } else if (!_loading) {
    //                 loadScript(loadUrl(), function () {
    //                     ymaps.ready(function () {
    //                         loaded = true;
    //                         runCallbacks();
    //                     });
    //                 });
    //             }
    //         };
    //     },
    // ])
    .service('yaLayer', [
        function () {
            this.create = function (tileZoomFn, options) {
                return new ymaps.Layer(tileZoomFn, options);
            };
        },
    ])
    .service('yaMapType', [
        function () {
            this.create = function (name, layers) {
                return new ymaps.MapType(name, layers);
            };
        },
    ])
    .service('layerStorage', [
        'mapApiLoad',
        function (mapApiLoad) {
            this.get = function (callback) {
                if (this._storage) {
                    callback(this._storage);
                } else {
                    const self = this;
                    mapApiLoad.addCallback(() => {
                        self._storage = ymaps.layer.storage;
                        callback(self._storage);
                    });
                }
            };
        },
    ])
    .service(
        'mapTypeStorage',
        /* @ngInject */ function (mapApiLoad) {
            this.get = function (callback) {
                if (this._storage) {
                    callback(this._storage);
                } else {
                    const self = this;
                    mapApiLoad.addCallback(() => {
                        self._storage = ymaps.mapType.storage;
                        callback(self._storage);
                    });
                }
            };
        },
    )
    .service('yaSubscriber', function () {
        const eventPattern = /^yaEvent(\w*)?([A-Z]{1}[a-z]+)$/;
        this.subscribe = function (target, parentGet, attrName, scope) {
            const res = eventPattern.exec(attrName);
            const eventName = res[2].toLowerCase();
            const propertyName = res[1] ? res[1][1].toLowerCase() + res[1].substring(1) : undefined;
            scope[attrName] = function (locals) {
                return parentGet(scope.$parent || scope, locals);
            };
            const events = propertyName ? target[propertyName].events : target.events;
            events.add(eventName, (event) => {
                setTimeout(() => {
                    scope.$apply(() => {
                        scope[attrName]({
                            $event: event,
                        });
                    });
                });
            });
        };
    })
    .service('templateLayoutFactory', [
        'mapApiLoad',
        function (mapApiLoad) {
            this._cache = {};
            this.get = function (key) {
                return this._cache[key] || key;
            };
            this.create = function (key, template, overadice) {
                if (this._cache[key]) {
                    return;
                }
                const self = this;
                mapApiLoad.addCallback(() => {
                    self._cache[key] = ymaps.templateLayoutFactory.createClass(template, overadice);
                });
            };
        },
    ])
    .directive('yaTemplateLayout', [
        'templateLayoutFactory',
        function (templateLayoutFactory) {
            return {
                restrict: 'E',
                priority: 1001,
                scope: {
                    overrides: '=yaOverrides',
                },
                compile (tElement) {
                    const html = tElement.html();
                    tElement.children().remove();
                    return function (scope, elm, attrs) {
                        if (!attrs.yaKey) {
                            throw new Error('not require attribute "key"');
                        }
                        const key = attrs.yaKey;
                        templateLayoutFactory.create(key, html, scope.overrides);
                    };
                },
            };
        },
    ])
    .controller('YaMapCtrl', [
        '$scope',
        'mapApiLoad',
        '$attrs',
        '$parse',
        'yaMapSettings',
        function ($scope, mapApiLoad, $attrs, $parse, yaMapSettings) {
            const self = this;
            API_KEY = $parse($attrs.yaMapKey)($scope.$parent);
            mapApiLoad.loadScript();
            if (!API_KEY) {
                console.error('ApiKey required for yandex map');
            }

            mapApiLoad.addCallback(() => {
                self.addGeoObjects = function (obj) {
                    $scope.map.geoObjects.add(obj);
                };
                self.removeGeoObjects = function (obj) {
                    $scope.map.geoObjects.remove(obj);
                };

                self.addControl = function (name, options) {
                    $scope.map.controls.add(name, options);
                };
                self.getMap = function () {
                    return $scope.map;
                };
                self.addImageLayer = function (urlTemplate, options) {
                    const imgLayer = new ymaps.Layer(urlTemplate, options);
                    $scope.map.layers.add(imgLayer);
                };
                self.addHotspotLayer = function (urlTemplate, keyTemplate, options) {
                    // Создадим источник данных слоя активных областей.
                    const objSource = new ymaps.hotspot.ObjectSource(urlTemplate, keyTemplate);
                    const hotspotLayer = new ymaps.hotspot.Layer(objSource, options);
                    $scope.map.layers.add(hotspotLayer);
                };
            });
        },
    ])
    .directive('yaMap', [
        '$compile',
        'mapApiLoad',
        'yaMapSettings',
        '$window',
        'yaSubscriber',
        '$parse',
        '$q',
        '$timeout',
        function ($compile, mapApiLoad, yaMapSettings, $window, yaSubscriber, $parse, $q, $timeout) {
            return {
                restrict: 'E',
                scope: {
                    yaCenter: '<?',
                    yaType: '@',
                    yaBeforeInit: '&',
                    yaAfterInit: '&',
                },
                compile (tElement) {
                    let childNodes = tElement.children(),
                        centerCoordinatesDeferred = null;
                    tElement.children().remove();
                    return function (scope, element, attrs) {
                        const getEvalOrValue = function (value) {
                            try {
                                return scope.$eval(value);
                            } catch (e) {
                                return value;
                            }
                        };
                        const getCenterCoordinates = function (center) {
                            if (centerCoordinatesDeferred) centerCoordinatesDeferred.reject();
                            centerCoordinatesDeferred = $q.defer();
                            if (!center) {
                                //устанавливаем в качестве центра местоположение пользователя
                                mapApiLoad.addCallback(() => {
                                    ymaps.geolocation
                                        .get({
                                            // Выставляем опцию для определения положения по ip
                                            // provider: 'yandex', //,
                                            // Карта автоматически отцентрируется по положению пользователя.
                                            mapStateAutoApply: true,
                                        })
                                        .then((result) => {
                                            $timeout(() => {
                                                centerCoordinatesDeferred.resolve(result.geoObjects.position);
                                            });
                                        })
                                        .catch(() => {
                                            centerCoordinatesDeferred.resolve([55.755864, 37.617698]);
                                        });
                                });
                            } else if (angular.isArray(center)) {
                                $timeout(() => {
                                    centerCoordinatesDeferred.resolve(center);
                                });
                            } else if (angular.isString(center)) {
                                //проводим обратное геокодирование
                                mapApiLoad.addCallback(() => {
                                    ymaps.geocode(center, { results: 1 }).then(
                                        (res) => {
                                            const firstGeoObject = res.geoObjects.get(0);
                                            scope.$apply(() => {
                                                centerCoordinatesDeferred.resolve(firstGeoObject.geometry.getCoordinates());
                                            });
                                        },
                                        (err) => {
                                            scope.$apply(() => {
                                                centerCoordinatesDeferred.reject(err);
                                            });
                                        },
                                    );
                                });
                            }
                            return centerCoordinatesDeferred.promise;
                        };
                        let zoom = Number(attrs.yaZoom) || 0,
                            behaviors = attrs.yaBehaviors ? attrs.yaBehaviors.split(' ') : ['default'];
                        let controls = ['default'];
                        if (attrs.yaControls) {
                            controls = attrs.yaControls.split(' ');
                        } else if (angular.isDefined(attrs.yaControls)) {
                            controls = [];
                        }
                        let disableBehaviors = [],
                            enableBehaviors = [],
                            behavior;
                        for (let i = 0, ii = behaviors.length; i < ii; i++) {
                            behavior = behaviors[i];
                            if (behavior[0] === '-') {
                                disableBehaviors.push(behavior.substring(1));
                            } else {
                                enableBehaviors.push(behavior);
                            }
                        }

                        if (zoom < 0) {
                            zoom = 0;
                        } else if (zoom > 23) {
                            zoom = 23;
                        }

                        let mapPromise;
                        const mapInit = function (center) {
                            const deferred = $q.defer();
                            mapApiLoad.addCallback(() => {
                                scope.yaBeforeInit();
                                const options = attrs.yaOptions ? scope.$eval(attrs.yaOptions) : undefined;
                                if (options && options.projection) {
                                    options.projection = new ymaps.projection[options.projection.type](options.projection.bounds);
                                }
                                scope.map = new ymaps.Map(
                                    element[0],
                                    {
                                        center,
                                        zoom,
                                        controls,
                                        type: attrs.yaType || 'yandex#map',
                                        behaviors: enableBehaviors,
                                    },
                                    options,
                                );
                                scope.map.behaviors.disable(disableBehaviors);
                                //подписка на события
                                for (const key in attrs) {
                                    if (key.indexOf('yaEvent') === 0) {
                                        const parentGet = $parse(attrs[key]);
                                        yaSubscriber.subscribe(scope.map, parentGet, key, scope);
                                    }
                                }
                                deferred.resolve(scope.map);
                                scope.yaAfterInit({ $target: scope.map });
                                element.append(childNodes);
                                setTimeout(() => {
                                    scope.$apply(() => {
                                        $compile(element.children())(scope.$parent);
                                    });
                                });
                            });
                            return deferred.promise;
                        };

                        scope.$watch('yaCenter', (newValue) => {
                            getCenterCoordinates(newValue).then((coords) => {
                                if (!mapPromise) {
                                    mapPromise = mapInit(coords);
                                    var isInit = true;
                                }
                                mapPromise.then((map) => {
                                    if (!isInit) {
                                        map.setCenter(coords);
                                    }
                                });
                            });
                        });
                        scope.$watch('yaType', (newValue) => {
                            if (newValue && mapPromise) {
                                mapPromise.then((map) => {
                                    map.setType(newValue);
                                });
                            }
                        });

                        scope.$on('$destroy', () => {
                            if (scope.map) {
                                scope.map.destroy();
                            }
                        });
                    };
                },
                controller: 'YaMapCtrl',
            };
        },
    ])
    .directive('yaControl', [
        'yaSubscriber',
        'templateLayoutFactory',
        '$parse',
        function (yaSubscriber, templateLayoutFactory, $parse) {
            return {
                restrict: 'E',
                require: '^yaMap',
                scope: {
                    yaAfterInit: '&',
                },
                link (scope, elm, attrs, yaMap) {
                    const className = attrs.yaType[0].toUpperCase() + attrs.yaType.substring(1);
                    const getEvalOrValue = function (value) {
                        try {
                            return scope.$eval(value);
                        } catch (e) {
                            return value;
                        }
                    };
                    const params = getEvalOrValue(attrs.yaParams);
                    const options = attrs.yaOptions ? scope.$eval(attrs.yaOptions) : undefined;
                    if (options && options.layout) {
                        options.layout = templateLayoutFactory.get(options.layout);
                    }
                    if (options && options.itemLayout) {
                        options.itemLayout = templateLayoutFactory.get(options.itemLayout);
                    }
                    if (params && params.items) {
                        const items = [];
                        let item;
                        for (let i = 0, ii = params.items.length; i < ii; i++) {
                            item = params.items[i];
                            items.push(new ymaps.control.ListBoxItem(item));
                        }
                        params.items = items;
                    }
                    const obj = new ymaps.control[className](params);
                    for (var key in options) {
                        if (options.hasOwnProperty(key)) {
                            obj.options.set(key, options[key]);
                        }
                    }
                    //подписка на события
                    for (key in attrs) {
                        if (key.indexOf('yaEvent') === 0) {
                            const parentGet = $parse(attrs[key]);
                            yaSubscriber.subscribe(obj, parentGet, key, scope);
                        }
                    }
                    yaMap.addControl(obj, options);
                    scope.yaAfterInit({ $target: obj });
                },
            };
        },
    ])
    .controller('CollectionCtrl', [
        '$scope',
        function ($scope) {
            this.addGeoObjects = function (geoObject) {
                $scope.collection.add(geoObject);
            };
            this.removeGeoObjects = function (geoObject) {
                $scope.collection.remove(geoObject);
            };
        },
    ])
    .directive('yaCollection', [
        '$compile',
        'yaMapSettings',
        '$timeout',
        'yaSubscriber',
        '$parse',
        function ($compile, yaMapSettings, $timeout, yaSubscriber, $parse) {
            return {
                require: '^yaMap',
                restrict: 'E',
                scope: {
                    yaAfterInit: '&',
                    yaAfterSetPoints: '&',
                    points: '<',
                },
                compile (tElement) {
                    const childNodes = tElement.contents();
                    tElement.children().remove();
                    return function (scope, element, attrs, yaMap) {
                        const options = attrs.yaOptions ? scope.$eval(attrs.yaOptions) : {};

                        // var showAll = angular.isDefined(attrs.showAll) && attrs.showAll!='false';
                        const showAll = $parse(attrs.showAll)(scope.$parent);
                        scope.collection = new ymaps.ObjectManager(options);
                        if (showAll) {
                            const map = yaMap.getMap();
                            let timeout;
                            const addEventHandler = function () {
                                if (timeout) {
                                    $timeout.cancel(timeout);
                                }
                                timeout = $timeout(() => {
                                    map.geoObjects.events.remove('add', addEventHandler);
                                    const bounds = map.geoObjects.getBounds();
                                    if (bounds) {
                                        map.setBounds(bounds, { checkZoomRange: true, zoomMargin: 9 }).then(() => {
                                            scope.yaAfterSetPoints({ $target: scope.collection });
                                            scope.$apply();
                                            // if (map.getZoom() > 17) map.setZoom(17);
                                        });
                                    }
                                }, 300);
                            };
                            map.geoObjects.events.add('add', addEventHandler);
                        } else {
                            scope.yaAfterSetPoints({ $target: scope.collection });
                        }

                        //подписка на события
                        for (const key in attrs) {
                            if (key.indexOf('yaEvent') === 0) {
                                const parentGet = $parse(attrs[key]);
                                yaSubscriber.subscribe(scope.collection, parentGet, key, scope);
                            }
                        }
                        // scope.points = $parse(attrs.points)(scope.$parent);
                        const first = true;
                        scope.$watch(
                            'points',
                            (newValue) => {
                                if (newValue) {
                                    scope.collection = scope.collection.removeAll();
                                    scope.collection.add(newValue);
                                }
                            },
                            false,
                        );
                        scope.collection.add(scope.points);

                        yaMap.addGeoObjects(scope.collection);

                        scope.yaAfterInit({ $target: scope.collection });
                        scope.$on('$destroy', () => {
                            if (scope.collection) {
                                yaMap.removeGeoObjects(scope.collection);
                            }
                        });
                        element.append(childNodes);
                        $compile(element.children())(scope.$parent);
                    };
                },
                controller: 'CollectionCtrl',
            };
        },
    ])
    .directive('yaCluster', [
        'yaMapSettings',
        'yaSubscriber',
        '$compile',
        'templateLayoutFactory',
        '$parse',
        function (yaMapSettings, yaSubscriber, $compile, templateLayoutFactory, $parse) {
            return {
                require: '^yaMap',
                restrict: 'E',
                scope: {
                    yaAfterInit: '&',
                },
                compile (tElement) {
                    const childNodes = tElement.contents();
                    tElement.children().remove();
                    return function (scope, element, attrs, yaMap) {
                        const collectionOptions = attrs.yaOptions ? scope.$eval(attrs.yaOptions) : {};
                        if (collectionOptions && collectionOptions.clusterBalloonItemContentLayout) {
                            collectionOptions.clusterBalloonItemContentLayout = templateLayoutFactory.get(
                                collectionOptions.clusterBalloonItemContentLayout,
                            );
                        }
                        if (collectionOptions && collectionOptions.clusterBalloonContentLayout) {
                            collectionOptions.clusterBalloonContentLayout = templateLayoutFactory.get(collectionOptions.clusterBalloonContentLayout);
                        }
                        //включение кластеризации
                        scope.collection = new ymaps.Clusterer(collectionOptions);
                        //подписка на события
                        for (const key in attrs) {
                            if (key.indexOf('yaEvent') === 0) {
                                const parentGet = $parse(attrs[key]);
                                yaSubscriber.subscribe(scope.collection, parentGet, key, scope);
                            }
                        }

                        yaMap.addGeoObjects(scope.collection);
                        scope.yaAfterInit({ $target: scope.collection });
                        scope.$on('$destroy', () => {
                            if (scope.collection) {
                                yaMap.removeGeoObjects(scope.collection);
                            }
                        });
                        element.append(childNodes);
                        $compile(element.children())(scope.$parent);
                    };
                },
                controller: 'CollectionCtrl',
            };
        },
    ])
    .directive('yaGeoObject', [
        'GEOMETRY_TYPES',
        'yaSubscriber',
        'templateLayoutFactory',
        '$parse',
        function (GEOMETRY_TYPES, yaSubscriber, templateLayoutFactory, $parse) {
            return {
                restrict: 'E',
                require: ['^yaMap', '?^yaCollection', '?^yaCluster'],
                scope: {
                    yaSource: '=',
                    yaShowBalloon: '=',
                    yaAfterInit: '&',
                },
                link (scope, elm, attrs, ctrls) {
                    let ctrl = ctrls[2] || ctrls[1] || ctrls[0],
                        obj;
                    const options = attrs.yaOptions ? scope.$eval(attrs.yaOptions) : undefined;
                    if (options && options.balloonContentLayout) {
                        options.balloonContentLayout = templateLayoutFactory.get(options.balloonContentLayout);
                    }
                    if (options && options.iconLayout) {
                        options.iconLayout = templateLayoutFactory.get(options.iconLayout);
                    }
                    const createGeoObject = function (from, options) {
                        obj = new ymaps.GeoObject(from, options);
                        //подписка на события
                        for (const key in attrs) {
                            if (key.indexOf('yaEvent') === 0) {
                                const parentGet = $parse(attrs[key]);
                                yaSubscriber.subscribe(obj, parentGet, key, scope);
                            }
                        }
                        ctrl.addGeoObjects(obj);
                        // ctrl.addGeoObjects(from);
                        scope.yaAfterInit({ $target: obj });
                        checkEditing(attrs.yaEdit);
                        checkDrawing(attrs.yaDraw);
                        checkShowBalloon(scope.yaShowBalloon);
                    };
                    scope.$watch(
                        'yaSource',
                        (newValue) => {
                            if (newValue) {
                                if (obj) {
                                    obj.geometry.setCoordinates(newValue.geometry.coordinates);
                                    if (obj.geometry.getType() === GEOMETRY_TYPES.CIRCLE) {
                                        obj.geometry.setRadius(newValue.geometry.radius);
                                    }
                                    const properties = newValue.properties;
                                    for (const key in properties) {
                                        if (properties.hasOwnProperty(key)) {
                                            obj.properties.set(key, properties[key]);
                                        }
                                    }
                                } else {
                                    createGeoObject(newValue, options);
                                }
                            } else if (obj) {
                                ctrl.removeGeoObjects(obj);
                            }
                        },
                        angular.equals,
                    );
                    var checkEditing = function (editAttr) {
                        if (angular.isDefined(editAttr) && editAttr !== 'false') {
                            if (obj) {
                                obj.editor.startEditing();
                            }
                        } else if (angular.isDefined(editAttr)) {
                            if (obj) {
                                obj.editor.stopEditing();
                            }
                        }
                    };
                    var checkDrawing = function (drawAttr) {
                        if (angular.isDefined(drawAttr) && drawAttr !== 'false') {
                            if (obj) {
                                obj.editor.startDrawing();
                            }
                        } else if (angular.isDefined(drawAttr)) {
                            if (obj) {
                                obj.editor.stopDrawing();
                            }
                        }
                    };
                    var checkShowBalloon = function (newValue) {
                        if (newValue) {
                            if (obj) {
                                obj.balloon.open();
                            }
                        } else if (obj) {
                                obj.balloon.close();
                            }
                    };
                    attrs.$observe('yaEdit', checkEditing);
                    attrs.$observe('yaDraw', checkDrawing);
                    scope.$watch('yaShowBalloon', checkShowBalloon);
                    scope.$on('$destroy', () => {
                        if (obj) {
                            ctrl.removeGeoObjects(obj);
                        }
                    });
                },
            };
        },
    ])
    .directive('yaHotspotLayer', [
        function () {
            return {
                restrict: 'E',
                require: '^yaMap',
                link (scope, elm, attrs, yaMap) {
                    if (!attrs.yaUrlTemplate) {
                        throw new Error('not exists required attribute "url-template"');
                    }
                    if (!attrs.yaKeyTemplate) {
                        throw new Error('not exists required attribute "key-template"');
                    }
                    const options = attrs.yaOptions ? scope.$eval(attrs.yaOptions) : undefined;
                    yaMap.addHotspotLayer(attrs.yaUrlTemplate, attrs.yaKeyTemplate, options);
                },
            };
        },
    ])
    .directive('yaImageLayer', [
        function () {
            return {
                restrict: 'E',
                require: '^yaMap',
                link (scope, elm, attrs, yaMap) {
                    if (!attrs.yaUrlTemplate) {
                        throw new Error('not exists required attribute "url-template"');
                    }
                    const options = attrs.yaOptions ? scope.$eval(attrs.yaOptions) : undefined;
                    yaMap.addImageLayer(attrs.yaUrlTemplate, options);
                },
            };
        },
    ])
    .directive('yaDragger', [
        'yaSubscriber',
        '$parse',
        'mapApiLoad',
        function (yaSubscriber, $parse, mapApiLoad) {
            return {
                restrict: 'EA',
                scope: {
                    yaAfterInit: '&',
                },
                link (scope, elm, attrs) {
                    const options = attrs.yaOptions ? scope.$eval(attrs.yaOptions) : {};
                    mapApiLoad.addCallback(() => {
                        options.autoStartElement = elm[0];
                        const obj = new ymaps.util.Dragger(options);
                        //подписка на события
                        for (const key in attrs) {
                            if (key.indexOf('yaEvent') === 0) {
                                const parentGet = $parse(attrs[key]);
                                yaSubscriber.subscribe(obj, parentGet, key, scope);
                            }
                        }
                        scope.yaAfterInit({ $target: obj });
                    });
                },
            };
        },
    ]);
