import appDependency from '../../../../../scripts/appDependency.js';

import '../Content/styles/_shared/color-picker/color-picker.scss';

import 'tinycolor2';
import '../../../Content/vendors/angular-color-picker/angularjs-color-picker.cjs';
import '../../../Content/vendors/angular-color-picker/angularjs-color-picker.css';
import '../../../Content/vendors/angular-color-picker/themes/angularjs-color-picker-bootstrap.css';

import '../../../Content/src/carousel/carousel.js';
import '../../../Content/src/carousel/modal/addEditCarousel/ModalAddEditCarouselCtrl.js';
appDependency.addItem(`carouselPage`);

import 'ng-file-upload';
import '../../../Content/src/_shared/picture-uploader/pictureUploader.js';
import '../../../Content/src/_shared/picture-uploader/pictureUploader.component.js';
import '../Content/styles/_shared/picture-uploader/picture-uploader.scss';
import '../../../Content/src/_shared/picture-uploader/modal/pictureUploaderModal.js';

appDependency.addItem('pictureUploader');

import '../../../Content/src/_partials/video-file-uploader/videoFileUploader.js'
appDependency.addItem('videoFileUploader');

import '../Content/styles/_shared/card/card.scss';
import '../Content/styles/views/settings.scss';
