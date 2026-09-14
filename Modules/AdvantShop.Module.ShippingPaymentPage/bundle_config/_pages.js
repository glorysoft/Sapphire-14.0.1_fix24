import PagesStorage from '../../../node_scripts/pagesStorage.js';
import { getDirname} from "../../../node_scripts/shopPath.js";
const __dirname = getDirname(import.meta.url);
let obj = new PagesStorage();

obj.addItem('shippingPaymentPage', __dirname + '/shippingPaymentPage.js', 'shipping-payment', true);

export default obj;