import './styles.scss';
import {translate} from "angular";

const MODULE_NAME = "filterSidebar";

interface IFilterSidebarController {
    toggleFilter: () => void;
}


class FilterSidebarController implements IFilterSidebarController {
    /* @ngInject */
    constructor(private readonly sidebarsContainerService,
                private readonly $translate: translate.ITranslateService) {
    }

    toggleFilter() {
        this.sidebarsContainerService.toggle({
            contentId: 'sidebarFilter',
            templateUrl: 'sidebarFilter',
            hideFooter: true,
            sidebarClass: `sidebar--filter`,
            title: this.$translate.instant('Js.CatalogFilter.Filters')
        });
    };
}

angular.module(MODULE_NAME, [])
    .controller('FilterSidebarController', FilterSidebarController)

export default MODULE_NAME
