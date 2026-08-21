(function (ng) {
    

    ng.injector(['dependency']).get('dependencyService').add('mobileMenu');

    ng.module('mobileMenu', []);
})(window.angular);
