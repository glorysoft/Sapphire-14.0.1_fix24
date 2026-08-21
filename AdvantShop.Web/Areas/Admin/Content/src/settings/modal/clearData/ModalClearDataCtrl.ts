import { IController, IHttpService, translate } from 'angular';
import { IToasterService } from 'ngtoaster';
import { isResponseError, Response } from '../../../../../../../scripts/@types/http';

interface IClearDataModalController extends IController {
    formInited: boolean;
    confirm: boolean;
    btnSleep: boolean;

    deleteCategories: boolean;
    deleteProducts: boolean;
    deleteProperty: boolean;
    deleteBrands: boolean;
    deleteOrder: boolean;
    deleteCustomers: boolean;
    deleteMenu: boolean;
    deletePage: boolean;
    deleteNews: boolean;
    deleteCarousel: boolean;
    deleteShippings: boolean;
    deletePayments: boolean;
    deleteTasks: boolean;
    deleteCrm: boolean;

    close(): void;

    delete(): void;
}

interface IClearDataParams {
    mode: string | undefined;
}

class ClearDataModalController implements IClearDataModalController {
    formInited: boolean;
    confirm: boolean;
    btnSleep: boolean;

    deleteCategories: boolean;
    deleteProducts: boolean;
    deleteProperty: boolean;
    deleteBrands: boolean;
    deleteOrder: boolean;
    deleteCustomers: boolean;
    deleteMenu: boolean;
    deletePage: boolean;
    deleteNews: boolean;
    deleteCarousel: boolean;
    deleteShippings: boolean;
    deletePayments: boolean;
    deleteTasks: boolean;
    deleteCrm: boolean;

    /* @ngInject */
    constructor(
        readonly $uibModalInstance: any,
        readonly $http: IHttpService,
        readonly toaster: IToasterService,
        readonly $translate: translate.ITranslateService,
        readonly params?: IClearDataParams,
    ) {
        this.formInited = false;
        this.confirm = false;
        this.btnSleep = false;

        this.deleteCategories = false;
        this.deleteProducts = false;
        this.deleteProperty = false;
        this.deleteBrands = false;
        this.deleteOrder = false;
        this.deleteCustomers = false;
        this.deleteMenu = false;
        this.deletePage = false;
        this.deleteNews = false;
        this.deleteCarousel = false;
        this.deleteShippings = false;
        this.deletePayments = false;
        this.deleteTasks = false;
        this.deleteCrm = false;
    }

    $onInit() {
        if (this.params !== null && this.params !== undefined) {
            if (this.params.mode === 'settingsSystem') {
                this.deleteCategories = true;
                this.deleteProducts = true;
                this.deleteOrder = true;
            }

            if (this.params.mode === 'catalog') {
                this.deleteCategories = true;
                this.deleteProducts = true;
                this.deleteBrands = true;
            }
        }

        this.formInited = true;
    };

    close() {
        this.$uibModalInstance.dismiss('cancel');
    };

    delete() {
        if (!this.confirm) return;

        const isSelectSome =
            this.deleteCategories ||
            this.deleteProducts ||
            this.deleteProperty ||
            this.deleteBrands ||
            this.deleteOrder ||
            this.deleteCustomers ||
            this.deleteMenu ||
            this.deletePage ||
            this.deleteNews ||
            this.deleteCarousel ||
            this.deleteShippings ||
            this.deletePayments ||
            this.deleteTasks ||
            this.deleteCrm;

        if (!isSelectSome) {
            this.toaster.pop('info', '', this.$translate.instant('Admin.Js.ClearData.SelectTheItems'));
            return;
        }

        this.btnSleep = true;

        const params = {
            deleteCategories: this.deleteCategories,
            deleteProducts: this.deleteProducts,
            deleteProperty: this.deleteProperty,
            deleteBrands: this.deleteBrands,
            deleteOrder: this.deleteOrder,
            deleteCustomers: this.deleteCustomers,
            deleteMenu: this.deleteMenu,
            deletePage: this.deletePage,
            deleteNews: this.deleteNews,
            deleteCarousel: this.deleteCarousel,
            deleteShippings: this.deleteShippings,
            deletePayments: this.deletePayments,
            deleteTasks: this.deleteTasks,
            deleteCrm: this.deleteCrm,
            rnd: Math.random(),
        };

        const url = 'settings/clearData';

        this.$http
            .post<Response>(url, params)
            .then((response) => {
                const { data } = response;

                if (!isResponseError(data)) {
                    this.toaster.pop('success', '', this.$translate.instant('Admin.Js.Settings.Settings.SpecifiedDataDeleted'));

                    this.$uibModalInstance.close();
                    window.location.reload();
                    return;
                }

                throw new Error();
            })
            .catch((_) => {
                this.toaster.pop(
                    'error',
                    this.$translate.instant('Admin.Js.SettingsUsers.Error'),
                    this.$translate.instant('Admin.Js.Settings.Settings.ErrorWhileDeletingData'),
                );

                this.btnSleep = false;
            });
    };
}

angular.module('uiModal').controller('ModalClearDataCtrl', ClearDataModalController);
