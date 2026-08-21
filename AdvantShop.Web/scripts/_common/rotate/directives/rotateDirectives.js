/*@ngInject*/
function rotateDirective($window) {
    return {
        restrict: 'A',
        scope: {
            imagePath: '@',
            totalFrames: '@',
            endFrame: '@',
            height: '@',
            width: '@',
            imgList: '@',
            progress: '@',
            navigation: '&',
            responsive: '&',
            autoplayDirection: '@', // -1 or 1
            autoplay: '&',
            ext: '@',
            framerate: '@',
        },
        controller: 'RotateCtrl',
        controllerAs: 'rotate',
        bindToController: true,
        replace: true,
        template: '<div class="threesixty"><div class="spinner"><span>0%</span></div><ul class="threesixty_images"></ul></div>',
        link (scope, element, attrs, ctrl) {
            const img = new Image();

            img.addEventListener('load', () => {
                const wInnerWidthCut = $window.innerWidth * 0.75;
                const wInnerHeightCut = $window.innerHeight * 0.75;

                const resultWidth = Math.min(wInnerWidthCut, img.naturalWidth);
                const diffWidth = img.naturalWidth > wInnerWidthCut ? img.naturalWidth - wInnerWidthCut : 0;
                let resultHeight;

                if (wInnerWidthCut < img.naturalWidth) {
                    resultHeight = ((img.naturalWidth - diffWidth) * img.naturalHeight) / img.naturalWidth;
                } else {
                    resultHeight = img.naturalHeight;
                }

                ctrl.rotateOptions.width = resultWidth;
                ctrl.rotateOptions.height = resultHeight;

                element.ThreeSixty(ctrl.rotateOptions);
            });

            img.src = `${ctrl.rotateOptions.imagePath  }1${  ctrl.rotateOptions.ext}`;
        },
    };
}

export { rotateDirective };
