import { dataProcess } from './galleryIcons.webworker.js';

const ng = window.angular;
const fontAwesome = window.FontAwesome;
const fontAwesomeStyles = window.___FONT_AWESOME___.styles;

const MODAL_ID_GAllERY = 'modalPictureLoaderGalleryIcons';
const DATA = fontAwesomeStyles;

const DATA_GROUPS = Object.keys(fontAwesomeStyles).filter((groupName) => groupName !== 'fa'); //fa == fas
const ITEM_PER_PAGE = 144;
let SOURCE = null;
let SOURCE_KEY = null;
let SOURCE_LENGTH = 0;

const galleryIconsService = function ($http, $q, modalService) {
    const service = this;

    service.showModal = function (options) {
        modalService.renderModal(
            MODAL_ID_GAllERY,
            'Выбрать иконку',
            '<gallery-icons class="gallery-icons" on-select="modalData.onSelect(svg, width, height)"></gallery-cloud>',
            null,
            { destroyOnClose: true, modalClass: 'gallery-icons-modal' },
            { modalData: options },
        );

        modalService.getModal(MODAL_ID_GAllERY).then((modal) => {
            modal.modalScope.open();
        });
    };

    service.closeModal = function () {
        modalService.close(MODAL_ID_GAllERY);
    };

    service.preloadData = function () {
        if (SOURCE == null) {
            service.prepareSource().then((sourceFromWorker) => {
                SOURCE = sourceFromWorker;
            });
        }
    };

    service.prepareSource = function () {
        const defer = $q.defer();

        const resultProcess = dataProcess(DATA, DATA_GROUPS);
        const result = {};

        Object.keys(resultProcess).forEach((key) => {
            for (let i = 0, len = resultProcess[key].length; i < len; i++) {
                result[key] = result[key] || [];
                result[key].push(service.renderSVG(resultProcess[key][i].prefix, key, 'currentColor')[0]);
            }
        });

        return $q.when(result);
    };

    service.getData = function (page, term) {
        return $q.when(SOURCE == null ? service.prepareSource() : SOURCE).then((sourceFromWorker) => {
            SOURCE ||= sourceFromWorker;
            SOURCE_KEY ||= Object.keys(SOURCE);
            SOURCE_LENGTH = SOURCE_KEY.length;

            const iterationResult = service.iterator(SOURCE, page, term);

            return {
                data: iterationResult.data,
                finish: iterationResult.next === false,
                totalCount: (page - 1) * ITEM_PER_PAGE + iterationResult.itemsCount,
            };
        });
    };

    service.iterator = function (data, page, term) {
        const result = {
            data: {},
            next: true,
            itemsCount: 0,
        };

        let counter = 0;

        const limit = ITEM_PER_PAGE;

        const listKeysForInteration = SOURCE_KEY.slice(ITEM_PER_PAGE * (page - 1), term == null ? ITEM_PER_PAGE * page : SOURCE_LENGTH);

        for (let i = 0, len = listKeysForInteration.length; i < len; i++) {
            if (term == null || (term != null && listKeysForInteration[i].toString().toLowerCase().indexOf(term) !== -1)) {
                result.data[listKeysForInteration[i]] = data[listKeysForInteration[i]];
                counter += data[listKeysForInteration[i]].length;

                if (counter === limit) {
                    break;
                }
            }
        }

        result.next = counter > 0;

        result.itemsCount = counter;

        return result;
    };

    service.renderSVG = function (prefix, iconName, color) {
        const objIcon = fontAwesome.findIconDefinition({
            prefix,
            iconName,
        });

        return fontAwesome.icon(objIcon, {
            classes: 'fa-fw',
            styles: { color },
        }).html;
    };

    service.translate = function (term) {
        return $http.get('landingInplace/translate', { params: { term } }).then((response) => response.data);
    };
};

ng.module('galleryIcons').service('galleryIconsService', galleryIconsService);

galleryIconsService.$inject = ['$http', '$q', 'modalService'];
