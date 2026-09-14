import './orderProduct.scss';
import orderProductsMobileTemplate from './templates/orderProducts.mobile.html';
import orderProductsTemplate from './templates/orderProducts.html';

try {
  angular.module('orderProduct').config(/* @ngInject */function($provide) {
    $provide.decorator('orderProductDirective', /* @ngInject */function($delegate, isMobileService) {
      const directive = $delegate[0];
      directive.templateUrl = isMobileService.getValue() ? orderProductsMobileTemplate : orderProductsTemplate;
      return $delegate;
    });
  });
} catch (e) {
  //module nor registered in app
}
