import { StickyElement } from './directives/stickyElementDirective';
import StickyElementService from './services/stickyElementService';
import './styles/stickyElementDirective.scss';

const moduleName = `stickyElement`;

angular.module(`stickyElement`, []).service(`stickyElementService`, StickyElementService).directive(`stickyElement`, StickyElement);

export default moduleName;
