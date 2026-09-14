import './styles/catalogFilter.scss';
import catalogFilterNeo from './templates/catalogFilterNeo.html';

const moduleName = 'catalogFilter';

try {
  angular
    .module(moduleName)
    .config(
      /* @ngInject */
      function($provide) {
        $provide.decorator(`catalogFilterDirective`, /* @ngInject */ function($delegate) {
          const directive = $delegate[0];
          directive.templateUrl = catalogFilterNeo;
          return $delegate;
        });
      });
}catch (_){}


export default moduleName;
