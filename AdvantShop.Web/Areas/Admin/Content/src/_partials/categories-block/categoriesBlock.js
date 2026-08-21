import '../../../styles/progress-overlay.scss';

(function (ng) {
    

    const CategoriesBlockCtrl = function (SweetAlert, catalogService, toaster, $translate) {
        const ctrl = this;

        ctrl.$onInit = function () {
            ctrl.categoriesSelected = [];
            ctrl.categoriesIdForDeleting = [];

            ctrl.fetch();
        };

        ctrl.fetch = function () {
            return catalogService.getCategories(ctrl.categoryId, ctrl.categorysearch).then((result) => (ctrl.categories = result));
        };

        ctrl.toggleSelectedAll = function (selectAll) {
            if (selectAll === true) {
                ctrl.categoriesSelected = ctrl.categories.map((item) => item.CategoryId);
            } else {
                ctrl.categoriesSelected = [];
            }
        };

        ctrl.deleteCategories = function (ids) {
            SweetAlert.confirm($translate.instant('Admin.Js.CategoriesBlock.AreYouSureDeleteCategories'), {
                title: $translate.instant('Admin.Js.CategoriesBlack.DeletingCategories'),
                cancelButtonText: $translate.instant('Admin.Js.Cancel'),
                showLoaderOnConfirm: true,
            }).then((result) => {
                if (result === true || result.value) {
                    ctrl.categoriesIdForDeleting = ids;
                    catalogService
                        .deleteCategories(ids)
                        .then(() => {
                            ctrl.categoriesSelected = [];
                        })
                        .then(ctrl.fetch)
                        .then(() => {
                            if (ctrl.onDelete != null) {
                                ctrl.onDelete();
                            }
                            ctrl.categoriesIdForDeleting.length = 0;
                            toaster.pop('success', '', $translate.instant('Admin.Js.CategoriesBlock.ChangesSaved'));
                        });
                }
            });
        };

        ctrl.deleteCategory = function (id) {
            SweetAlert.confirm($translate.instant('Admin.Js.CategoriesBlock.AreYouSureDeleteCategory'), {
                title: $translate.instant('Admin.Js.CategoriesBlock.DeletingCategory'),
                cancelButtonText: $translate.instant('Admin.Js.Cancel'),
                showLoaderOnConfirm: true,
                confirmButtonColor: '#2d9cee',
                cancelButton: '#ffffff',
            }).then((result) => {
                if (result === true || result.value) {
                    ctrl.categoriesIdForDeleting = [id];
                    catalogService
                        .deleteCategories([id])
                        .then(() => {
                            ctrl.categoriesSelected = [];
                        })
                        .then(ctrl.fetch)
                        .then(() => {
                            if (ctrl.onDelete != null) {
                                ctrl.onDelete();
                            }
                            ctrl.categoriesIdForDeleting.length = 0;
                            toaster.pop('success', '', $translate.instant('Admin.Js.CategoriesBlock.ChangesSaved'));
                        });
                }
            });
        };

        ctrl.sortableOptions = {
            orderChanged (event) {
                const categoryId = event.source.itemScope.category.CategoryId,
                    prevCategory = ctrl.categories[event.dest.index - 1],
                    nextCategory = ctrl.categories[event.dest.index + 1];

                catalogService
                    .changeCategorySortOrder(
                        categoryId,
                        prevCategory != null ? prevCategory.CategoryId : null,
                        nextCategory != null ? nextCategory.CategoryId : null,
                    )
                    .then(() => {
                        toaster.pop('success', '', $translate.instant('Admin.Js.CategoriesBlock.ChangesSaved'));
                    });
            },
        };

        ctrl.toggleCategory = function (value, checked) {
            const idx = ctrl.categoriesSelected.indexOf(value);
            if (idx >= 0 && !checked) {
                ctrl.categoriesSelected.splice(idx, 1);
            }
            if (idx < 0 && checked) {
                ctrl.categoriesSelected.push(value);
            }
            return checked;
        };

        ctrl.check = function (categoryId) {
            return ctrl.categoriesSelected.indexOf(categoryId) >= 0;
        };
    };

    CategoriesBlockCtrl.$inject = ['SweetAlert', 'catalogService', 'toaster', '$translate'];

    ng.module('categoriesBlock', ['ng-sweet-alert', 'checklist-model', 'as.sortable']).controller('CategoriesBlockCtrl', CategoriesBlockCtrl);
})(window.angular);
