import codeTemplate from '../templates/code.html';
import infoTemplate from '../templates/info.html';
import applyTemplate from '../templates/apply.html';
import authTemplate from '../templates/auth.html';
import whatToDoTemplate from '../templates/whatToDo.html';
function bonusWhatToDoDirective() {
    return {
        restrict: 'A',
        scope: {
            page: '@',
            autorizeBonus: '&',
            changeBonus: '&',
            email: '=',
            city: '=',
            outsideName: '=?',
            outsideSurname: '=?',
            outsidePhone: '=?',
            outsidePatronymic: '=?',
            isShowPatronymic: '&',
            appliedBonuses: '<?',
            bonusPlus: '@',
            allowSpecifyBonusAmount: '=',
            prohibitAccrualAndSubstract: '=',
        },
        controller: 'BonusWhatToDoCtrl',
        controllerAs: 'bonusWhatToDo',
        bindToController: true,
        replace: true,
        templateUrl: whatToDoTemplate,
    };
}

function bonusAuthDirective() {
    return {
        restrict: 'A',
        scope: {
            page: '=',
            callbackSuccess: '&',
            outsidePhone: '=?',
            enablePhoneMask: '<?',
        },
        controller: 'BonusAuthCtrl',
        controllerAs: 'bonusAuth',
        bindToController: true,
        replace: true,
        templateUrl: authTemplate,
    };
}

function bonusApplyDirective() {
    return {
        restrict: 'A',
        replace: true,
        scope: {
            applyText: '=',
            bonusText: '=',
            changeBonus: '&',
            maxBonus: '=',
            appliedBonuses: '=',
            allowSpecifyBonusAmount: '=',
            prohibitAccrualAndSubstract: '=',
            bonusPlus: '=',
            rangeSliderStep: '='
        },
        controller: 'BonusApplyCtrl',
        controllerAs: 'bonusApply',
        bindToController: true,
        templateUrl: applyTemplate,
    };
}

function bonusInfoDirective() {
    return {
        restrict: 'A',
        replace: true,
        scope: {
            bonusData: '=',
            isShowPatronymic: '=',
        },
        controller: 'BonusInfoCtrl',
        controllerAs: 'bonusInfo',
        bindToController: true,
        templateUrl: infoTemplate,
    };
}

function bonusCodeDirective() {
    return {
        restrict: 'A',
        replace: true,
        scope: {},
        controller: 'BonusCodeCtrl',
        controllerAs: 'bonusCode',
        bindToController: true,
        templateUrl: codeTemplate,
    };
}

export { bonusWhatToDoDirective, bonusAuthDirective, bonusApplyDirective, bonusInfoDirective, bonusCodeDirective };
