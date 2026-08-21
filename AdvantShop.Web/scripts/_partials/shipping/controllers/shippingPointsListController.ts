import { IScope, translate, ITimeoutService, IQService, IDeferred, IRequestShortcutConfig, IPromise } from 'angular';
import type { IToasterService } from 'ngtoaster';
import {
    IAbstractShippingOption,
    IBaseShippingOption,
    ICityMapData,
    ICornerMapCells,
    IFeature,
    IShippingPointData,
    IShippingsMethod,
    IShippingsMethodPointsMap,
    IShippingsPointMap,
} from '../types';
import { ApiKeyType } from '../../../_common/apiMap/apiMap.service';
import { ControlSingleKey, IMapOptions, IObjectManagerOptions, Map } from 'yandex-maps';
import { IPointMap } from '../../../_common/points-list-map/types';
import { type IIpZone, IZoneCountry } from '../../zone/types';
import { AddressData, type AddressValue, ICity, type ICoordsObj } from '../../../@types/location';
import { FilterType, OptionFilterType } from '../../../_common/points-list-map/controllers/pointsFilters.ctrl';
import { isResponseError } from '../../../@types/http';
import { IZoneMapService } from '../../zone/services/zoneMapService';

function isCityCoords(data: unknown | ICityMapData): data is ICityMapData {
    return (
        data !== null &&
        data !== undefined &&
        true &&
        typeof data === 'object' &&
        'coords' in data &&
        data?.coords !== undefined &&
        'bounds' in data &&
        data?.bounds !== undefined
    );
}

class ShippingPointsListCtrl {
    items: IAbstractShippingOption[] = [];
    onChange:
        | (({
              shippingMethod,
              shippingAddress,
              reloadPage,
              point,
          }: {
              shippingMethod: IAbstractShippingOption;
              shippingAddress?: AddressValue;
              reloadPage?: boolean;
              point?: IBaseShippingOption;
          }) => Promise<void>)
        | undefined;
    selectedShippingMethod?: IShippingsMethod;
    selectedShippingPoint?: IShippingsPointMap;
    mapApiKey: ApiKeyType | null = null;
    mapOptions: IMapOptions = {
        suppressMapOpenBlock: true,
        minZoom: 10,
        maxZoom: 21,
    };
    mapControls: ControlSingleKey = 'zoomControl';
    mapZoom?: number = 14;
    points: IPointMap[] = [];
    shippingPointsFilters: FilterType[] = [];
    currentCity?: ICity;
    geoObjectsDeliveryZones: IFeature[] = [];
    map?: Map;

    collectionOptions: IObjectManagerOptions = {
        clusterize: true,
        // @ts-expect-error неверные типы
        openBalloonOnClick: false,
        useMapMargin: true,
    };
    cornerCells: ICornerMapCells[] = [];
    renderedPointsSet = new Set<IShippingsPointMap['Id']>();
    pointsListMapCtrl?: any;
    shippingPointsDeferred: IDeferred<unknown>;
    _isShowMap = false;
    mapCenter?: number[];
    _skipActionEndEvent = false;
    _isFetching = false;
    _errorMessage?: string;
    _fetchShippingDataCanceler: IDeferred<unknown>;
    _isInitFirstData = false;
    showCityFilter?: boolean;
    showMapPickup?: boolean;

    /* @ngInject */
    constructor(
        private readonly geoModeCheckoutService: any,
        private readonly shippingService: any,
        private readonly $scope: IScope,
        private readonly zoneService: any,
        private readonly zoneMapService: IZoneMapService,
        private readonly $translate: translate.ITranslateService,
        private readonly $timeout: ITimeoutService,
        private readonly yandexMapsService: any,
        private readonly $q: IQService,
        private readonly toaster: IToasterService,
    ) {
        this.shippingPointsDeferred = this.$q.defer();
        this._fetchShippingDataCanceler = this.$q.defer();
    }

    $onInit() {
        this.setStateFetch(true);
    }

    setCurrentCity = async (zones: IZoneCountry) => {
        this.currentCity = (await this.getCurrentCity()) || zones?.CountryCities[0];
        // если в списке нет города который установлен взять первый
        const isInListCity = zones?.CountryCities.some((it) => it.CityId === this.currentCity?.CityId);
        if (!isInListCity) {
            this.currentCity = zones?.CountryCities[0];
        }
    };

    setDataPointsMap = async (mode: 'city' | 'map') => {
        const shippingsPointsData = await this.fetchShippingPointsData(mode);
        if (shippingsPointsData) {
            // const newCornerCells = this.cornerCells.concat(this.shippingService.getNewCornerCells(this.cornerCells, shippingsPointsData.Cells));
            // this.cornerCells = newCornerCells.length >= 800 ? this.removeCornerCells(newCornerCells) : newCornerCells;
            const pointsMap: IPointMap<IShippingsPointMap>[] = this.shippingService.getShippingPointMapGeoObj(shippingsPointsData.ShippingsPoints);
            // this.points = this.points.concat(
            //     this.shippingService.getUndrawnPointsMap(this.shippingService.getUniquePointsMap(pointsMap),
            //         this.renderedPointsSet),
            // );
            this.points = this.shippingService.getUniquePointsMap(pointsMap);
        }
    };

    removeCornerCells = (cornerCells: ICornerMapCells[], count = 200) => cornerCells.slice(count);

    bindEventMap = () => {
        this.map?.events.add('actionend', this.onActionEndMapHandler);
    };

    onActionEndMapHandler = async (): Promise<void> => {
        if (this._skipActionEndEvent) {
            return;
        }
        // const bounds: number[][] = this.map?.getBounds();
        // const currentRectangle = {
        //     upperCornerLatitude: bounds[1][0],
        //     upperCornerLongitude: bounds[1][1],
        //     lowerCornerLatitude: bounds[0][0],
        //     lowerCornerLongitude: bounds[0][1],
        // };

        // if (this.mapService.isRectangleInside(this.cornerCells, currentRectangle)) {
        this.showPlugInPointList();
        await this.setDataPointsMap('map').finally(() => {
            this.hidePlugInPointList();
            this.renderCells();
            this.$scope.$apply();
        });
        // }
    };

    onInitPointsListMap = async (pointsListMapCtrl: any) => {
        this.map = pointsListMapCtrl._map;
        this.map?.margin.setDefaultMargin([50, 50, 50, 50]);
        this.pointsListMapCtrl = pointsListMapCtrl;

        try {
            const zones: IZoneCountry = await this.zoneService.getZones();
            await this.setCurrentCity(zones);
            if (zones.CountryCities && this.showCityFilter) {
                this.initOfferWarehousesCities(zones.CountryCities, this.currentCity);
            }
        } catch (event) {
            console.error('error', event.message);
        }
        // TODO рефактор код
        if (this.showMapPickup) {
            // получаем координаты города
            const coordsCityPromise = this.$q.defer();
            let bounds: number[][], coords: number[];
            const isGetCoordsCityPromise = this.currentCity
                ? this.getCoordsCity(this.currentCity?.CityId, this.currentCity.Name).catch((err) => Promise.reject(err))
                : (coordsCityPromise.resolve(), coordsCityPromise.promise);

            isGetCoordsCityPromise
                .then((data: unknown) => {
                    if (isCityCoords(data)) {
                        this.mapCenter = data?.coords;
                        if (data) {
                            ({ bounds, coords } = data);
                        }
                    }
                    this.showMap();
                    coordsCityPromise.resolve();
                })
                .catch((err: Error) => {
                    coordsCityPromise.reject(new Error(err.message));
                });

            coordsCityPromise.promise
                .then(() => {
                    const isSetBoundsPromise = this.$q.defer();
                    if (bounds && this.map) {
                        this.map
                            ?.setBounds(bounds, {
                                checkZoomRange: true,
                            })
                            .then(() =>
                                this.map?.setCenter(coords).then(
                                    () => isSetBoundsPromise.resolve(),
                                    () => isSetBoundsPromise.resolve(),
                                ),
                            );
                    } else {
                        isSetBoundsPromise.resolve();
                    }

                    isSetBoundsPromise.promise
                        .then(async () => {
                            try {
                                await this.setDataPointsMap('map');
                                this.shippingPointsDeferred.resolve();
                                this.bindEventMap();
                                this.setStateFetch(false);
                                this._isInitFirstData = true;
                            } catch (e) {
                                console.error(e.message);
                            }
                        })
                        .catch((err: Error) => {
                            this.toaster.pop('error', '', err.message);
                            // this.showErrorMessage(err.message);
                        });
                })
                .catch(async (err: Error) => {
                    this.toaster.pop('error', '', err.message);
                    // this.showErrorMessage(err.message);
                    // GetPoints By City
                    await this.setDataPointsMap('city');
                    this.shippingPointsDeferred.resolve();
                    this._isInitFirstData = true;
                });
        } else {
            // GetPoints By City
            await this.setDataPointsMap('city');
            this.shippingPointsDeferred.resolve();
            this._isInitFirstData = true;
        }
        this.$scope.$apply();
        return this.shippingPointsDeferred.promise;
    };

    // для дебага
    renderCells = () => {
        const rectangles = this.cornerCells?.map(
            (rect) =>
                new ymaps.Rectangle(
                    [
                        [rect.LowerCornerLatitude, rect.UpperCornerLongitude],
                        [rect.UpperCornerLatitude, rect.LowerCornerLongitude],
                    ],
                    {},
                    {
                        fillColor: '#0000FF',
                        fillOpacity: 0.5,
                        strokeColor: '#0000FF',
                        strokeOpacity: 0.5,
                        strokeWidth: 2,
                        borderRadius: 6,
                    },
                ),
        );

        rectangles?.forEach((rectangle) => {
            this.map?.geoObjects.add(rectangle);
        });
    };

    setRenderedPointsMap = (points: IPointMap<IShippingPointData>[]) => {
        points.forEach((point) => {
            this.renderedPointsSet.add(point.original.point.Id);
        });
    };

    getShippingDataPointsByBoundsFromMap = async (options?: IRequestShortcutConfig): Promise<IShippingsMethodPointsMap | void> => {
        if (this.map) {
            const [leftBot, rightTop] = this.map.getBounds();
            return await this.getShippingDataPointsByBounds(leftBot[0], leftBot[1], rightTop[0], rightTop[1], options);
        }
        return Promise.resolve();
    };

    getCurrentCity = async (): Promise<ICity | undefined> => {
        const response = await this.zoneService.getCurrentCity();
        if (!isResponseError(response)) {
            return response.obj;
        }
        throw new Error(response.errors.join(' '));
    };

    initOfferWarehousesCities = (cities: ICity[], currentCity?: ICity) => {
        const filterValues: OptionFilterType<ICity>[] = cities.map((it) => ({
            name: it.Name,
            value: it.CityId,
            original: it,
        }));

        const selectedValue = currentCity ? { name: currentCity.Name, value: currentCity.CityId } : filterValues[0];

        this.shippingPointsFilters.push({
            value: selectedValue,
            callback: this.onChangeCity,
            formControl: {
                name: 'shippingPointsCity',
                type: 'select',
                label: `${this.$translate.instant('Js.ShippingPoints.Filter.City')}:`,
                values: filterValues,
            },
        });
    };

    onChangeCity = (city: OptionFilterType<ICity>): IPromise<void> => {
        this._fetchShippingDataCanceler.resolve();
        this._fetchShippingDataCanceler = this.$q.defer();
        this.showPlugInPointList();
        this.clearMapData();

        this.currentCity = city.original;
        // TODO рефактор
        return this.$timeout(async () => {
            // @ts-ignore
            if (this.showMapPickup && window?.ymaps) {
                this.getCoordsCity(city.value, city.name)
                    .then((data) => {
                        if (data) {
                            const { bounds, coords } = data;
                            this._skipActionEndEvent = true;
                            this.map
                                ?.setBounds(bounds, {
                                    checkZoomRange: true,
                                })
                                .then(() => {
                                    this._skipActionEndEvent = false;
                                    this.map?.setCenter(coords).then(() => {
                                        // this.setDataPointsMap().then(() => {
                                        //     this._skipActionEndEvent = false;
                                        // });
                                    });
                                });
                        }
                    })
                    .catch(async (err) => {
                        this.toaster.pop('error', '', err.message);
                        await this.setDataPointsMap('city').finally(() => {
                            this.hidePlugInPointList();
                            this.$scope.$apply();
                        });
                    });
            } else {
                await this.setDataPointsMap('city').finally(() => {
                    this.hidePlugInPointList();
                });
            }
        });
    };

    private clearMapData = () => {
        this.points = [];
        this.cornerCells.length = 0;
        this.renderedPointsSet.clear();
    };

    getCoordsCity = async (cityId: number, cityName: string): Promise<ICityMapData> => {
        const cityMapDataFromCache: ICityMapData | undefined = this.getCacheCityMapCoords(cityId);
        if (cityMapDataFromCache) {
            return Promise.resolve(cityMapDataFromCache);
        }
        try {
            const data = await this.getCoordsCityByName(cityName);
            const cityMapData = {
                id: cityId,
                name: cityName,
                bounds: data?.bounds,
                coords: data?.coords,
            };
            this.setCacheCityMapCoords(cityMapData);
            return Promise.resolve(cityMapData);
        } catch (error) {
            throw new Error(error);
        }
    };

    getCoordsCityByName = (cityName: string): Promise<{ bounds: number[][]; coords: number[] }> =>
        this.yandexMapsService.getCoordsCityByName(cityName);

    getAddressByCoords = (coords: ICoordsObj) => this.zoneMapService.getAddressByCoords(coords);

    private getAddressValue(shippingAddress?: AddressValue | ICity): AddressData | undefined {
        const isAddressValue = (obj: any): obj is AddressValue => Boolean(shippingAddress && obj.Value !== null && obj.CheckoutAddress);

        if (this.map && isAddressValue(shippingAddress)) {
            const addressValue = shippingAddress?.CheckoutAddress;

            if (addressValue) {
                return {
                    Country: addressValue.Country,
                    CountryName: addressValue.Country,
                    Region: addressValue.Region,
                    District: addressValue.District,
                    City: addressValue.City,
                    Zip: addressValue.Zip,
                    Street: addressValue.Street,
                    House: addressValue.House,
                    Structure: addressValue.Structure,
                };
            }
        }

        if (this.currentCity) {
            return {
                Country: '',
                CountryName: '',
                Region: '',
                District: '',
                City: this.currentCity.Name,
                Zip: this.currentCity.Zip,
                Street: '',
                House: '',
                Structure: '',
            };
        }

        return undefined;
    }

    selectShippingPoint = async (shippingMethod: IPointMap<IShippingPointData>) => {
        this.selectedShippingMethod = shippingMethod.original.shippingMethod;
        this.selectedShippingPoint = shippingMethod.original.point;
        let shippingAddress: AddressValue | undefined;
        if (this.map) {
            const [Latitude, Longitude] = this.map.getCenter();
            shippingAddress = await this.getAddressByCoords({ Latitude, Longitude });
        }

        const addressValue = this.getAddressValue(shippingAddress);

        try {
            let isReloadPageFromZone = false;
            if (addressValue) {
                const zoneData = await this.setLocationZone(addressValue);
                isReloadPageFromZone = zoneData.ReloadPage;
            }
            const { selectedOption, reloadPage } = await this.setGeoModePoint(this.selectedShippingMethod.MethodId, this.selectedShippingPoint.Id);
            this.onChange?.({
                shippingMethod: selectedOption,
                shippingAddress,
                reloadPage: isReloadPageFromZone || reloadPage,
                point: selectedOption.SelectedPoint,
            });
        } catch {
            this.toaster.error(this.$translate.instant('Js.GeoMode.Error'));
        }
    };

    fetchShippingPointsData = async (mode: 'city' | 'map') => {
        const timeout = { timeout: this._fetchShippingDataCanceler.promise };
        if (mode === 'city') {
            return await this.getShippingPoints(this.currentCity!.CityId, timeout);
        }

        if (mode === 'map') {
            return await this.getShippingDataPointsByBoundsFromMap(timeout);
        }
    };

    async getShippingDataPointsByBounds(
        bottomLeftLatitude: number,
        bottomLeftLongitude: number,
        topRightLatitude: number,
        topRightLongitude: number,
        options?: IRequestShortcutConfig,
    ): Promise<IShippingsMethodPointsMap | undefined> {
        try {
            const response = await this.geoModeCheckoutService.getShippingPointsByBounds(
                {
                    bottomLeftLatitude,
                    bottomLeftLongitude,
                    topRightLatitude,
                    topRightLongitude,
                },
                options,
            );
            if (!isResponseError(response)) {
                return response.obj;
            }
            throw new Error(response.errors.join(' '));
        } catch (error) {
            if (error.xhrStatus !== 'abort') {
                throw new Error(error.message);
            }
        }
    }

    getShippingPoints = async (cityId: number, options?: IRequestShortcutConfig): Promise<IShippingsMethodPointsMap | undefined> => {
        try {
            const response = await this.geoModeCheckoutService.getShippingPoints(cityId, options);
            if (!isResponseError(response)) {
                return response.obj;
            }
            throw new Error(response.errors.join(' '));
        } catch (error) {
            if (error.xhrStatus !== 'abort') {
                throw new Error(error.message);
            }
        }
    };

    setCacheCityMapCoords = (cityMapData: ICityMapData) => {
        this.shippingService.setCacheCityMapCoords(cityMapData);
    };

    getCacheCityMapCoords = (id: ICityMapData['id']): ICityMapData | undefined => this.shippingService.getCacheCityMapCoords(id);

    setGeoModePoint = (
        shippingMethodId: IShippingsMethod['MethodId'],
        pointId: IShippingsPointMap['Id'],
    ): Promise<{ selectedOption: IAbstractShippingOption; reloadPage: boolean }> =>
        this.geoModeCheckoutService.setGeoModePoint(shippingMethodId, pointId);

    showErrorMessage = (errorMessage: string) => {
        this._errorMessage = errorMessage;
    };

    setStateFetch = (state: boolean) => {
        this._isFetching = state;
    };

    showPlugInPointList = () => {
        this.setStateFetch(true);
        this.pointsListMapCtrl.pointsListCtrl.showPlug();
    };

    hidePlugInPointList = () => {
        this.setStateFetch(false);
        this.pointsListMapCtrl.pointsListCtrl.hidePlug();
    };

    showMap = () => {
        this._isShowMap = true;
    };

    hideMap = () => {
        this._isShowMap = false;
    };

    $onDestroy() {
        this.map?.events.remove('actionend', this.onActionEndMapHandler);
    }

    setLocationZone = (addressData: AddressData): Promise<IIpZone> => this.zoneMapService.setLocationZone(addressData);
}

export default ShippingPointsListCtrl;
