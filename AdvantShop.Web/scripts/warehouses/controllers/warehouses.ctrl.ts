import { isResponseError, type Response } from '../../@types/http';
import { IWarehouse, IWarehousesCity } from '../types';
import { type translate } from 'angular';
import { ICity } from '../../@types/location';
import type { IIpZone } from '../../_partials/zone/types';
import type { OptionFilterType, FilterType as FilterPointType } from '../../_common/points-list-map/controllers/pointsFilters.ctrl';

type FilterType<T = any, V = void> = Record<'city' | 'type', FilterPointType<T, V>>;

export default class WarehousesCtrl {
    warehousesList: IWarehouse[] = [];
    warehousesMapDataList?: IWarehouse[];
    private readonly defaultFilterType: string;
    filterTypes: string[] = [];
    warehousesCity?: IWarehousesCity[];
    readonly filtersName = {
        city: 'city',
        type: 'type',
    } as const;
    filters: FilterType;
    filtersArray?: FilterPointType[];
    currentCity?: IWarehousesCity;

    /* @ngInject */
    constructor(
        private readonly warehousesService: any,
        private readonly $translate: translate.ITranslateService,
        private readonly zoneService: any,
        private readonly $scope: any,
    ) {
        this.defaultFilterType = this.$translate.instant('Js.WarehousesMap.All');
        this.filters = {
            [this.filtersName.city]: {
                value: undefined,
                callback: this.onChangeFilter,
                formControl: {
                    name: 'warehousesCity',
                    type: 'select',
                    values: [],
                    label: `${this.$translate.instant('Js.Warehouses.Filter.City')  }:`,
                },
            },
            [this.filtersName.type]: {
                value: this.defaultFilterType,
                callback: this.onChangeFilter,
                formControl: {
                    name: 'warehousesType',
                    type: 'select',
                    values: [],
                    label: `${this.$translate.instant('Js.Warehouses.Filter.Type')  }:`,
                },
            },
        };
    }

    $onInit = async () => {
        try {
            const res = await this.zoneService.getCurrentCity();
            if (!isResponseError(res) && res.obj) {
                this.currentCity = res.obj;
                await this.initWarehousesData();
                this.currentCity &&
                    this.initWarehousesCities()
                        .then(async (cities: IWarehousesCity[]) => this.currentCity && this.initCurrentCityFilter(this.currentCity, cities))
                        .catch((e: Error) => {
                            console.error(e.message);
                        });
            } else {
                throw new Error('Unable to get current city');
            }
        } catch (e) {
            throw new Error(e);
        }
    };

    initWarehousesData = () => this.warehousesService
            .getWarehousesInfo(this.currentCity?.CityId)
            .then((res: Response<IWarehouse[]>) => {
                if (!isResponseError(res) && res.obj) {
                    this.warehousesList = res.obj;
                    this.initWarehouseFiltersByType(this.warehousesList);
                    this.warehousesMapDataList = this.warehousesService.getWarehousesMapData(this.warehousesList);
                }
            })
            .catch((e) => {
                throw new Error(e);
            });

    initWarehousesCities = () => this.warehousesService
            .getWarehousesCities()
            .then((res: Response<IWarehousesCity[]>) => {
                if (!isResponseError(res) && res.obj) {
                    return (this.warehousesCity = res.obj);
                }
            })
            .catch((e) => {
                throw new Error(e);
            });

    handleError = (e: Error) => {
        throw new Error(e.message ?? e);
    };

    initWarehouseFiltersByType = (warehousesList: IWarehouse[]) => {
        this.filterTypes = this.warehousesService.getFilterTypes(warehousesList);
        if (this.filterTypes.length > 0) {
            this.filterTypes.unshift(this.defaultFilterType);
            this.filters.type.value = this.defaultFilterType;
            this.filters.type.formControl.values = this.filterTypes;
        }
    };

    initCurrentCityFilter = (currentCity: IWarehousesCity | ICity, warehousesCity: IWarehousesCity[]) => {
        this.filters.city.formControl.values = this.warehousesCity?.map((it) => ({
                name: it.City,
                value: it.CityId,
            }));
        this.filters.city.formControl.values?.unshift({
            name: this.defaultFilterType,
            value: undefined,
        });
        this.filters.city.value =
            this.filters.city.formControl.values?.find((it) => {
                if (typeof it === 'object') {
                    return it.value === currentCity.CityId;
                }
            }) || this.defaultFilterType;

        this.filtersArray = this.getFiltersArray();
    };

    onChangeFilter = async (value: any) => {
        for (const type of Object.values(this.filtersName)) {
            // TODO рефактор пускай все фильтрует бэк или отфильтровывать сразу
            switch (type) {
                case this.filtersName.city:
                    await this.onFilterByCity(this.filters[type].value);
                    break;
                case this.filtersName.type:
                    await this.filterByType(this.filters[type].value);
                    break;
            }
        }
        this.$scope.$digest();
    };

    filterByType = async (value: any): Promise<void> => {
        const warehouses =
            value === this.defaultFilterType ? this.warehousesList : this.warehousesService.getWarehousesByType(value, this.warehousesList);

        this.warehousesMapDataList = this.warehousesService.getWarehousesMapData(warehouses);
    };

    onFilterByCity = (city: OptionFilterType): Promise<void> => this.filterByCity(city.value);

    filterByCity = async (cityId?: number): Promise<void> => this.getWarehousesInfo(cityId)
            .then((res) => {
                if (!isResponseError(res)) {
                    if (res.obj) {
                        this.warehousesList = res.obj;
                        return (this.warehousesMapDataList = this.warehousesService.getWarehousesMapData(res.obj));
                    }
                } else {
                    throw new Error(res.errors.join(' '));
                }
            })
            .catch(this.handleError);

    getWarehousesInfo = (cityId?: number): Promise<Response<IWarehouse[]>> => this.warehousesService.getWarehousesInfo(cityId);

    getCurrentCity = async () => await this.zoneService.getCurrentCity();

    getWarehousesCities = (): Promise<Response<IWarehousesCity[]>> => this.warehousesService.getWarehousesCities();

    getCurrentCityFromIpZone = (): Promise<IIpZone> => this.zoneService.getCurrentZone();

    getCurrentCityFromSettings = (): Promise<Response<ICity>> => this.zoneService.getCurrentCity();

    getFiltersArray = () => {
        const filters: FilterPointType[] = [];
        for (const filter in this.filters) {
            filters.push(this.filters[filter]);
        }
        return filters;
    };
}
