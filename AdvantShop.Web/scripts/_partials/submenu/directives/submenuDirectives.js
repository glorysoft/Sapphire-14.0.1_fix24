(function (ng) {
    

    angular.module('submenu').directive('submenuContainer', [
        '$window',
        'submenuConfig',
        function ($window, submenuConfig) {
            return {
                restrict: 'A',
                controller: 'SubmenuContainerCtrl',
                controllerAs: 'submenuContainer',
                bindToController: true,
                scope: true,
                link (scope, element, attrs, ctrl) {
                    let blockOrientation;

                    ctrl.options = angular.extend(ctrl.options, ng.copy(submenuConfig), new Function(`return ${  attrs.submenuContainer}`)() || {});

                    if (ctrl.options.blockOrientation != null) {
                        blockOrientation = document.querySelector(ctrl.options.blockOrientation);
                    }

                    ctrl.addContainerForOrientation(blockOrientation || element[0]);

                    if (ctrl.options.breakpoints != null && ctrl.options.breakpoints.length > 0) {
                        ctrl.options.breakpoints.forEach((breakpoint) => {
                            const mql = $window.matchMedia(`(min-width:${  breakpoint.media  }em)`);
                            mql.addListener(ctrl.onChangeMatchMedia(breakpoint, mql));
                        });
                    } else {
                        ctrl.init(ctrl.options);
                        if(attrs.submenuContainerIsVisible){
                            scope.$watch(attrs.submenuContainerIsVisible, (newValue, oldValue)=> {
                                const _storage = ctrl.getStorage();
                                if(ctrl.options.defaultOpenFirstSubmenu === true && _storage.size > 0){
                                    if(!ctrl.defaultOpenFirstSubmenu){
                                        ctrl.defaultOpenFirstSubmenu = _storage.entries().next().value;
                                    }
                                    if(newValue === true){
                                        ctrl.defaultOpenFirstSubmenu[1]?.submenu?.open();
                                    }else{
                                        ctrl.defaultOpenFirstSubmenu[1]?.submenu?.close();
                                    }
                                }
                            })
                        }
                    }
                },
            };
        },
    ]);

    angular.module('submenu').directive('submenuParent', () => ({
                require: {
                    submenuContainer: '^submenuContainer',
                    submenuParent: '?^^submenuParent'
                },
                restrict: 'A',
                controller: 'SubmenuParentCtrl',
                controllerAs: 'submenuParent',
                bindToController: true,
                scope: true
            }),
    );

    angular.module('submenu').directive('submenu', ['submenuService',function (submenuService) {
        return {
            //['submenu', '^submenuParent', '^submenuContainer']
            require: {
                submenu: 'submenu',
                submenuParent: '?^submenuParent',
                submenuContainer: '^submenuContainer',
            },
            restrict: 'A',
            scope: true,
            controller: 'SubmenuCtrl',
            controllerAs: 'submenu',
            bindToController: true,
            link (scope, element, attrs, ctrls) {
                const submenu = ctrls.submenu,
                    submenuParent = ctrls.submenuParent,
                    submenuContainer = ctrls.submenuContainer,
                    offsetBottom = parseFloat(attrs.submenuOffsetBottom),
                    offsetRight = parseFloat(attrs.submenuOffsetRight);

                submenu.options = submenuContainer.getOptions();

                submenu.offset = {};
                submenu.offset.bottom = !isNaN(offsetBottom) ? offsetBottom : 0;
                submenu.offset.right = !isNaN(offsetRight) ? offsetRight : 0;

                let submenuId = submenuService.getIdFromAttrs(attrs);
                if(!submenuId){
                    submenuId = submenuService.generateId();
                }

                if (submenuParent != null) {
                    const submenuIdParent = submenuService.getIdFromAttrs(submenuParent.attrs);
                    if(!submenuIdParent){
                        submenuParent.submenuId = submenuId;
                        submenuService.setId(submenuId, submenuParent.element);
                    }
                    submenuContainer.addParentCollection(submenuId, submenuParent);
                }

                submenu.submenuId = submenuId;
                submenuContainer.addSubmenuCollection(submenuId, submenu);
                submenuService.setId(submenuId, element[0]);
            },
        };
    }]);
})(angular);
