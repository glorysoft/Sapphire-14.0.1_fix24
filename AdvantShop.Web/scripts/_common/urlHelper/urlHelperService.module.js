import { config } from './urlHelper.config.js';
import { urlHelperService } from './urlHelperService.js';
import { toAnchor } from './urlHelper.filter.js';

const MODULE_NAME = 'urlHelper';

angular.module(MODULE_NAME, []).constant(`urlHelperConfig`, config).service(`urlHelper`, urlHelperService).filter('toAnchor', toAnchor);

export default MODULE_NAME;
