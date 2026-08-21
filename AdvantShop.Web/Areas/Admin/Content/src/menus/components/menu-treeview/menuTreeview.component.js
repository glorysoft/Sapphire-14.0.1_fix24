import menuTreeviewTemplate from './templates/menuTreeview.html';
(function (ng) {
    

    ng.module('menus').component('menuTreeview', {
        templateUrl: menuTreeviewTemplate,
        controller: 'MenuTreeviewCtrl',
        bindings: {
            selectedId: '@',
            type: '@',
            menuTreeviewOnInit: '&',
            level: '<?',
        },
    });
})(window.angular);
