import { IController } from 'angular';
import { IPointMap } from '../types';

type OnBackToListType = () => void;
type OnClickPointType = ({ point, index }: { point: IPointMap; index: number }) => void;
type OnInitPointType = ({ pointsListCtrl }: { pointsListCtrl: IController }) => Promise<void>;

export default class PointsListCtrl implements IController {
    activePoint = null;
    onBackToList: null | OnBackToListType = null;
    onClickPoint: OnClickPointType | null = null;
    onSelect: (({ point }: { point: IPointMap }) => void) | undefined;
    onInit?: OnInitPointType;
    isShowPlug = false;
    asyncInit?: boolean;
    constructor() {}

    $onInit = () => {
        if (this.asyncInit) {
            this.showPlug();
            this.onInit &&
                this.onInit({ pointsListCtrl: this }).then(() => {
                    this.hidePlug();
                });
        } else {
            this.onInit && this.onInit({ pointsListCtrl: this });
        }
    };

    backToList = () => {
        this.activePoint = null;
        if (this.onBackToList) {
            this.onBackToList();
        }
    };

    handleClickPoint = (point: IPointMap, index: number) => {
        if (this.onClickPoint) {
            this.onClickPoint({ point, index });
        }
    };
    handleSelect = (point: IPointMap) => {
        if (this.onSelect) {
            this.onSelect({ point });
        }
    };

    showPlug = () => {
        this.isShowPlug = true;
    };

    hidePlug = () => {
        this.isShowPlug = false;
    };
}
