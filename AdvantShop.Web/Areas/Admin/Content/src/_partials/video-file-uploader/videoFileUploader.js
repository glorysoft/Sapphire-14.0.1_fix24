import './style/style.scss';
import VideoFileUploaderCtrl from './videoFileUploader.ctrl.js';
import { videoFileUploader } from './videoFileUploader.directive.js';

const moduleName = 'videoFileUploader';

angular
    .module(moduleName, [])
    .controller('VideoFileUploaderCtrl', VideoFileUploaderCtrl)
    .directive('videoFileUploader', videoFileUploader);

export default moduleName;
