import html2canvas from 'html2canvas';

/*@ngInject*/
function LogoGeneratorModalCtrl(logoGeneratorService, $timeout, $document, $window, urlHelper) {
    const ctrl = this;

    ctrl.save = function (logoGeneratorId, urlSave, params, successFn) {
        ctrl.savingLogo = true;

        $timeout(() => {
            logoGeneratorService
                .getLogoGeneratorPreview(logoGeneratorId)
                .then((logoGeneratorPreview) => html2canvas(logoGeneratorPreview.element, {
                    backgroundColor: null,
                    //надо брать ширину без вертикального скролла так как тогда картинка смещается вправо
                    windowWidth: $document[0].body.clientWidth,
                    height: logoGeneratorPreview.element.clientHeight + 5, //чтобы с низу не обрезалось
                    scrollY: $window.scrollY,
                    scale: 1,
                })
                    .then((canvas) => ({
                        logoGeneratorPreview,
                        canvas,
                    })))
                .then((data) => logoGeneratorService.saveLogo(
                    urlSave,
                    data.canvas.toDataURL('image/png'),
                    '.png',
                    {
                        logo: {
                            style: data.logoGeneratorPreview.logoGenerator.logo.style,
                            text: data.logoGeneratorPreview.logoGenerator.logo.text,
                            font: data.logoGeneratorPreview.logoGenerator.logo.font,
                        },
                        slogan: {
                            style: data.logoGeneratorPreview.logoGenerator.slogan.style,
                            text: data.logoGeneratorPreview.logoGenerator.slogan.text,
                            font: data.logoGeneratorPreview.logoGenerator.slogan.font,
                            marginValue: data.logoGeneratorPreview.logoGenerator.slogan.marginValue,
                        },
                        isUseSlogan: data.logoGeneratorPreview.logoGenerator.isUseSlogan,
                        type: data.logoGeneratorPreview.type,
                    },
                    params,
                ))
                .then((data) => $timeout(() => {
                    logoGeneratorService.updateLogoSrc(logoGeneratorId, data.ImgSource);
                    if (successFn) {
                        successFn({src: data.ImgSource});
                    }
                    ctrl.close(logoGeneratorId);
                }, 0))
                .catch((error) => {
                    // eslint-disable-next-line no-console
                    console.error(`Error on generate logo: ${error}`);
                })
                .finally(() => {
                    ctrl.savingLogo = false;
                });
        }, 400);
    };

    ctrl.close = function (logoGeneratorId) {
        logoGeneratorService.closeModal(logoGeneratorId);
        urlHelper.setLocationQueryParams('logoGeneratorEditOnPageLoad', undefined);
        //urlHelper.setLocationQueryParams('tab', undefined);
    };

    ctrl.callbackClose = function (logoGeneratorId) {
        logoGeneratorService.setActivity(logoGeneratorId, false);
        urlHelper.setLocationQueryParams('logoGeneratorEditOnPageLoad', undefined);
    };
}

export default LogoGeneratorModalCtrl;
