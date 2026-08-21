(function (ng) {
    

    const subblockInplaceService = function ($http, modalService) {
        const service = this;

        service.convertToRGBA = function (hex, opacity) {
            let r, g, b, result;

            hex = hex.replace('#', '');

            r = parseInt(hex.substring(0, 2), 16);
            g = parseInt(hex.substring(2, 4), 16);
            b = parseInt(hex.substring(4, 6), 16);

            result = `rgba(${  r  },${  g  },${  b  },${  opacity / 100  })`;

            return result;
        };

        service.updateSubBlockSettings = function (subBlockId, settings) {
            return $http
                .post('landinginplace/updatesubblocksettings', {
                    subBlockId,
                    settings: JSON.stringify(settings),
                })
                .then((response) => response.data);
        };

        service.showModal = function (modalId, title, options, parentData) {
            if (modalService.hasModal(modalId) === false) {
                modalService.renderModal(
                    modalId,
                    title,
                    '<div data-ng-include data-src="\'areas/landing/frontend/blocks/subblock-inplace/templates/subblockModal.html\'"></div>',
                    null,
                    ng.extend({ isFloating: true, backgroundEnable: false }, options || {}),
                    parentData,
                );
            }

            return modalService.getModal(modalId).then((modal) => {
                modal.modalScope.open();
                return modal;
            });
        };
    };

    ng.module('subblockInplace').service('subblockInplaceService', subblockInplaceService);

    subblockInplaceService.$inject = ['$http', 'modalService'];
})(window.angular);
