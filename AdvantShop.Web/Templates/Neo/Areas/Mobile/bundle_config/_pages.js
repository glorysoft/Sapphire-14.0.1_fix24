import PagesStorage from '../../../../../node_scripts/pagesStorage.js';

import { getDirname} from "../../../../../node_scripts/shopPath.js";

 const __dirname = getDirname(import.meta.url);

let pages = new PagesStorage();

pages.addItem('commonTemplate', __dirname + '/commonTemplate.js');
pages.addItem('checkOrder', __dirname + '/checkOrder.js');
pages.addItem('compareExtend', __dirname + '/compareExtend.js')

export default pages;
