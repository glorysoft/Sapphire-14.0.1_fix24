(function (ng) {


    const blocksConstructorService = function ($http, $translate, $q, $filter) {
        let service = this,
            blockMain,
            blockContainersStorage = {},
            blockContainersDeferStorage = {},
            colorSchemeList = [
                {
                    name: $translate.instant('Admin.Js.Landings.BlocksConstructor.BlocksConstructorService.Light'),
                    value: 'color-scheme--light',
                },
                {
                    name: $translate.instant('Admin.Js.Landings.BlocksConstructor.BlocksConstructorService.Medium'),
                    value: 'color-scheme--medium',
                },
                {
                    name: $translate.instant('Admin.Js.Landings.BlocksConstructor.BlocksConstructorService.Dark'),
                    value: 'color-scheme--dark',
                },
                {
                    name: $translate.instant('Admin.Js.Landings.BlocksConstructor.BlocksConstructorService.Custom'),
                    value: 'color-scheme--custom',
                },
            ];

        service.getBlocks = function (landingPageId) {
            return $http.get('landinginplace/getblocks', { params: { landingPageId } }).then((response) => response.data);
        };

        service.addBlock = function (lpId, name, sortOrder, productId, top, blockIdSibling) {
            return $http
                .post('landinginplace/addblock', {
                    lpId,
                    name,
                    sortOrder,
                    productId,
                    top,
                    blockIdSibling,
                })
                .then((response) => response.data);
        };

        service.addListBlock = function (lpId, blocks, sortOrder, productId, top, blockIdSibling) {
            return $http
                .post('landinginplace/addAllBlocksByCategory', {
                    lpId,
                    blocks,
                    sortOrder,
                    productId,
                    top,
                    blockIdSibling,
                })
                .then((response) => response.data);
        };

        service.saveBlockSortOrder = function (blockId, top) {
            return $http.post('landinginplace/saveblocksortorder', { blockId, top }).then((response) => response.data);
        };

        service.getBlockData = function (blockId) {
            return $http.get('landinginplace/GetBlockSettings', { params: { blockId, rnd: Math.random() } }).then((response) => response.data);
        };

        service.saveProductsIds = function (blockId, ids) {
            return $http.post('/landinginplace/saveproductids', { blockId, ids }).then((response) => response.data);
        };

        service.saveBlockSettings = function (blockId, settings) {
            return $http.post('landinginplace/saveblockSettings', { blockId, settings: JSON.stringify(settings) }).then((response) => response.data);
        };

        service.removeBlock = function (blockId) {
            return $http.post('landinginplace/removeblock', { blockId }).then((response) => response.data);
        };

        service.removeAllBlockByCategory = function (lpId, category) {
            return $http.post('landinginplace/removeAllBlockByCategory', { lpId, category }).then((response) => response.data);
        };

        service.getColorSchemeList = function () {
            return colorSchemeList;
        };

        service.createFormHidden = function (lpId) {
            return $http.post('landinginplace/createFormHidden', { lpId }).then((response) => response.data);
        };

        service.saveMain = function (blockConstructorMain) {
            blockMain = blockConstructorMain;
        };

        service.getMain = function () {
            return blockMain;
        };

        service.activateSelectMode = function () {
            return blockMain.activateSelectMode();
        };

        service.deactivateSelectMode = function () {
            return blockMain.deactivateSelectMode();
        };

        service.enabledSelectMode = function () {
            return blockMain.enabledSelectMode;
        };

        service.getIndexSubblockByName = function (subblockList, name) {
            let index;

            for (let i = 0, len = subblockList.length; i < len; i++) {
                if (name === subblockList[i].Name) {
                    index = i;
                    break;
                }
            }

            //if (index == null) {
            //    subblockList.push({ Name: name });
            //    index = subblockList.length - 1;
            //}

            return index;
        };

        service.convertToHtmlBlock = function (blockId) {
            return $http.post('landinginplace/convertToHtmlBlock', { blockId }).then((response) => response.data);
        };

        service.copyBlock = function (blockId) {
            return $http.post('landinginplace/copyBlock', { blockId }).then((response) => response.data);
        };

        service.tryUpdatelBlock = function (blockId) {
            return $http.post('landinginplace/tryUpdateBlock', { blockId }).then((response) => response.data);
        };

        service.recreateBlock = function (blockId) {
            return $http.post('landinginplace/recreateBlock', { blockId }).then((response) => response.data);
        };

        service.addBlockConstructorContainer = function (blockId, blockConstructorContainer) {
            blockContainersStorage[blockId] = blockConstructorContainer;

            if (blockContainersDeferStorage[blockId] != null) {
                blockContainersDeferStorage[blockId].resolve(blockConstructorContainer);
                delete blockContainersDeferStorage[blockId];
            }
        };

        service.getBlockConstructorContainer = function (blockId) {
            if (blockContainersStorage[blockId] != null) {
                return $q.resolve(blockContainersStorage[blockId]);
            }
                blockContainersDeferStorage[blockId] = blockContainersDeferStorage[blockId] || $q.defer();

                return blockContainersDeferStorage[blockId].promise;

        };

        service.updatePictureFields = function (item, data, pictureType) {
            pictureType ||= 'picture';
            const defaultValue = {};
            defaultValue[pictureType] = { src: null };

            item = $filter('blocksConstructorPictureAsObj')(item, pictureType) || defaultValue;

            item[pictureType] = service.mapPictureField(item[pictureType], data);

            if (data.width != null && data.width > 0) {
                item[pictureType].width = data.width;
            } else {
                delete item[pictureType].width;
            }

            if (data.height != null && data.height > 0) {
                item[pictureType].height = data.height;
            } else {
                delete item[pictureType].height;
            }

            return item;
        };

        service.mapPictureField = function (item, data) {
            item.src = data.picture;
            item.type = data.type || 'image';

            if (data.processedPictures != null) {
                Object.keys(data.processedPictures).forEach((key) => {
                    item[key] = data.processedPictures[key];
                });
            }

            return item;
        };

        service.deletePictureFields = function (item) {
            item.picture = null;

            Object.keys(item.picture).forEach((key) => {
                item.picture[key] = null;
            });

            return item;
        };

        service.getProductNameByOfferId = function (item) {
            return $http.get('adminv3/product/getProductNameByOfferId', { params: { offerId: item.offerId } }).then((response) => response.data);
        };

        service.getOfferDataFromId = async function (itemList) {
            const result = [];
            const itemsFiltered = itemList.filter((item) => item.offerId != null && item.offerId !== '');

            let itemData;
            for (const item of itemsFiltered) {
                itemData = await service.getProductNameByOfferId(item);
                result.push({
                    offerId: item.offerId,
                    offerPrice: item.offerPrice,
                    name: `[${  itemData.ArtNo  }] ${  itemData.Name}`,
                    productId: itemData.ProductId,
                    enabled: itemData.Enabled,
                    minAmount: parseFloat(itemData.MinAmount),
                    maxAmount: parseFloat(itemData.MaxAmount),
                    multiplicity: parseFloat(itemData.Multiplicity),
                    color: itemData.Color != null ? `Цвет: ${  itemData.Color.ColorName}` : '',
                    size: itemData.Size != null ? `Размер: ${  itemData.Size.SizeName}` : '',
                });
            }

            return result;
        };
    };

    ng.module('blocksConstructor').service('blocksConstructorService', blocksConstructorService);

    blocksConstructorService.$inject = ['$http', '$translate', '$q', '$filter'];
})(window.angular);
