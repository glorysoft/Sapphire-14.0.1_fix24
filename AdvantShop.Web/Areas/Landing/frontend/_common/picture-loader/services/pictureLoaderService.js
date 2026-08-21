(function (ng) {


    const MODAL_ID = 'modalPictureLoader';

    const pictureLoaderService = function ($http, $q, modalService, Upload, toaster, galleryCloudService, galleryIconsService) {
        const service = this;

        service.openModal = function (params, onInit, onApply) {
            const deletePicture = params.deletePicture === true ? ' delete-picture="true" ' : '';

            const alllowChangeSize = params.alllowChangeSize != null ? `alllow-change-size="${params.alllowChangeSize}"` : '';
            const parentData = {
                modalData: params,
                onInit,
                onApply,
            };

            modalService.renderModal(
                MODAL_ID,
                params.current != null ? '{{\'Admin.Js.Landings.PictureLoaderService.RefreshImage\'|translate}}' : '{{\'Admin.Js.Landings.PictureLoaderService.UploadImage\'|translate}}',
                `<picture-loader cropper-params="modalData.cropperParams" lp-id="modalData.lpId" block-id="modalData.blockId" ` +
                    `on-init="onInit(pictureLoader)" ` +
                    `on-upload-file="modalData.onUploadFile(result)" ` +
                    `on-upload-by-url="modalData.onUploadByUrl(result)" ` +
                    `on-upload-icon="modalData.onUploadIcon(result)" ` +
                    `on-delete="modalData.onDelete(result)" ` +
                    `on-change-state="modalData.onChangeState(state, pictureLoader)"` +
                    `on-resize="modalData.onResize(result)"${
                    deletePicture
                    }${alllowChangeSize
                    }current="modalData.current" type="modalData.type" upload-url-file="modalData.uploadUrlFile" upload-url-by-address="modalData.uploadUrlByAddress" delete-url="modalData.deleteUrl" max-width-picture="modalData.maxWidthPicture" max-width="modalData.maxWidth" max-height="modalData.maxHeight" max-height-picture="modalData.maxHeightPicture" parameters="modalData.parameters"` +
                    `use-external-save="modalData.useExternalSave" external-save="modalData.externalSave(pictureLoader, saveFn, base64String)"` +
                    `lazy-load-enabled="modalData.lazyLoadEnabled" on-lazy-load-change="modalData.onLazyLoadChange(result)"` +
                    `gallery-icons-enabled="${
                    params.galleryIconsEnabled
                    }" no-photo="modalData.noPhoto" width-picture="modalData.widthPicture" height-picture="modalData.heightPicture"></picture-loader>`,
                '<div class="text-left"><button type="button" type="button" class="blocks-constructor-btn-confirm"  modal-close="" data-e2e="SaveCroperBtn" modal-close-callback="onApply()">{{\'Js.Landings.PictureLoader.PictureLoaderService.Apply\'|translate}}</button></div>',
                { destroyOnClose: true, modalClass: 'picture-upload-modal', appendModalClass: '', isShowFooter: false },
                parentData,
            );

            modalService.getModal(MODAL_ID).then((modal) => {
                modal.modalScope.open();
            });
        };

        service.showGalleryCloud = function (callback) {
            galleryCloudService.showModal({ onSelect: callback });
        };

        service.showGalleryIcons = function (callback) {
            galleryIconsService.showModal({ onSelect: callback });
        };

        service.setVisibleFooter = function (visibility) {
            modalService.setVisibleFooter(MODAL_ID, visibility);
        };

        service.closeModal = function () {
            modalService.close(MODAL_ID);
        };

        service.uploadFile = function (lpId, blockId, maxWidth, maxHeight, parameters, $file, uploadUrlFile, current) {
            const data = {
                lpId,
                blockId,
                maxWidth,
                maxHeight,
                parameters,
            };

            if (current != null) {
                data.picture = current;
            }

            return Upload.upload({
                url: uploadUrlFile,
                data,
                file: $file,
            }).then((response) => response.data);
        };

        service.uploadByUrl = function (lpId, blockId, maxWidth, maxHeight, parameters, url, uploadUrlByAddress, current) {
            const data = {
                lpId,
                blockId,
                maxWidth,
                maxHeight,
                parameters,
                url,
            };

            if (current != null) {
                data.picture = current;
            }

            return Upload.upload({
                url: uploadUrlByAddress,
                data,
            }).then((response) => response.data);
        };

        service.uploadCropped = function (lpId, blockId, maxWidth, maxHeight, parameters, base64String, ext, uploadUrlCropped, current) {
            const data = {
                lpId,
                blockId,
                maxWidth,
                maxHeight,
                parameters,
                base64String,
                ext,
            };

            if (current != null) {
                data.picture = current;
            }

            return Upload.upload({
                url: uploadUrlCropped,
                data,
            }).then((response) => response.data);
        };

        service.resize = function (lpId, blockId, maxWidth, maxHeight, parameters, resizeUrl, current) {
            const data = {
                lpId,
                blockId,
                maxWidth,
                maxHeight,
                parameters,
            };

            if (current != null) {
                data.picture = current;
            }

            return Upload.upload({
                url: resizeUrl,
                data,
            }).then((response) => response.data);
        };

        service.delete = function (lpId, blockId, picture, parameters, deleteUrl) {
            const data = { lpId, blockId, picture, parameters };

            return Upload.upload({
                url: deleteUrl,
                data,
            }).then((response) => response.data);
        };

        service.getBase64PictureByUrl = function (url) {
            return $http.post('landinginplace/getBase64PictureByUrl', { url }).then((response) => response.data);
        };

        service.getExt = function (filename) {
            return `.${  filename.split('.').pop().split('?').shift()}`;
        };

        service.getPictureType = function (original, postfix) {
            if (original == null) {
                return null;
            }

            const array = original.split('/');
            const dir = array.slice(0, array.length - 1).join('/');
            const filename = array[array.length - 1];
            const ext = service.getExt(filename);
            const name = filename.replace(ext, '');

            return `${dir  }/${  name  }_${  postfix  }${ext}`;
        };

        service.getFileName = function (path) {
            const parts = path.split(`/`);
            return parts[parts.length - 1].split('?')[0];
        };
    };

    ng.module('pictureLoader').service('pictureLoaderService', pictureLoaderService);

    pictureLoaderService.$inject = ['$http', '$q', 'modalService', 'Upload', 'toaster', 'galleryCloudService', 'galleryIconsService'];
})(window.angular);
