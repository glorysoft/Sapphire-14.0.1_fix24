import jQuery from 'jquery';

(globalThis as any).jQuery = jQuery;
(globalThis as any).$ = jQuery;

import angular from 'angular';

(globalThis as any).angular = angular;

import 'angular-mocks/ngMock';
