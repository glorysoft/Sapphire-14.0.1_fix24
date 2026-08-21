import sectionOtherItemsTemplate from '../templates/newBuilder/sectionOtherItems.html';
/*@ngInject*/
function builderTriggerDirective($compile) {
    return {
        restrict: 'EA',
        scope: {},
        controller: 'BuilderCtrl',
        controllerAs: 'builder',
        bindToController: true,
        link (scope, element, attrs, ctrl) {
            const builderStylesheetList = document.querySelectorAll('[data-builder-stylesheet]');
            $compile(builderStylesheetList)(scope.$new());

            element.on('click', (event) => {
                event.preventDefault();
                ctrl.showDialog();
                scope.$apply();
            });
        },
    };
}

/*@ngInject*/
function newBuilderTriggerDirective($compile) {
    return {
        restrict: 'EA',
        scope: {
            isShowOnLoad: '<?',
        },
        controller: 'NewBuilderCtrl',
        controllerAs: 'builder',
        bindToController: true,
        link (scope, element, attrs, ctrl) {
            const builderStylesheetList = document.querySelectorAll('[data-builder-stylesheet]');
            $compile(builderStylesheetList)(scope.$new());

            if (ctrl.isShowOnLoad === true) {
                ctrl.openInSidebar();
            }

            element.on('click', (event) => {
                event.preventDefault();
                ctrl.openInSidebar();
                //ctrl.showDialog();
                scope.$apply();
            });
        },
    };
}

/*@ngInject*/
function builderTriggerOtherSettingsDirective() {
    return {
        restrict: 'EA',
        scope: {
            settings: '=',
            showTitle: '<?',
        },
        controller: 'BuilderOtherSettingsCtrl',
        controllerAs: 'ctrl',
        bindToController: true,
        replace: true,
        templateUrl: sectionOtherItemsTemplate,
    };
}

/*@ngInject*/
function builderStylesheetDirective(builderService) {
    return {
        restrict: 'A',
        scope: {},
        link (scope, element, attrs) {
            builderService.memoryStylesheet(attrs.builderType, element);
        },
    };
}

export { builderTriggerDirective, newBuilderTriggerDirective, builderStylesheetDirective, builderTriggerOtherSettingsDirective };
