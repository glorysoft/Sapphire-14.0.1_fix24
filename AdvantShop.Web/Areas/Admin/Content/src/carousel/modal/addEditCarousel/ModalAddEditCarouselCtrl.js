/* @ngInject */
const ModalAddEditCarouselCtrl = function ($uibModalInstance, $http, toaster, $translate, $timeout) {
    const ctrl = this;

    ctrl.$onInit = function () {
        ctrl.colorPickerOptions = {
            swatchBootstrap: false,
            format: 'hex',
            alpha: false,
            swatchOnly: false,
            case: 'lower',
            allowEmpty: true,
            required: false,
            preserveInputFormat: false,
            restrictToFormat: false,
            inputClass: 'form-control',
        };

        ctrl.colorPickerHeaderTextEventApi = {};

        ctrl.colorPickerHeaderTextEventApi.onBlur = function () {
            ctrl.colorPickerHeaderTextApi.getScope().AngularColorPickerController.update();
        };

        ctrl.colorPickerTextEventApi = {};

        ctrl.colorPickerTextEventApi.onBlur = function () {
            ctrl.colorPickerTextApi.getScope().AngularColorPickerController.update();
        };

        ctrl.colorPickerButton1EventApi = {};

        ctrl.colorPickerButton1EventApi.onBlur = function () {
            ctrl.colorPickerButton1Api.getScope().AngularColorPickerController.update();
        };

        ctrl.colorPickerButton1TextEventApi = {};

        ctrl.colorPickerButton1TextEventApi.onBlur = function () {
            ctrl.colorPickerButton1TextApi.getScope().AngularColorPickerController.update();
        };

        ctrl.colorPickerButton2EventApi = {};

        ctrl.colorPickerButton2EventApi.onBlur = function () {
            ctrl.colorPickerButton2Api.getScope().AngularColorPickerController.update();
        };

        ctrl.colorPickerButton2TextEventApi = {};

        ctrl.colorPickerButton2TextEventApi.onBlur = function () {
            ctrl.colorPickerButton2TextApi.getScope().AngularColorPickerController.update();
        };

        ctrl.IsVideo = false;
        ctrl.carouselId = 0;
        ctrl.Text = { ColorCode: 'ffffff' };
        ctrl.Buttons = [
            { ButtonColorCode: '0088cc', TextColorCode: 'ffffff', UseStoreColorScheme: true },
            { ButtonColorCode: '0088cc', TextColorCode: 'ffffff', UseStoreColorScheme: true },
        ];
        const params = ctrl.$resolve;
        const carousel = params.carousel;
        ctrl.fileTypes = params?.resolve?.fileTypes;
        ctrl.videoFileTypes = params?.resolve?.videoFileTypes;
        ctrl.advansedCarouselSettingsEnabled = params?.resolve?.advansedCarouselSettingsEnabled === 'true';
        ctrl.mode = carousel != null ? 'edit' : 'add';
        if (carousel) {
            ctrl.carouselId = carousel.CarouselId != null ? carousel.CarouselId : 0;
            ctrl.CaruselUrl = carousel.CarouselUrl;
            ctrl.DisplayInOneColumn = carousel.DisplayInOneColumn;
            ctrl.DisplayInTwoColumns = carousel.DisplayInTwoColumns;
            ctrl.DisplayInMobile = carousel.DisplayInMobile;
            ctrl.Blank = carousel.Blank;
            ctrl.SortOrder = carousel.SortOrder;
            ctrl.Enabled = carousel.Enabled;
            ctrl.ImageSrc = carousel.ImageSrc;
            ctrl.Description = carousel.Description;
            ctrl.Obscuring = carousel.Obscuring;
            ctrl.MarginTop = carousel.MarginTop;
            ctrl.MarginBottom = carousel.MarginBottom;
            ctrl.MarginLeft = carousel.MarginLeft;
            ctrl.MarginRight = carousel.MarginRight;
            ctrl.HeaderTextColorCode = carousel.HeaderTextColorCode;
            ctrl.TextTitle = carousel.TextTitle;
            ctrl.IsVideo = carousel.IsVideo;
            ctrl.VideoSrc = carousel.VideoSrc;
            if (carousel.Text) {
                ctrl.Text = carousel.Text;
            }
            if (carousel.Buttons) {
                for (let i = 0; i < carousel.Buttons.length; i++) {
                    if (ctrl.Buttons[i]) {
                        ctrl.Buttons[i] = carousel.Buttons[i];
                    } else {
                        ctrl.Buttons.push(carousel.Buttons[i]);
                    }
                }
            }
        }
        ctrl.getAlignments();
        ctrl.getHorizontalPositions();
        ctrl.getVerticalPositions();
        ctrl.getAnimations();
        $timeout(() => {
            ctrl.colorPickerHeaderTextApi?.getScope().AngularColorPickerController.setNgModel(ctrl.HeaderTextColorCode);
            ctrl.colorPickerTextApi?.getScope().AngularColorPickerController.setNgModel(ctrl.Text.ColorCode);
            ctrl.colorPickerButton1Api?.getScope().AngularColorPickerController.setNgModel(ctrl.Buttons[0].ButtonColorCode);
            ctrl.colorPickerButton1TextApi?.getScope().AngularColorPickerController.setNgModel(ctrl.Buttons[0].TextColorCode);
            ctrl.colorPickerButton2Api?.getScope().AngularColorPickerController.setNgModel(ctrl.Buttons[1].ButtonColorCode);
            ctrl.colorPickerButton2TextApi?.getScope().AngularColorPickerController.setNgModel(ctrl.Buttons[1].TextColorCode);
        }, 1000);
    };

    ctrl.close = function () {
        $uibModalInstance.dismiss('cancel');
    };

    ctrl.getAlignments = function () {
        $http.get('carousel/getAlignments').then((response) => {
            ctrl.alignments = response.data;
            if (ctrl.alignments && ctrl.alignments.length > 0 && ctrl.Text.Alignment == null) {
                ctrl.Text.Alignment = ctrl.alignments[0].value;
            }
        });
    };

    ctrl.getHorizontalPositions = function () {
        $http.get('carousel/getHorizontalPositions').then((response) => {
            ctrl.horizontalPositions = response.data;
            if (ctrl.horizontalPositions && ctrl.horizontalPositions.length > 0 && ctrl.Text.PositionHorizontal == null) {
                ctrl.Text.PositionHorizontal = ctrl.horizontalPositions[0].value;
            }
        });
    };

    ctrl.getVerticalPositions = function () {
        $http.get('carousel/getVerticalPositions').then((response) => {
            ctrl.verticalPositions = response.data;
            if (ctrl.verticalPositions && ctrl.verticalPositions.length > 1 && ctrl.Text.PositionVertical == null) {
                ctrl.Text.PositionVertical = ctrl.verticalPositions[1].value;
            }
        });
    };

    ctrl.getAnimations = function () {
        $http.get('carousel/getAnimations').then((response) => {
            ctrl.animations = response.data;
            if (ctrl.animations && ctrl.animations.length > 0 && ctrl.Text.Animation == null) {
                ctrl.Text.Animation = ctrl.animations[0].value;
            }
        });
    };

    ctrl.updateImage = function (result) {
        ctrl.ImageSrc = result.pictureName;
    };

    ctrl.updateVideo = function (result) {
        ctrl.VideoSrc = result.obj;
    };

    ctrl.saveCarousel = function () {
        ctrl.btnSleep = true;

        if (!ctrl.advansedCarouselSettingsEnabled && (ctrl.ImageSrc == null || ctrl.ImageSrc === '')) {
            toaster.pop(
                'error',
                $translate.instant('Admin.Js.Carousel.ImageNotUploaded'),
                $translate.instant('Admin.Js.Carousel.PleaseUploadAnImage'),
            );
            ctrl.btnSleep = false;
            return;
        } else if (
            ctrl.advansedCarouselSettingsEnabled &&
            (ctrl.ImageSrc == null || ctrl.ImageSrc === '') &&
            (ctrl.VideoSrc == null || ctrl.VideoSrc === '')
        ) {
            toaster.pop(
                'error',
                $translate.instant('Admin.Js.Carousel.ImageOrVideoNotUploaded'),
                $translate.instant('Admin.Js.Carousel.PleaseUploadAnImageOrVideo'),
            );
            ctrl.btnSleep = false;
            return;
        }

        const params = {
            CarouselID: ctrl.carouselId,
            CarouselUrl: ctrl.CaruselUrl,
            DisplayInOneColumn: ctrl.DisplayInOneColumn,
            DisplayInTwoColumns: ctrl.DisplayInTwoColumns,
            DisplayInMobile: ctrl.DisplayInMobile,
            Blank: ctrl.Blank,
            SortOrder: ctrl.SortOrder,
            Enabled: ctrl.Enabled,
            ImageSrc: ctrl.ImageSrc,
            Description: ctrl.Description,
            Obscuring: ctrl.Obscuring,
            MarginTop: ctrl.MarginTop,
            MarginBottom: ctrl.MarginBottom,
            MarginLeft: ctrl.MarginLeft,
            MarginRight: ctrl.MarginRight,
            HeaderTextColorCode: ctrl.HeaderTextColorCode,
            IsVideo: ctrl.IsVideo,
            Text: ctrl.Text,
            Buttons: ctrl.Buttons,
            VideoSrc: ctrl.VideoSrc,
            rnd: Math.random(),
        };

        const url = ctrl.mode === 'edit' ? 'Carousel/InplaceCarousel' : 'Carousel/AddCarousel';

        $http.post(url, params).then((response) => {
            if (response.status !== 200) {
                toaster.pop('error', $translate.instant('Admin.Js.Carousel.Error'), $translate.instant('Admin.Js.Carousel.ErrorWhileAddingImage'));
                ctrl.btnSleep = false;
                return;
            }
            if (response.data.result === true) {
                toaster.pop('success', '', $translate.instant('Admin.Js.Carousel.ChangesSaved'));
                $uibModalInstance.close(params);
            } else {
                response.data.errors.forEach((error) => toaster.pop('error', '', error));
                ctrl.btnSleep = false;
            }
        });
    };
};

angular.module('uiModal').controller('ModalAddEditCarouselCtrl', ModalAddEditCarouselCtrl);
