(function(ng) {
    

    /* @ngInject */
    const SubmenuParentCtrl = function($attrs, $element, submenuService) {
        this.$onInit = function() {
            this.attrs = $attrs;
            this.element = $element[0];
            const submenuContainer = this.submenuContainer,
                submenuParent = this.submenuParent;

            let submenuId = submenuService.getIdFromAttrs($attrs);
            if (!submenuId) {
                submenuId = submenuService.generateId();
                submenuService.setId(submenuId, $element[0]);
            }

            if (submenuParent != null) {
                const submenuIdGreatParent = submenuService.getIdFromAttrs(submenuParent.attrs);
                if (!submenuIdGreatParent) {
                    submenuParent.submenuId = submenuId;
                    submenuService.setId(submenuId, submenuParent.element);
                }
                submenuContainer.addGreatParentCollection(submenuId, submenuParent);
            }
            submenuContainer.addParentCollection(submenuId, this);
            this.submenuId = submenuId;
        };
    };

    angular.module('submenu').controller('SubmenuParentCtrl', SubmenuParentCtrl);
})(window.angular);
