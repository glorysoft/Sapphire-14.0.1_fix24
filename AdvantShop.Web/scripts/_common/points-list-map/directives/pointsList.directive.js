import pointsListTemplate from '../templates/pointsList.html';

export default function PointsListDirective() {
    return {
        scope: {
            points: '<',
            onClickPoint: '&',
            activePoint: '=',
            showDetailsPoint: '<?',
            onlyActivePoint: '<?',
            onBackToList: '&',
            isSelect: '<?',
            onSelect: '&',
            onInit: '&',
            asyncInit: '<?' /*если нужно подождать инициализацию на onInit надо вернуть promise*/,
        },
        bindToController: true,
        controller: 'pointsListCtrl',
        controllerAs: '$ctrl',
        templateUrl: pointsListTemplate,
    };
}
