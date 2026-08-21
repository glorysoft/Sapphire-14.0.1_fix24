(function (ng) {
    

    const dependencyService = ng.injector(['dependency']).get('dependencyService');

    dependencyService.add([`fullHeightMobile`, `isMobile`, `details`, `swipeLine`, `sidebarsContainer`, `mainMenu`, `setCssCustomProps`]);
})(window.angular);
