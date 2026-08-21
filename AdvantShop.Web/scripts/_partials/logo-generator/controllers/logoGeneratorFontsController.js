function LogoGeneratorFontsCtrl() {
    const ctrl = this;

    ctrl.selectFont = function (font) {
        if (ctrl.onSelect != null) {
            ctrl.onSelect({ font });
        }
    };

    ctrl.getStyle = function (style, font, objType, currentType) {
        const _style = angular.copy(style);

        if (objType === currentType) {
            //шрифты, у которых в наименовании есть числа не вставляются в стили, надо обязательно обернуть в кавычки
            _style.fontFamily = /\d/.test(font.fontFamily) ? `"${  font.fontFamily  }"` : font.fontFamily;
        }

        return _style;
    };
}

export default LogoGeneratorFontsCtrl;
