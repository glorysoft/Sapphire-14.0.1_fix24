import { PubSub } from '../../../_common/PubSub/PubSub.js';

/* @ngInject */
function ReviewsCtrl(
    $element,
    $compile,
    $scope,
    $http,
    $filter,
    $templateCache,
    $timeout,
    toaster,
    Upload,
    $translate,
    $q,
    SweetAlert,
    reviewConfig,
    reviewsService,
) {
    let ctrl = this,
        listRoot,
        items = {},
        form,
        formScope,
        formReadyDeferred = $q.defer();

    ctrl.visibleFormCancelButton = false;
    ctrl.reviewIdActive = 0;

    ctrl.addItemInStorage = function (id, element) {
        items[id] = element;
    };

    ctrl.addForm = function (scope, element) {
        form = element;
        formScope = scope;
        formReadyDeferred.resolve();
    };

    ctrl.getForm = function () {
        return form;
    };

    ctrl.reply = function (parentId) {
        return formReadyDeferred.promise.then(() => {
            if (formScope.type === reviewConfig.reviewFormType.inModal) {
                const disposeModal = reviewsService.showModal(null, 'reviewFormTemplate.html', ctrl);
                $element.on('$destroy', disposeModal);
            } else {
                items[parentId].append(ctrl.getForm());
            }

            ctrl.moveFormInside(parentId);
            ctrl.formVisible = true;
            ctrl.focusInput();
        });
    };

    ctrl.moveFormInside = function (parentId) {
        ctrl.reviewIdActive = parentId;
        ctrl.visibleFormCancelButton = true;
    };

    ctrl.formReset = function () {
        formScope.reset();
    };

    ctrl.moveFormDefault = function () {
        $element.append(form);
    };

    ctrl.formInStart = function () {
        if (formScope.type !== reviewConfig.reviewFormType.inModal) {
            ctrl.moveFormDefault();
        }

        ctrl.formReset();

        ctrl.reviewIdActive = 0;
        ctrl.visibleFormCancelButton = false;
    };

    ctrl.addReview = function (actionUrl, name, email, text, parentId, files, agreement, captchaCode, captchaSource, rating) {
        PubSub.publish('add_response');

        return Upload.upload({
            url: actionUrl,
            data: {
                entityId: ctrl.entityId,
                entityType: ctrl.entityType,
                name,
                email,
                text,
                parentId,
                agreement,
                captchaCode,
                captchaSource,
                rating,
                file: files, // or list of files (files) for html5 only
            },
        });
    };

    ctrl.submit = function (form, actionUrl) {
        //if (form.form.captchaCode != undefined) {
        return ctrl
            .addReview(
                actionUrl,
                form.name,
                form.email,
                form.text,
                form.reviewId,
                form.images,
                form.agreement,
                form.captchaCode,
                form.captchaSource,
                form.rating,
            )
            .then((response) => {
                if (response.data.errors != null && response.data.errors.length > 0) {
                    toaster.pop('error', response.data.errors.join('<br>'));
                    return $q.reject(response.data.errors);
                }
                if (!form.reviewId || form.reviewId == 0) {
                    ctrl.hideAddReviews = !ctrl.isAdmin;
                    ctrl.currentRating = form.rating;
                }
                const newReview = response.data.review;
                if (ctrl.moderate == null || ctrl.moderate == false) {
                    ctrl.renderReviewItem(
                        newReview.ParentId,
                        newReview.ReviewId,
                        newReview.Name,
                        $filter('date')(Date.now(), 'dd MMMM yyyy'),
                        newReview.Text,
                        newReview.Photos,
                        newReview.Likes,
                        newReview.Dislikes,
                        newReview.RatioByLikes,
                    );
                    if (ctrl.onAddComment != null) {
                        ctrl.onAddComment($scope);
                    }
                    $translate(['Js.Reviews.SuccessTitle', 'Js.Reviews.SuccessMessage']).then((translations) => {
                        toaster.success(translations['Js.Reviews.SuccessTitle'], translations['Js.Reviews.SuccessMessage']);
                    });
                } else {
                    toaster.pop('info', $translate.instant('Js.Reviews.ThxForReviewTitle'), $translate.instant('Js.Reviews.ThxForReviewMsg'));
                }
            })
            .then(() => {
                if (ctrl.showFormAfterDo === true) {
                    ctrl.formInStart();
                } else {
                    ctrl.formReset();
                    ctrl.reviewIdActive = 0;
                    ctrl.visibleFormCancelButton = false;
                    ctrl.formVisible = false;
                }
            })
            .catch((err) => console.warn(err));
        //}
    };

    ctrl.renderReviewItem = function (parentId, reviewId, name, date, text, photos, likes, dislikes, ratioByLikes) {
        let parentContainer, list, needContainer, reviewNew, htmlItem, before;

        if (items[parentId] != null) {
            list = items[parentId].children('ul');

            if (list.length > 0) {
                parentContainer = list;
                needContainer = false;
            } else {
                parentContainer = items[parentId];
                needContainer = true;
            }
        } else {
            if (listRoot) {
                parentContainer = listRoot;
            }
            if (parentContainer == null) {
                const reviewslist = $element[0].querySelector('.reviews-list');
                if (reviewslist != null) {
                    parentContainer = angular.element(reviewslist);
                }
            }
            if (parentContainer == null) {
                parentContainer = angular.element($element[0].querySelector('.js-reviews-list-root'));
            }
            needContainer = true;
            before = true;
        }

        ctrl.getHtmlReviewItem(needContainer).then((htmlItem) => {
            reviewNew = angular.element(htmlItem);

            if (before) {
                parentContainer.before(reviewNew);
            } else {
                parentContainer.append(reviewNew);
            }

            const scopeItem = $scope.$new();

            scopeItem.parentId = parentId;
            scopeItem.reviewId = reviewId;
            scopeItem.name = name;
            scopeItem.date = $translate.instant(date);
            scopeItem.text = text;
            scopeItem.photos = photos;
            scopeItem.likes = likes;
            scopeItem.dislikes = dislikes;
            scopeItem.ratioByLikes = ratioByLikes;

            $compile(reviewNew)(scopeItem);
        });
    };

    ctrl.getHtmlReviewItem = function (needContainer) {
        return $http.get('reviewItemTemplate.html', { cache: $templateCache }).then((response) => {
            let result = response.data;

            if (needContainer === true) {
                result = `<ul class="reviews-list">${  result  }</ul>`;
            }

            return result;
        });
    };

    ctrl.cancel = function (form) {
        if (ctrl.showFormAfterDo === true) {
            ctrl.formInStart();
        } else {
            ctrl.formReset();
            ctrl.reviewIdActive = 0;
            ctrl.visibleFormCancelButton = false;
            ctrl.formVisible = false;
        }
    };

    ctrl.deleteReviewFromDB = function (reviewId, actionUrl) {
        return $http.post(actionUrl, { reviewId });
    };

    ctrl.delete = function (reviewId, actionUrl) {
        if (items[reviewId] != null) {
            SweetAlert.confirm($translate.instant('Js.AreYouSureDelete'), {
                title: $translate.instant('Js.Deleting'),
            }).then((result) => {
                if (result === true || result.value) {
                    ctrl.deleteReviewFromDB(reviewId, actionUrl).then((response) => {
                        items[reviewId].remove();

                        if (ctrl.onDeleteComment != null) {
                            ctrl.onDeleteComment($scope);
                        }
                    });
                }
            });
        }
    };

    ctrl.focusInput = function () {
        formScope.setAutofocus();
    };
}

export default ReviewsCtrl;
