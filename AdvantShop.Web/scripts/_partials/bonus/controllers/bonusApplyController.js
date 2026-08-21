/* @ngInject */
function BonusApplyCtrl($timeout) {
    const ctrl = this;
    let timerRange;

    ctrl.$onInit = function () {
        ctrl.isApply = ctrl.appliedBonuses > 0;
        if (ctrl.prohibitAccrualAndSubstract) {
            if (ctrl.appliedBonuses > 0) ctrl.bonusOperationType = 'substractBonus';
            else ctrl.bonusOperationType = 'addBonus';
            // ctrl.changeBonusOperationType(ctrl.appliedBonuses > 0 ? 'substractBonus' : 'addBonus');
        }
    };

    ctrl.rangeSliderMove = function (event, modelMin, modelMax) {
        ctrl.sendChangeBonus(modelMax);
    };

    ctrl.sendChangeBonus = function (appliedBonuses) {
        if (!appliedBonuses) appliedBonuses = 0;
        if (timerRange != null) {
            $timeout.cancel(timerRange);
        }

        timerRange = $timeout(() => {
            ctrl.changeBonus({ appliedBonuses });
        }, 500);
    };

    ctrl.applyBonus = function () {
        if (ctrl.isApply) ctrl.appliedBonuses = ctrl.maxBonus;
        else ctrl.appliedBonuses = 0;
        ctrl.changeBonus({ appliedBonuses: ctrl.appliedBonuses });
    };

    ctrl.changeBonusOperationType = function (type) {
        ctrl.bonusOperationType = type;
        if (type === 'addBonus') {
            ctrl.appliedBonuses = 0;
        } else {
            ctrl.appliedBonuses = ctrl.maxBonus;
        }
        ctrl.changeBonus({ appliedBonuses: ctrl.appliedBonuses });
    };
}

export default BonusApplyCtrl;
