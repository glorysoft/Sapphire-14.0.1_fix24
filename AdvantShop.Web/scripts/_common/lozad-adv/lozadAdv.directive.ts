import {IAttributes, IDirectiveFactory, IScope} from "angular";
import {ILozadAdvCtrl} from "./lozadAdv.ctrl";

type LozadAdvDirective = IDirectiveFactory<IScope, JQLite, IAttributes, ILozadAdvCtrl>

const lozadAdv: LozadAdvDirective = function () {
    return {
        controller: 'LozadAdvCtrl',
        bindToController: true,
        controllerAs: 'lozadAdv',
        scope: true,
    };
}

export default lozadAdv
