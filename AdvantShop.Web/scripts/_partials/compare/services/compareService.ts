import { PubSub } from '../../../_common/PubSub/PubSub.js';
import { IHttpService, IPromise } from 'angular';
import { CompareCountResponseType, CompareCountType, OfferIdType } from '../compare.module';
import type { ICompareCtrl } from '../controllers/compareController';

export interface ICompareService {
    add(offerId: OfferIdType, state: boolean): IPromise<CompareCountResponseType>;
    remove(offerId: OfferIdType, state: boolean): IPromise<CompareCountResponseType>;
    removeAll(): IPromise<CompareCountResponseType>;
    getStatus(offerId: OfferIdType): IPromise<boolean>;
    addCompareScope(id: OfferIdType, ctrl: ICompareCtrl): void;
    removeCompareScope(id: OfferIdType, ctrl: ICompareCtrl): void;
    changeCompareControlState(id: OfferIdType, state: boolean): void;
    getCountObj(): CompareCountType;
}

export interface ICompareServiceStatic {
    new ($http: IHttpService): ICompareService;
    compareScopeList: Map<OfferIdType, Set<ICompareCtrl>>;
}

type EndpointsNameType = 'ADD' | 'REMOVE' | 'STATUS' | 'REMOVE_ALL';

export const compareEndpoints: Record<EndpointsNameType, string> = {
    ADD: '/compare/addtocomparison',
    REMOVE: '/compare/removefromcompare',
    REMOVE_ALL: '/compare/removeallfromcompare',
    STATUS: '/compare/getstatus',
};

export class CompareService implements ICompareService {
    #countObj = {} as CompareCountType;
    static compareScopeList = new Map<OfferIdType, Set<ICompareCtrl>>();
    /* @ngInject */
    constructor(private readonly $http: IHttpService) {}

    add = (offerId: OfferIdType, state: boolean): IPromise<CompareCountResponseType> => this.$http
            .post<CompareCountResponseType>(compareEndpoints.ADD, { offerId, rnd: Math.random() })
            .then((res) => {
                const { data } = res;
                this.#countObj.count = data.Count;
                PubSub.publish('compare.add');
                this.changeCompareControlState(offerId, state);
                return data;
            })
            .catch((event) => {
                throw new Error(event.data || event);
            });

    remove = (offerId: OfferIdType, state = false): IPromise<CompareCountResponseType> => this.$http
            .get<CompareCountResponseType>(compareEndpoints.REMOVE, {
                params: { offerId, rnd: Math.random() },
            })
            .then((res) => {
                const { data } = res;
                this.#countObj.count = data.Count;
                this.changeCompareControlState(offerId, state);
                return data;
            })
            .catch((event) => {
                throw new Error(event.data || event);
            });

    removeAll = (): IPromise<CompareCountResponseType> => this.$http
            .get<CompareCountResponseType>(compareEndpoints.REMOVE_ALL)
            .then((res) => {
                const { data } = res;
                this.#countObj.count = data.Count;
                return data;
            })
            .catch((event) => {
                throw new Error(event.data || event);
            });

    getCountObj = (): CompareCountType => this.#countObj;

    getStatus = (offerId: OfferIdType): IPromise<boolean> => this.$http
            .get<boolean>(compareEndpoints.STATUS, { params: { offerId, rnd: Math.random() } })
            .then((res) => res.data)
            .catch((event) => {
                throw new Error(event.data || event);
            });

    addCompareScope = (id: OfferIdType, ctrl: ICompareCtrl): void => {
        const compareScopes = CompareService.compareScopeList.get(id) || new Set();
        compareScopes.add(ctrl);
        CompareService.compareScopeList.set(id, compareScopes);
    };

    removeCompareScope = (id: OfferIdType, ctrl: ICompareCtrl): void => {
        const compareControls: Set<ICompareCtrl> | undefined = CompareService.compareScopeList.get(id);
        if (compareControls) {
            for (const scope of compareControls) {
                if (ctrl === scope) {
                    compareControls.delete(ctrl);
                }
            }
        }
    };

    changeCompareControlState = (id: OfferIdType, state: boolean): void => {
        const compareControls: Set<ICompareCtrl> | undefined = CompareService.compareScopeList.get(id);
        if (compareControls) {
            for (const scope of compareControls) {
                scope.isAdded = state;
            }
        }
    };
}
