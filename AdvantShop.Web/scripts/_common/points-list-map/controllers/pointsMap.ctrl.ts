import { IController, IScope, translate } from 'angular';
import { Balloon, IClustererOptions, IEvent, IGeoObject, IGeoObjectOptions, Map, ObjectManager, objectManager } from 'yandex-maps';
import { IGeoObjectPolygon, IPointMap, IYaPointMap } from '../types';

type YaAfterInitCbType = ({ $target }: { $target: Map }) => void;
type YaGeoObjectClickCbType = ({ balloon, fromCluster }: { balloon: any; fromCluster?: boolean }) => void;
type YaGeoObjectPolygonsAfterInitType = ({ polygons }: { polygons: IGeoObjectPolygon[] }) => void;
type YaCollectionAfterInitCbType = ({ $target }: { $target: ObjectManager }) => void;
type YaClusterCollectionAfterInitCbType = ({ $target }: { $target: objectManager.ClusterCollection }) => void;

export default class PointsMapCtrl implements IController {
    /* @ngInject */
    constructor(
        private readonly $translate: translate.ITranslateService,
        private readonly $scope: IScope,
        private readonly mapApiLoad: any,
    ) {}

    readonly ZOOM_SELECTED_BALLOON: number = 17;
    readonly NATIVE_COMPACT_MODE_BALLOON_PANEL_OPTIONS = {
        panelMaxMapArea: Infinity,
        autoPan: false,
        panelMaxHeightRatio: 0.3,
    };
    isLoadedMap = false;
    yaZoom?: number;
    _map: Map | null = null;
    collection?: ObjectManager;
    yaAfterInit?: YaAfterInitCbType;
    yaGeoObjectEventClick?: YaGeoObjectClickCbType;
    yaCollectionAfterInit?: YaCollectionAfterInitCbType;
    yaClusterCollectionAfterInit?: YaClusterCollectionAfterInitCbType;
    yaGeoObjectPolygonsAfterInit?: YaGeoObjectPolygonsAfterInitType;
    showAll = true;
    defaultCollectionOptions: IGeoObjectOptions = {
        preset: 'twirl#blueIcon',
    };
    defaultClasterOptions: IClustererOptions = {
        preset: 'twirl#blueIcon',
    };
    yaCollectionOption?: IGeoObjectOptions;
    yaClusterOption?: IClustererOptions;
    clusterCollection?: objectManager.ClusterCollection;
    points?: IPointMap[];
    polygon?: IYaPointMap[] = [];
    geoObjectPolygons: IGeoObjectPolygon[] = [];
    #countInitPolygons = 0;

    $onInit = () => {
        this.yaCollectionOption = Object.assign(this.defaultCollectionOptions, this.yaCollectionOption);
        this.yaClusterOption = Object.assign(this.defaultClasterOptions, this.yaClusterOption);
        this.mapApiLoad.addCallback(() => {
            this.showMap();
            // this.$scope.$apply();
        });
    };

    handleAfterInitMap = ($target: Map) => {
        this._map = $target;
        // if (!this.points?.length) {
        // this.showMap();
        // }

        this.yaAfterInit?.({ $target });
    };

    showMap = () => {
        this.isLoadedMap = true;
    };

    handleGeoObject = ($event: IEvent) => {
        const objectId = $event.get('objectId');
        const object = this.collection?.objects.getById(objectId);

        if (!object) {
            const cluster = this.collection?.clusters.getById(objectId);
            const objects = cluster?.properties.geoObjects;
            // @ts-ignore
            const coords = cluster?.geometry.coordinates as number[];

            if (objects && this.hasDuplicateCoordinates(objects)) {
                this.showSelectGeoObjectDialog(objects, coords);
            }
        } else {
            this.yaGeoObjectEventClick?.({ balloon: object });
        }
        this.checkDeliveryPointInPolygon(this.collection);
    };

    hasDuplicateCoordinates = (geoObjectsArray: IGeoObject[]): boolean => {
        const coordinatesSet = new Set();
        return geoObjectsArray.some((obj) => {
            // @ts-ignore
            const coords = obj.geometry.coordinates;
            const coordString = JSON.stringify(coords);
            if (coordinatesSet.has(coordString)) return true;
            coordinatesSet.add(coordString);
            return false;
        });
    };

    showSelectGeoObjectDialog = (objects: IGeoObject[], coords: number[]) => {
        const zoom = this._map?.getZoom();
        if (zoom && zoom >= 21) {
            const balloonContent = objects
                .map(
                    (obj) =>
                        /* @ts-ignore */
                        `<div class="m-b-sm">${obj.properties.balloonContent}<button data-shipping-id="${obj.id}" type="button" class="btn btn-small btn-action m-t-sm">Показать</button></div>`,
                )
                .join('');
            this._map?.balloon.open(coords, { contentBody: `<div>${balloonContent}</div>` }).then(() => this.bindBalloonEvents(objects));
        }
    };

    bindBalloonEvents = (clusterObjects: IGeoObject[]) => {
        // @ts-ignore
        const balloonElement = this._map?.balloon.getOverlaySync()?.getElement();
        if (!balloonElement) return;

        const onClickBalloonHandler = (event: Event) => {
            event.stopPropagation();
            const target = event.target as HTMLElement;
            const { shippingId } = target.dataset;
            if (shippingId) {
                // @ts-ignore
                const geoObj = clusterObjects.find((it) => it.id === shippingId);
                if (geoObj) {
                    this.yaGeoObjectEventClick?.({ balloon: geoObj, fromCluster: true });
                    this.$scope.$apply();
                }
            }
        };

        const onCloseBalloonHandler = () => {
            balloonElement.removeEventListener('click', onClickBalloonHandler);
            this._map?.events.remove('balloonclose', onCloseBalloonHandler);
        };

        this._map?.events.remove('balloonclose', onCloseBalloonHandler);
        this._map?.events.add('balloonclose', onCloseBalloonHandler);
        balloonElement.addEventListener('click', onClickBalloonHandler);
    };

    initGeoObjectPolygon = ($target: IGeoObjectPolygon) => {
        this.geoObjectPolygons.push($target);
        this.#countInitPolygons++;
        if (this.#countInitPolygons === this.polygon?.length) {
            this.showMap();
            this.yaGeoObjectPolygonsAfterInit?.({ polygons: [...this.geoObjectPolygons] });
            this.#countInitPolygons = 0;
            this.geoObjectPolygons.length = 0;
        }
    };

    setCollection = ($target: ObjectManager) => {
        this.collection = $target;
        this.yaCollectionAfterInit?.({ $target });
        this.showMap();
    };

    setCluster = ($target: objectManager.ClusterCollection) => {
        this.clusterCollection = $target;
        this.yaClusterCollectionAfterInit?.({ $target });
    };

    checkDeliveryPointInPolygon = (collection) => {
        // ymaps.geoQuery(collection);
        // var polygon = this._map?.searchContaining(coords).get(0);
        //
        // if (polygon) {
        //     ctrl.deliveryPoint.options.set('iconColor', polygon.properties.get('fill'));
        //     ctrl.deliveryPoint.properties.set({ iconCaption: 'Доставим сюда' });
        // } else {
        //     ctrl.deliveryPoint.options.set('iconColor', 'black');
        //     ctrl.deliveryPoint.properties.set({ iconCaption: 'Сюда не доставляем' });
    };
}
