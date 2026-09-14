angular.module('rootMenu')
  .config(/* @ngInject */function($provide) {


    $provide.decorator('rootMenuDirective', /* @ngInject */function($delegate) {
      const directive = $delegate[0];
      directive.compile = function(element: JQLite) {
        element.on('click', (event) => {
          if (!element[0].classList.contains('active')) {
            const rect = element[0].getBoundingClientRect();
            document.documentElement.style.setProperty('--menu-dropdown-height', `calc(100vh - ${rect.top + rect.height}px)`);
          }
        });
      };

      return $delegate;
    });
  });
