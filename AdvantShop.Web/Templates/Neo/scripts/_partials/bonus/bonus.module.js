import bonusInfoTemplate from './templates/info.html';
import './styles/bonusInfo.scss';

const MODULE_NAME = 'bonus';
try {
  angular.module(MODULE_NAME)
    .config([`$provide`, function($provide) {
      $provide.decorator(`bonusInfoDirective`, [`$delegate`, function($delegate) {
        const directive = $delegate[0];
        directive.templateUrl = bonusInfoTemplate;
        return $delegate;
      }]);

    }]);
} catch (e) {

}
export default MODULE_NAME;
