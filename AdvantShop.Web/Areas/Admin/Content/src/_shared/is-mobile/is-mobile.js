const isMobile = document.documentElement.classList.contains('mobile-version');

class IsMobileController {
    $onInit() {
        this.value = isMobile;
    }
}

class IsMobileDirective {
    constructor() {
        this.priority = 10;
        this.scope = false;
        this.controllerAs = `isMobile`;
        this.controller = IsMobileController;
        this.bindToController = true;
    }
}

export class IsMobileService {
    getValue() {
        return isMobile;
    }
    getHeuristicValue() {
        // Проверка на поддержку тач-событий или наличие нескольких touchpoints
        const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        // Проверка на маленький экран или мобильную ориентацию
        const isMobileSize = window.matchMedia('(max-width: 768px)').matches || window.matchMedia('(orientation: portrait)').matches;

        // Можно добавить проверку User Agent, но с осторожностью
        const isMobileUA = /Mobi|Android|iPhone|iPad|iPod|Windows Phone/iu.test(navigator.userAgent);

        return hasTouch && (isMobileSize || isMobileUA);
    }
}

angular
    .module('isMobile', [])
    .service('isMobileService', IsMobileService)
    .directive('isMobile', () => new IsMobileDirective());
