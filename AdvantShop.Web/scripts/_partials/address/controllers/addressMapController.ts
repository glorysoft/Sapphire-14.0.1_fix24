import AimControl from '../../../_common/yandexMaps/aimControl';
import { Map, IMapOptions, IEvent } from 'yandex-maps';
import type { IApiMapService } from '../../../_common/apiMap/apiMap.service';
import type { IController, translate } from 'angular';
import { IDeliveryZone, IFeature } from '../../shipping/types';
import { isResponseError } from '../../../@types/http';
import { IGeoObjectPolygon } from '../../../_common/points-list-map/types';
import ShippingService from '../../shipping/services/shipping.service';

type ActionEndType = ((center: { center: number[] | undefined }) => unknown) | null;
type OnCheckDeliveryZoneType = ({ isContain, polygon }: { isContain: boolean; polygon?: IGeoObjectPolygon }) => void;
type OnAfterInitMapType = ({ $target }: { $target: Map }) => void;
export default class AddressMapController implements IController {
    private map: Map | undefined;
    private skipAction = false;
    private mapControls = 'zoomControl';
    zoom = 17;
    private isLoadedMap = false;
    private mapOptions: IMapOptions | null = null;
    private apiKey: string | null = null;
    actionEnd: ActionEndType = null;
    cityId?: number;
    geoObjectPolygons: IGeoObjectPolygon[] = [];
    geoObjectsDeliveryZones?: IFeature[];
    aimControl?: any;
    onCheckDeliveryZone?: OnCheckDeliveryZoneType;
    onAfterInitMap?: OnAfterInitMapType;

    /* @ngInject */
    constructor(
        private readonly apiMapService: IApiMapService,
        private readonly shippingService: any,
        private readonly $scope: any,
        private readonly $translate: translate.ITranslateService,
        private readonly yandexMapsService: any,
    ) {}

    $onInit() {
        this.mapOptions = {
            suppressMapOpenBlock: true,
        };
        this.apiKey = this.apiMapService.getMapApiKey();
        this.getDeliveryZones(this.cityId).then((deliveryZones) => {
            this.geoObjectsDeliveryZones = this.getGeoObjectsDeliveryZones(deliveryZones);
            this.$scope.$apply();
        });
    }

    onInitMap = async ($target: Map): Promise<void> => {
        this.map = $target;
        this.aimControl = new AimControl();
        this.map.controls.add(this.aimControl);
        this.map.events.add('actionend', this.onActionEndMap);
        this.onAfterInitMap && this.onAfterInitMap({ $target });
    };

    onActionEndMap = ($event: IEvent) => {
        const center = this.map?.getCenter();
        if (center) {
            this.actionEnd && this.actionEnd({ center });
            this.checkDeliveryPointInPolygon(center);
        }
    };

    async getDeliveryZones(cityId?: number): Promise<IDeliveryZone[]> {
        const response = await this.shippingService.getDeliveryZones(cityId);
        if (!isResponseError(response)) {
            return response.obj;
        } 
            throw new Error(response.errors.join(' '));
        
    }

    getGeoObjectsDeliveryZones = (deliveryZones: IDeliveryZone[]) => this.shippingService.getGeoObjectsDeliveryZones(deliveryZones);

    initGeoObjectPolygons = (polygons: IGeoObjectPolygon[]) => {
        this.geoObjectPolygons = polygons;
        const center = this.map?.getCenter();
        if (center && this.geoObjectPolygons.length > 0) {
            this.checkDeliveryPointInPolygon(center);
        }
    };

    checkDeliveryPointInPolygon = (coords: number[]) => {
        const { isContain, currentPolygon } = this.yandexMapsService.checkPointInPolygons(coords, this.geoObjectPolygons);

        // @ts-ignore
        const polygonProperties: IGeoObjectPolygon['properties'] = currentPolygon?.properties.getAll();
        const deliveryTime = polygonProperties?.deliveryTime;

        const aimControlText = isContain
            ? deliveryTime?.length > 0
                ? deliveryTime
                : 'Js.Address.ZoneDelivery.Deliver'
            : 'Js.Address.ZoneDelivery.NotDeliver';
        this.aimControl.setText(this.$translate.instant(aimControlText));

        this.onCheckDeliveryZone && this.onCheckDeliveryZone({ isContain, polygon: currentPolygon });
    };
}
