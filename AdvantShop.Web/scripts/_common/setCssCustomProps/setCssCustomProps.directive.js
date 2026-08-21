import SetCssCustomPropsCtrl from './setCssCustomProps.controller.js';
/* @ngInject */
export default function SetCssCustomProps() {
    // use { nameVariable :nameProperty  } || [ { nameVariable :nameProperty  } ]
    return {
        scope: true,
        controller: SetCssCustomPropsCtrl,
        controllerAs: `setCssCustomProps`,
        bindToController: true
    };
}
