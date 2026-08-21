import ngFileUploadModule from '../../../node_modules/ng-file-upload/index.js';

import './styles/reviews.scss';

import ReviewsCtrl from './controllers/reviewsController.js';
import ReviewsFormCtrl from './controllers/reviewsFormController.js';
import ReviewItemRatingCtrl from './controllers/reviewItemRatingController.js';
import {
    reviewsDirective,
    reviewItemDirective,
    reviewsFormDirective,
    reviewReplyDirective,
    reviewDeleteDirective,
    reviewItemRatingDirective,
    reviewModalTriggerDirective,
} from './directives/reviewsDirectives.js';
import ReviewModalTriggerCtrl from './controllers/reviewModalTriggerCtrl.js';
import { reviewsService } from './services/reviewsService.js';

const moduleName = 'reviews';

angular
    .module(moduleName, [ngFileUploadModule])
    .constant('reviewConfig', {
        reviewFormType: {
            default: 'default',
            inModal: 'inmodal',
        },
    })
    .service('reviewsService', reviewsService)
    .controller('ReviewsCtrl', ReviewsCtrl)
    .controller('ReviewItemRatingCtrl', ReviewItemRatingCtrl)
    .controller('ReviewsFormCtrl', ReviewsFormCtrl)
    .controller('ReviewModalTriggerCtrl', ReviewModalTriggerCtrl)
    .directive('reviews', reviewsDirective)
    .directive('reviewItem', reviewItemDirective)
    .directive('reviewsForm', reviewsFormDirective)
    .directive('reviewReply', reviewReplyDirective)
    .directive('reviewDelete', reviewDeleteDirective)
    .directive('reviewItemRating', reviewItemRatingDirective)
    .directive('reviewModalTrigger', reviewModalTriggerDirective);

export default moduleName;
