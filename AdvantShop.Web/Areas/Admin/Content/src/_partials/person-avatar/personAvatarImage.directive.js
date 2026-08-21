(function (ng) {
    

    ng.module('personAvatar').directive('personAvatarImage', () => ({
            require: {
                personAvatarCtrl: '^personAvatar',
            },
            bindToController: true,
            controller () {},
            link (scope, element, attrs, ctrl) {
                ctrl.personAvatarCtrl.addImgElement(element[0]);
            },
        }));
})(window.angular);
