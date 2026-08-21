import UibPaginationController from './UibPaginationController.js';
angular.module('ui.bootstrap.pagination').config(
    /* @ngInject */
    function ($provide) {
        $provide.decorator('uibPaginationDirective',  /* @ngInject */
            function ($delegate) {
                const directive = $delegate[0];

                directive.scope.pagesCount = '<?';

                directive.controller = UibPaginationController;

                return $delegate;
            });
    });

