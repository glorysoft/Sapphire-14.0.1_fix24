import type {IHttpService, IQService} from "angular";
import type {IModalService} from '../../../../../scripts/_common/modal/services/modalService';
import templateUrl from './catalogModal.html'
import {isResponseError, type Response} from "../../../../../scripts/@types/http";
import {IToastrService} from "angular-toastr";

export interface ICatalogModalOptions {
    onePageCatalog?: boolean;
}

export interface ICatalogModalService {
    openModal(options?: ICatalogModalOptions): void
}

type CatalogModalServiceResult = 'None' | 'Default' | 'WithIcons' | 'BlocksMode';

interface ICatalogModalServiceCategory {
    Name: string,
    Url: string,
    SubItems: ICatalogModalServiceCategory[],
    Icon: unknown,
    SmallPicture: unknown
}

interface ICatalogModalServiceData {
    Items: ICatalogModalServiceCategory[],
    ViewMode: CatalogModalServiceResult,
    PhotoWidth: number,
    PhotoHeight: number
}

export class CatalogModalService implements ICatalogModalService {
    private cache?: ICatalogModalServiceData;
    private modalId = 'catalogModal';

    /* @ngInject */
    constructor(readonly $http: IHttpService, readonly $q: IQService, readonly modalService: IModalService, readonly toaster: IToastrService,
                readonly scrollToBlockService, readonly scrollToBlockConfig ) {
    }

    openModal(options?: ICatalogModalOptions) {
        this.$q.when(typeof this.cache === 'undefined')
            .then(needRequest => {
                if (needRequest) {
                    return this.getData()
                        .then(data => this.cache = data);
                } 
                    return this.cache;
                
            })
            .then(data => {
                if (typeof data !== 'undefined') {
                    this.renderModal(data, options)
                } else {
                    console.error('Data is undefined for catalogModal')
                }
            })
            .catch((errors: unknown) => {

                let errorMessage = '';

                if (typeof errors === 'string') {
                    errorMessage = errors;
                } else if (errors instanceof Error) {
                    errorMessage = errors.message;
                }
                this.toaster.error(errorMessage)
            })
    }

    renderModal(data: ICatalogModalServiceData, options?: ICatalogModalOptions) {
        this.modalService.renderModal(this.modalId, 'Категории', `<div data-ng-include="'${templateUrl}'"></div>`,
            undefined,
            undefined,
            {
                data,
                options
            })

        this.modalService.getModal(this.modalId).then(({modalScope}) => {
            modalScope.open()
        })
    }

    getData() {
        return this.$http.get<Response<ICatalogModalServiceData>>('mobile/catalog/catalogRoots').then((response) => {
            if (!isResponseError(response.data)) {
                return response.data.obj;
            }

            throw new Error(response.data.errors.join('<br>'))
        })
    }
}
