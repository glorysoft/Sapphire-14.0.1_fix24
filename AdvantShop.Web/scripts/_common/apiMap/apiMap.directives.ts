import type { IApiMapService } from './apiMap.service';
import type { IDirective } from 'angular';

/* @ngInject */
export function apiMapKeyDirective(apiMapService: IApiMapService): IDirective {
    return {
        scope: {
            mapApiKey: '@',
        },
        link(scope, element, attrs) {
            if (attrs.mapApiKey) {
                if (!apiMapService.getMapApiKey()) {
                    apiMapService.setMapApiKey(attrs.mapApiKey);
                }
            }
        },
    };
}
apiMapKeyDirective.$inject = ['apiMapService'];
