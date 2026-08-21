import AimControl from '../../../_common/yandexMaps/aimControl';
import type { IController, ITimeoutService } from 'angular';
import { AddressValue } from '../../../@types/location';
import type { Map } from 'yandex-maps';
import { IZoneMapService } from '../services/zoneMapService';

export interface IZoneMapController extends IController {
    address: AddressValue | undefined;
    set disabledSetAddressBtn(active: boolean);
    initAddress(address: AddressValue | undefined): void;
    onInitMap(target: Map): Promise<void>;
    onActionEndMap(): Promise<void>;
    setAddressFromMap(): Promise<void>;
    clearGeoLocationSearch(): void;
}

export default class ZoneMapController implements IZoneMapController {
    skipAction = false;
    mapControls = 'zoomControl';
    mapZoom = 17;
    isLoadedMap = false;
    private _disabledSetAddressBtn = true;
    private map: Map | undefined;
    address: AddressValue | undefined = undefined;
    /* @ngInject */

    constructor(
        private readonly $timeout: ITimeoutService,
        private readonly zoneMapService: IZoneMapService,
    ) {}
    $onInit(): void {
        this.skipAction = false;
        this.mapControls = 'zoomControl';
        this.mapZoom = 17;
        this.isLoadedMap = false;
        this.disabledSetAddressBtn = !this.address;
    }

    set disabledSetAddressBtn(active: boolean) {
        this._disabledSetAddressBtn = active;
    }

    initAddress = (address: AddressValue | undefined): void => {
        this.address = address;
    };

    onInitMap = async (target: Map): Promise<void> => {
        this.map = target;
        // @ts-ignore
        this.map.controls.add(new AimControl());
        this.isLoadedMap = true;
        if (this.address?.Value == null) {
            await this.setAddressFromMap();
        }
    };
    onActionEndMap = async (): Promise<void> => {
        if (!this.skipAction) {
            await this.setAddressFromMap();
        }
        this.skipAction = false;
    };

    setAddressFromMap = async (): Promise<void> => {
        const coords = this.map?.getCenter();
        if (coords != undefined) {
            const [lon, lat] = coords;
            try {
                const addressValue = await this.zoneMapService.getAddressByCoords({ Latitude: lat.toString(), Longitude: lon.toString() });
                this.$timeout(() => {
                    this.address = addressValue;
                    this.disabledSetAddressBtn = !this.address;
                });
            } catch (e) {
                console.error(e.message);
            }
        }
    };

    clearGeoLocationSearch = (): void => {
        if (this.address !== undefined && this.address.Value) {
            this.address.Value = '';
            this.disabledSetAddressBtn = !this.address?.Value;
        }
    };
}
