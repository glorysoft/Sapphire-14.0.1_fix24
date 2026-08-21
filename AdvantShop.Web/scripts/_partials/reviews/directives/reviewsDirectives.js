import reviewFormTemplate from '../templates/reviewForm.html';
/* @ngInject */
function reviewsDirective($parse) {
    return {
        restrict: 'A',
        scope: true,
        controller: 'ReviewsCtrl',
        controllerAs: 'reviews',
        bindToController: true,
        link(_scope, _element, attrs, ctrl) {
            ctrl.moderate = attrs.moderate === 'true';
            ctrl.isAdmin = attrs.isAdmin === 'true';
            ctrl.entityId = attrs.entityId;
            ctrl.entityType = attrs.entityType;
            ctrl.name = attrs.name;
            ctrl.email = attrs.email;
            ctrl.currentRating = attrs.currentRating;
            ctrl.actionUrl = attrs.actionUrl;
            ctrl.formVisible = attrs.formVisible !== 'false';
            ctrl.allowImageUpload = attrs.allowImageUpload === 'true';
            ctrl.readonly = attrs.readonly === 'true';
            ctrl.onAddComment = attrs.onAddComment ? $parse(attrs.onAddComment) : null;
            ctrl.onDeleteComment = attrs.onDeleteComment ? $parse(attrs.onDeleteComment) : null;
            ctrl.showFormAfterDo = attrs.showFormAfterDo ? $parse(attrs.showFormAfterDo) : true;
        },
    };
}

function reviewItemDirective() {
    return {
        require: '^reviews',
        restrict: 'A',
        scope: true,
        link(_scope, element, attrs, ctrl) {
            ctrl.addItemInStorage(attrs.reviewId, element);
        },
    };
}

function reviewsFormDirective() {
    return {
        require: {
            reviewsForm: '^reviewsForm',
            reviews: '^?reviews',
            modalControl: '?^modalControl',
        },
        restrict: 'A',
        scope: {
            visibleFormCancelButton: '=',
            reviewId: '=',
            name: '=',
            email: '=',
            submitFn: '&',
            cancelFn: '&',
            formVisible: '=',
            allowImageUpload: '=',
            isShowUserAgreementText: '=',
            agreementDefaultChecked: '<?',
            userAgreementText: '@',
            moderate: '=',
            currentRating: '=',
            type: '@?',
        },
        controller: 'ReviewsFormCtrl',
        controllerAs: 'reviewsForm',
        bindToController: true,
        transclude: true,
        templateUrl: reviewFormTemplate,
        replace: true,
        link(scope, element, _attrs, ctrl) {
            if (!ctrl.reviews) {
                let scopeTemp = scope.$parent;
                while (scopeTemp !== null || typeof scopeTemp !== 'undefined') {
                    if (scopeTemp.reviews) {
                        ctrl.reviews = scopeTemp.reviews;
                        break;
                    }
                    scopeTemp = scopeTemp.$parent;
                }
            }
            ctrl.reviews.addForm(ctrl.reviewsForm, element);
        },
    };
}

/* @ngInject */
function reviewReplyDirective(reviewConfig) {
    return {
        require: '^reviews',
        restrict: 'A',
        replace: true,
        transclude: true,
        scope: {
            reviewId: '@',
            type: '@?',
        },
        template: `
            <div class="contents">
                <a  data-ng-if="type !== reviewConfig.reviewFormType.inModal"
                    href="javascript:void(0)"
                    class="review-item-button"
                    data-ng-transclude
                    data-ng-click="parentScope.reply(reviewId)"></a>

                <button data-ng-if="type === reviewConfig.reviewFormType.inModal"
                        type="button"
                        class="btn-link review-item-button"
                        data-review-modal-trigger
                        data-callback-open="parentScope.reply(reviewId)"
                        data-modal-template-url="reviewFormTemplate.html"
                        data-ng-transclude></button>
            </div>
        `,
        link(scope, _element, _attrs, ctrl) {
            scope.reviewConfig = reviewConfig;
            scope.parentScope = ctrl;
        },
    };
}

function reviewDeleteDirective() {
    return {
        require: '^reviews',
        restrict: 'A',
        replace: true,
        transclude: true,
        scope: {
            reviewId: '@',
            actionUrl: '@',
        },
        template:
            '<a href="javascript:void(0)" class="review-item-button" data-ng-transclude data-ng-click="parentScope.delete(reviewId, actionUrl)"></a>',
        link(scope, _element, _attrs, ctrl) {
            scope.parentScope = ctrl;
        },
    };
}

function reviewItemRatingDirective() {
    return {
        scope: true,
        controller: 'ReviewItemRatingCtrl',
        controllerAs: 'reviewItemRating',
    };
}

/* @ngInject */
function reviewModalTriggerDirective(reviewsService, $parse, $timeout) {
    return {
        restrict: 'A',
        require: {
            reviews: '^reviews',
        },
        scope: true,
        controller: 'ReviewModalTriggerCtrl',
        controllerAs: 'reviewModalTrigger',
        bindToController: true,
        link(scope, element, attrs, ctrl) {
            element.on('click', (event) => {
                event.preventDefault();
                scope.$apply(() => {
                    const modalContent = document.getElementById(attrs.modalTemplate).innerHTML;
                    reviewsService.showModal(attrs.modalId, modalContent, ctrl.reviews).then(() => {
                        $timeout(() => {
                            $parse(attrs.callbackOpen)(scope);
                        }, 50);
                    });
                });
            });
        },
    };
}

export {
    reviewsDirective,
    reviewItemDirective,
    reviewsFormDirective,
    reviewReplyDirective,
    reviewDeleteDirective,
    reviewItemRatingDirective,
    reviewModalTriggerDirective,
};
