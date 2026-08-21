export interface ITabContentController {
    isRender: boolean;
    headerId: string;
}
export class TabContentCtrl implements ITabContentController {
    isRender = true;
    headerId = '';
}
