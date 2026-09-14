import './styles/orderHistory.scss'
import itemsTemplate from './templates/items.html';
import detailsTemplate from '../../../../../scripts/_partials/order/templates/details.html';
import mobileDetailsTemplate from './templates/mobileDetails.html';
try {
    angular.module('order')
        .config( /*@ngInject*/ function ($provide) {
            $provide.decorator('orderHistoryItemsDirective', /*@ngInject*/ function ($delegate) {
                const directive = $delegate[0];

                directive.templateUrl = itemsTemplate;

                return $delegate;
            });

            $provide.decorator('orderHistoryDetailsDirective', /*@ngInject*/ function ($delegate) {
                const directive = $delegate[0];

                directive.templateUrl = (_element, attrs) => attrs.isMobile ? mobileDetailsTemplate : detailsTemplate;

                return $delegate;
            });
        });
} catch (e) {

}
