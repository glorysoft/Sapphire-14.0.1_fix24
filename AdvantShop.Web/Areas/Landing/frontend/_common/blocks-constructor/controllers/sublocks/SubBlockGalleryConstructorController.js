(function (ng) {
    

    const SubBlockGalleryConstructorCtrl = function (blocksConstructorService, pictureLoaderService, toaster) {
        const ctrl = this;

        ctrl.onUploadPictureSubblock = function (item, result) {
            return ng.extend(item, blocksConstructorService.mapPictureField(item, result));
        };

        ctrl.onUploadPicture = function (items, result, index) {
            const isNew = items[index] == null;
            const itemUpdated = ng.extend(items[index] || {}, blocksConstructorService.updatePictureFields(items[index], result));

            if (isNew === true) {
                items.push(itemUpdated);
            }

            return itemUpdated;
        };

        ctrl.onResizePictureSubblock = function (item, result) {
            return ng.extend(item, result);
        };

        ctrl.onResizePicture = function (items, result, index) {
            const { picture, width, height } = result;
            if (items != null && items.length > 0 && items[index] != null) {
                items[index] = ng.extend(items[index], blocksConstructorService.updatePictureFields(items[index], result, `image`));
                blocksConstructorService.saveBlockSettings(ctrl.blockId, ctrl.data);
            }
        };

        ctrl.delete = function (lpId, blockId, picture, parameters, deleteUrl, items, index) {
            pictureLoaderService
                .delete(lpId, blockId, picture, parameters, deleteUrl)
                .then(() => {
                    items.splice(index, 1);
                })
                .catch(() => {
                    toaster.pop('error', 'Ошибка при удалении изображения');
                });
        };
    };

    ng.module('blocksConstructor').controller('SubBlockGalleryConstructorCtrl', SubBlockGalleryConstructorCtrl);

    SubBlockGalleryConstructorCtrl.$inject = ['blocksConstructorService', 'pictureLoaderService', 'toaster'];
})(window.angular);
