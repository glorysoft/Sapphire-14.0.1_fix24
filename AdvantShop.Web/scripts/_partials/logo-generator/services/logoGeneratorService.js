/*@ngInject*/
function logoGeneratorService($controller, $http, $q, $window, modalService, $cookies) {
    // eslint-disable-next-line no-invalid-this
    const service = this,
        theme = $cookies.get('userTheme'),
        localStorageKey = theme === 'dark-theme' ? 'logoGeneratorDarkTheme' : 'logoGenerator',
        storage = {},
        listWait = {},
        emptySymbol = '🞎',
        regexLatin = /[a-zA-Z]+/gu,
        regexCyrilic = /'[а-яА-Я]+/gu;


    const oldStorageValue = localStorage.getItem(localStorageKey);

    if(oldStorageValue){
        localStorage.setItem(`${localStorageKey}_general`, oldStorageValue);
        localStorage.removeItem(localStorageKey);
    }

    service.addLogoGenerator = function (logoGeneratorId, logoGenerator) {
        if (!logoGeneratorId || logoGeneratorId.length === 0) {
            throw Error('logoGeneratorId is required parameter');
        }

        storage[logoGeneratorId].logoGenerator = logoGenerator;

        if (listWait[logoGeneratorId]) {
            listWait[logoGeneratorId].forEach((callback) => {
                callback(storage[logoGeneratorId].logoGenerator);
            });
        }

        return storage[logoGeneratorId].logoGenerator;
    };

    service.getLogoGenerator = function (logoGeneratorId, callback) {
        if (storage[logoGeneratorId] && storage[logoGeneratorId].logoGenerator) {
            callback(storage[logoGeneratorId].logoGenerator);
        } else {
            listWait[logoGeneratorId] ||= [];

            listWait[logoGeneratorId].push(callback);
        }
    };

    service.addLogoGeneratorPreview = function (logoGeneratorId, logoGeneratorPreview) {
        storage[logoGeneratorId] ||= {};

        if (!storage[logoGeneratorId].preview) {
            storage[logoGeneratorId].preview = logoGeneratorPreview;
        }

        return storage[logoGeneratorId].preview;
    };

    service.getLogoGeneratorPreview = function (logoGeneratorId) {
        return $q.when(storage[logoGeneratorId].preview);
    };

    service.showModal = function (logoGeneratorId, urlSave, params, successFn, logoGeneratorFontsOptions, logoGeneratorOptions) {
        const modalId = `${logoGeneratorId  }Modal`;

        storage[logoGeneratorId] ||= {};

        modalService.renderModal(
            modalId,
            '{{\'Js.LogoGenerator.LogoGeneration\'|translate}}',
            `<logo-generator logo-generator-id="${
                logoGeneratorId
                }" logo-generator-fonts-options="logoGeneratorFontsOptions" logo-generator-options="logoGeneratorOptions"></logo-generator>`,
            `<div><button type="button" data-ladda="logoGeneratorModal.savingLogo" class="logo-generator-modal-btn-save btn btn-small btn-submit btn--xs" data-ng-click='logoGeneratorModal.save("${
                logoGeneratorId
                }", "${
                urlSave
                }", ${
                JSON.stringify(params || {})
                }, successFn)'>{{'Js.LogoGenerator.SaveLogo'|translate}}</button> <button type="button" data-ng-click='logoGeneratorModal.close("${
                logoGeneratorId
                }")' class="logo-generator-modal-btn-close btn btn-small btn-action btn--xs">{{\'Js.LogoGenerator.Cancel\'|translate}}</button></div>`,
            {
                backgroundEnable: false,
                isFloating: true,
                modalOverlayClass: 'logo-generator-modal',
                isOpen: true,
                callbackClose: `logoGeneratorModal.callbackClose('${  logoGeneratorId  }')`,
                destroyOnClose: true
            },
            {
                logoGeneratorModal: $controller('LogoGeneratorModalCtrl'),
                successFn,
                logoGeneratorFontsOptions,
                logoGeneratorOptions,
            },
        );

        service.setActivity(logoGeneratorId, true);
    };

    service.showSubModal = function (type, parentCtrl) {
        let modalId;
        if (type === 'logo') {
            modalId = 'modalLogoGeneratorLogoFonts';
            modalService.renderModal(
                modalId,
                '{{\'Js.LogoGenerator.ChoosingLogoFont\'|translate}}',
                '<logo-generator-fonts data-ng-if="modal.isOpen" data-on-select="$ctrl.onSelectLogoFont(font)" data-fonts-list="$ctrl.fonts.items" data-logo="$ctrl.logo" data-slogan="$ctrl.slogan" data-is-use-slogan="$ctrl.isUseSlogan" data-language="$ctrl.logoLanguage" data-obj-type="logo" data-options="$ctrl.logoGeneratorFontsOptions"></logo-generator-fonts>',
                null,
                { isFloating: true, destroyOnClose: true, modalOverlayClass: 'modal-logo-generator-fonts' },
                { $ctrl: parentCtrl },
            );
        } else if (type === 'slogan') {
            modalId = 'modalLogoGeneratorSloganFonts';
            modalService.renderModal(
                modalId,
                '{{\'Js.LogoGenerator.ChoosingSloganFont\'|translate}}',
                '<logo-generator-fonts data-ng-if="modal.isOpen" data-on-select="$ctrl.onSelectSlogonFont(font)" data-fonts-list="$ctrl.fonts.items" data-logo="$ctrl.logo" data-slogan="$ctrl.slogan" data-is-use-slogan="$ctrl.isUseSlogan" data-language="$ctrl.sloganLanguage" data-obj-type="slogan" data-options="$ctrl.logoGeneratorFontsOptions"></logo-generator-fonts>',
                null,
                { isFloating: true, destroyOnClose: true, modalOverlayClass: 'modal-logo-generator-fonts' },
                { $ctrl: parentCtrl },
            );
        }

        modalService.getModal(modalId).then((modal) => {
            modal.modalScope.open(true);
        });
    };

    service.closeModal = function (logoGeneratorId) {
        const modalId = `${logoGeneratorId  }Modal`;
        service.setActivity(logoGeneratorId, false);
        modalService.close(modalId);
    };

    service.getFontsList = function () {
        return import(
            /* webpackChunkName: "logoGeneratorFonts" */
            /* webpackMode: "lazy" */
            '../fonts/data.json'
        ).then((module) => module.default);
    };

    service.saveLogo = function (urlSave, dataUrl, fileExtension, options, params) {
        //'logogenerator/savelogo'
        return $http
            .post(urlSave, angular.extend({ dataUrl, fileExtension, fontFamilyLogo: options.logo.font.fontFamily, isAlternative: options.type === 'alternative' }, params))
            .then((response) => response.data)
            .then((data) => {
                service.saveData(options);
                return data;
            })
    };

    service.getKey = function (type) {
        return localStorageKey + (type ? `_${type}` : '');
    }

    service.saveData = function (data) {
        $window.localStorage.setItem(service.getKey(data.type), JSON.stringify(data));
    };

    service.getDataFromStorage = function (type) {
        const valueString = $window.localStorage.getItem(service.getKey(type));

        return valueString?.length > 0 ? JSON.parse(valueString) : null;
    };

    service.getData = function (type) {
        return $q.when(
            service.getDataFromStorage(type) ||
                $http.get('logogenerator/getdata').then((response) => response.data),
        );
    };

    service.setActivity = function (logoGeneratorId, isActive) {
        return service.getLogoGenerator(logoGeneratorId, (logoGenerator) => (logoGenerator.isActive = isActive));
    };

    service.updateLogoSrc = function (logoGeneratorId, src) {
        storage[logoGeneratorId].preview.img.setAttribute('src', src);
    };

    service.parseLanguage = function (text) {
        const result = [];

        if (regexCyrilic.test(text)) {
            result.push('cyrillic');
        }

        if (regexLatin.test(text)) {
            result.push('latin');
        }

        return result;
    };

    service.isCyrillic = function (text) {
        return service.parseLanguage(text).indexOf('cyrillic') !== -1;
    };

    service.isLatin = function (text) {
        return service.parseLanguage(text).indexOf('latin') !== -1;
    };

    service.replaceUnsupportOnSymbol = function (text, language) {
        return text.replace(language === 'cyrillic' ? regexCyrilic : regexLatin, emptySymbol);
    };

    service.fontFamilyEscape = function (fontFamily) {
        //шрифты, у которых в наименовании есть числа не вставляются в стили, надо обязательно обернуть в кавычки
        return /\d/u.test(fontFamily) ? `"${  fontFamily  }"` : fontFamily;
    };
}

export default logoGeneratorService;
