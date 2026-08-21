import addEditCarouselTemplate from './modal/addEditCarousel/addEditCarousel.html';
(function (ng) {
    /* @ngInject */
    const CarouselCtrl = function (uiGridConstants, uiGridCustomConfig, $q, SweetAlert, $translate, uiGridCustomService, toaster, Upload) {
        const ctrl = this;
        ctrl.init = function () {
            let columnDefs = [
                {
                    name: 'ImageSrc',
                    displayName: $translate.instant('Admin.Js.Carousel.Image'),
                    enableSorting: false,
                    width: 80,
                    cellTemplate: `<div class="ui-grid-cell-contents">
                             <ui-modal-trigger class="ui-grid-custom-flex-center ui-grid-custom-link-for-img"
                                                  style="width: 100%;"
                                                  data-controller="\'ModalAddEditCarouselCtrl\'" size="small" controller-as="ctrl"
                                                  data-resolve="{'carousel': row.entity, 'resolve': {'fileTypes': grid.appScope.$ctrl.gridExtendCtrl.fileTypes, 'videoFileTypes': grid.appScope.$ctrl.gridExtendCtrl.videoFileTypes, 'advansedCarouselSettingsEnabled': grid.appScope.$ctrl.gridExtendCtrl.advansedCarouselSettingsEnabled}}"
                                                  template-url="${addEditCarouselTemplate}"
                                                  data-on-close="grid.appScope.$ctrl.fetchData()"
                                                  data-on-dismiss="grid.appScope.$ctrl.fetchData()">
                                <img alt="img" class="ui-grid-custom-col-img" style="width: 100%;" ng-style="{height: row.entity.Video ? '20px': 'auto'}" ng-src="{{row.entity.Video ? '../Areas/Admin/Content/images/icon/video-camera-player.svg'  : row.entity.ImageSrc}}">
                            </ui-modal-trigger>
                        </div>`,
                    enableCellEdit: false,
                },
            ];
            if (ctrl.advansedCarouselSettingsEnabled === 'true') {
                columnDefs.push({
                    name: 'TextTitle',
                    displayName: $translate.instant('Admin.Js.Carousel.TextTitle'),
                    enableCellEdit: true,
                    uiGridCustomEdit: {
                        replaceNullable: false,
                    },
                    filter: {
                        placeholder: $translate.instant('Admin.Js.Carousel.TextTitle'),
                        type: uiGridConstants.filter.INPUT,
                        name: 'TextTitle',
                    },
                });
            }
            columnDefs = columnDefs.concat([
                {
                    name: 'CarouselUrl',
                    displayName: $translate.instant('Admin.Js.Carousel.SynonymForURL'),
                    enableCellEdit: true,
                    uiGridCustomEdit: {
                        replaceNullable: false,
                    },
                    filter: {
                        placeholder: $translate.instant('Admin.Js.Carousel.SynonymForURL'),
                        type: uiGridConstants.filter.INPUT,
                        name: 'CarouselUrl',
                    },
                },
                {
                    name: 'Description',
                    displayName: $translate.instant('Admin.Js.Carousel.AltTagImage'),
                    enableCellEdit: true,
                    uiGridCustomEdit: {
                        replaceNullable: false,
                    },
                    filter: {
                        placeholder: $translate.instant('Admin.Js.Carousel.AltTagImage'),
                        type: uiGridConstants.filter.INPUT,
                        name: 'Description',
                    },
                },

                {
                    name: 'DisplayInOneColumn',
                    displayName: $translate.instant('Admin.Js.Carousel.OneColumn'),
                    enableCellEdit: true,
                    type: 'checkbox',
                    cellTemplate:
                        '<div class="ui-grid-cell-contents"><label class="ui-grid-custom-edit-field adv-checkbox-label" data-e2e="switchOnOffLabel"><input type="checkbox" class="adv-checkbox-input" ng-model="MODEL_COL_FIELD " data-e2e="switchOnOffSelect" /><span class="adv-checkbox-emul" data-e2e="switchOnOffInput"></span></label></div>',
                    width: 76,
                    filter: {
                        placeholder: $translate.instant('Admin.Js.Carousel.OneColumn'),
                        name: 'DisplayInOneColumn',
                        type: uiGridConstants.filter.SELECT,
                        selectOptions: [
                            {
                                label: $translate.instant('Admin.Js.Carousel.Yes'),
                                value: true,
                            },
                            { label: $translate.instant('Admin.Js.Carousel.No'), value: false },
                        ],
                    },
                },

                {
                    name: 'DisplayInTwoColumns',
                    displayName: $translate.instant('Admin.Js.Carousel.TwoColumns'),
                    enableCellEdit: true,
                    type: 'checkbox',
                    cellTemplate:
                        '<div class="ui-grid-cell-contents"><label class="ui-grid-custom-edit-field adv-checkbox-label" data-e2e="switchOnOffLabel"><input type="checkbox" class="adv-checkbox-input" ng-model="MODEL_COL_FIELD " data-e2e="switchOnOffSelect" /><span class="adv-checkbox-emul" data-e2e="switchOnOffInput"></span></label></div>',
                    width: 76,
                    filter: {
                        placeholder: $translate.instant('Admin.Js.Carousel.TwoColumns'),
                        name: 'DisplayInTwoColumns',
                        type: uiGridConstants.filter.SELECT,
                        selectOptions: [
                            {
                                label: $translate.instant('Admin.Js.Carousel.Yes'),
                                value: true,
                            },
                            { label: $translate.instant('Admin.Js.Carousel.No'), value: false },
                        ],
                    },
                },
                {
                    name: 'DisplayInMobile',
                    displayName: $translate.instant('Admin.Js.Carousel.MobVersion'),
                    enableCellEdit: true,
                    type: 'checkbox',
                    cellTemplate:
                        '<div class="ui-grid-cell-contents"><label class="ui-grid-custom-edit-field adv-checkbox-label" data-e2e="switchOnOffLabel"><input type="checkbox" class="adv-checkbox-input" ng-model="MODEL_COL_FIELD " data-e2e="switchOnOffSelect" /><span class="adv-checkbox-emul" data-e2e="switchOnOffInput"></span></label></div>',
                    width: 76,
                    filter: {
                        placeholder: $translate.instant('Admin.Js.Carousel.MobileVersion'),
                        name: 'DisplayInMobile',
                        type: uiGridConstants.filter.SELECT,
                        selectOptions: [
                            {
                                label: $translate.instant('Admin.Js.Carousel.Yes'),
                                value: true,
                            },
                            { label: $translate.instant('Admin.Js.Carousel.No'), value: false },
                        ],
                    },
                },
                {
                    name: 'Blank',
                    displayName: $translate.instant('Admin.Js.Carousel.InANewWindow'),
                    enableCellEdit: true,
                    type: 'checkbox',
                    cellTemplate:
                        '<div class="ui-grid-cell-contents"><label class="ui-grid-custom-edit-field adv-checkbox-label" data-e2e="switchOnOffLabel"><input type="checkbox" class="adv-checkbox-input" ng-model="MODEL_COL_FIELD " data-e2e="switchOnOffSelect" /><span class="adv-checkbox-emul" data-e2e="switchOnOffInput"></span></label></div>',
                    width: 76,
                    filter: {
                        placeholder: $translate.instant('Admin.Js.Carousel.InANewWindow'),
                        name: 'Blank',
                        type: uiGridConstants.filter.SELECT,
                        selectOptions: [
                            {
                                label: $translate.instant('Admin.Js.Carousel.Yes'),
                                value: true,
                            },
                            { label: $translate.instant('Admin.Js.Carousel.No'), value: false },
                        ],
                    },
                },
                {
                    name: 'SortOrder',
                    displayName: $translate.instant('Admin.Js.Carousel.Sorting'),
                    width: 120,
                    enableCellEdit: true,
                    type: 'number',
                    uiGridCustomEdit: {
                        attributes: {
                            min: -2147483648,
                            max: 2147483647,
                        },
                    },
                },
                {
                    name: 'Enabled',
                    displayName: $translate.instant('Admin.Js.Carousel.Activ'),
                    enableCellEdit: true,
                    type: 'checkbox',
                    cellTemplate:
                        '<div class="ui-grid-cell-contents"><label class="ui-grid-custom-edit-field adv-checkbox-label" data-e2e="switchOnOffLabel"><input type="checkbox" class="adv-checkbox-input" ng-model="MODEL_COL_FIELD " data-e2e="switchOnOffSelect" /><span class="adv-checkbox-emul" data-e2e="switchOnOffInput"></span></label></div>',
                    width: 76,
                    filter: {
                        placeholder: $translate.instant('Admin.Js.Carousel.Activ'),
                        name: 'Enabled',
                        type: uiGridConstants.filter.SELECT,
                        selectOptions: [
                            {
                                label: $translate.instant('Admin.Js.Carousel.Yes'),
                                value: true,
                            },
                            { label: $translate.instant('Admin.Js.Carousel.No'), value: false },
                        ],
                    },
                },
                {
                    name: '_serviceEditColumn',
                    displayName: '',
                    width: 37,
                    enableSorting: false,
                    useInSwipeBlock: false,
                    cellTemplate: `<div class="ui-grid-cell-contents">
                            <ui-modal-trigger data-controller="'ModalAddEditCarouselCtrl'"
                                              size="lg"
                                              controller-as="ctrl"
                                              data-resolve="{'carousel': row.entity, 'resolve': {'fileTypes': grid.appScope.$ctrl.gridExtendCtrl.fileTypes, 'videoFileTypes': grid.appScope.$ctrl.gridExtendCtrl.videoFileTypes, 'advansedCarouselSettingsEnabled': grid.appScope.$ctrl.gridExtendCtrl.advansedCarouselSettingsEnabled}}"
                                              template-url="${addEditCarouselTemplate}"
                                              data-on-close="grid.appScope.$ctrl.fetchData()"
                                              data-on-dismiss="grid.appScope.$ctrl.fetchData()">
                                <button type="button"
                                        class="btn-icon link-invert ui-grid-custom-service-icon fas fa-pencil-alt"
                                        aria-label="Редактировать"></button>
                            </ui-modal-trigger>
                        </div>`,
                },
                {
                    name: '_serviceDeleteColumn',
                    displayName: '',
                    width: 37,
                    enableSorting: false,
                    useInSwipeBlock: true,
                    cellTemplate: uiGridCustomService.getTemplateCellDelete('Carousel/DeleteCarousel', '{Ids: row.entity.CarouselId}'),
                    // cellTemplate:
                    // 	'<div class="ui-grid-cell-contents"><div>' +
                    // 	'<ui-grid-custom-delete url="Carousel/DeleteCarousel" params="{\'Ids\': row.entity.CarouselId}"></ui-grid-custom-delete>' +
                    // 	'</div></div>',
                },
            ]);

            ctrl.gridOptions = ng.extend({}, uiGridCustomConfig, {
                columnDefs,
                uiGridCustom: {
                    selectionOptions: [
                        {
                            text: $translate.instant('Admin.Js.Carousel.DeleteSelected'),
                            url: 'Carousel/DeleteCarousel',
                            field: 'CarouselId',
                            before() {
                                return SweetAlert.confirm($translate.instant('Admin.Js.Carousel.AreYouSureDelete'), {
                                    title: $translate.instant('Admin.Js.Carousel.Deleting'),
                                }).then((result) =>
                                    result === true || result.value ? $q.resolve('sweetAlertConfirm') : $q.reject('sweetAlertCancel'),
                                );
                            },
                        },
                    ],
                },
            });
        };

        ctrl.gridOnInit = function (grid) {
            ctrl.grid = grid;
        };

        ctrl.upload = function (_$files, $file, _$newFiles, _$duplicateFiles, $invalidFiles, $event) {
            if (($event.type === 'change' || $event.type === 'drop') && $file != null) {
                Upload.upload({
                    url: '/Carousel/upload',
                    data: {
                        file: $file,
                        rnd: Math.random(),
                    },
                }).then((response) => {
                    const data = response.data;
                    if (data.Result === true) {
                        ctrl.ImageSrc = data.Picture;
                    } else {
                        toaster.pop('error', $translate.instant('Admin.Js.Carousel.ErrorLoadingImage'), data.error);
                    }
                });
            } else if ($invalidFiles.length > 0) {
                toaster.pop(
                    'error',
                    $translate.instant('Admin.Js.Carousel.ErrorLoadingImage'),
                    $translate.instant('Admin.Js.Carousel.FileDoesNotMeet'),
                );
            }
        };
    };

    ng.module('carouselPage', ['uiGridCustom', 'urlHelper', 'color.picker']).controller('CarouselPageCtrl', CarouselCtrl);
})(window.angular);
