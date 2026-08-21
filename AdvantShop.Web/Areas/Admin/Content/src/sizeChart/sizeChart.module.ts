import SizeChartController from './controllers/sizeChart.controller';
import SizeChartService from './sizeChart.service';
import ModalAddEditSizeChartCtrl from './controllers/addEditSizeChart.modal.controller';
import ModalAddSizeChartPropertyCtrl from './controllers/addSizeChartProperty.modal.controller';

import './styles.scss';
import './templates/addEditSizeChart.modal.template.html';
import './templates/addSizeChartProperty.modal.template.html';

const moduleName = 'sizeChart';

angular
    .module(moduleName, [])
    .service('sizeChartService', SizeChartService)
    .controller('SizeChartCtrl', SizeChartController)
    .controller('ModalAddEditSizeChartCtrl', ModalAddEditSizeChartCtrl)
    .controller('ModalAddSizeChartPropertyCtrl', ModalAddSizeChartPropertyCtrl);

export default moduleName;
