import templateUrl from './modalBringFriend.template.html';

const modalBringFriendTrigger = () => {
    return {
        restrict: 'EA',
        scope: {},
        bindToController: true,
        controller: 'ModalBringFriendTriggerCtrl',
        controllerAs: '$ctrl',

        template: `<a href="" ng-transclude></a>`,
        transclude: true,

        link: function (scope, element, attrs, ctrl) {
            element[0].addEventListener('click', (event) => {
                event.preventDefault();
                ctrl.openModal();
            });
        },
    };
};

const modalBringFriendContent = () => {
    return {
        restrict: 'EA',
        scope: {},
        bindToController: true,
        controller: 'ModalBringFriendContentCtrl',
        controllerAs: '$ctrl',
        templateUrl: templateUrl,
    };
};

export { modalBringFriendTrigger, modalBringFriendContent };
