import { ITabContentController } from './tabContentController';

export interface ITabHeaderController {
    id: string;
    selected: boolean;
    isRender: boolean;
    headerTab: string;
    content?: ITabContentController;
}
export class TabHeaderCtrl implements ITabHeaderController {
    id = '';
    selected = false;
    isRender = true;
    headerTab = '';
    content?: ITabContentController;
}
