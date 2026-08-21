import { ICoords } from '../../@types/location';
import { MakeOptional } from '../../@types/generics';
import { IDataManager, IGeoObject, IPolygonGeometry, Map } from 'yandex-maps';
import { IController } from 'angular';

export interface IGeometry {
    type: string;
    coordinates: ICoords;
}

export interface IStore {
    address?: string;
    addressComment?: string;
    name: string;
    stock?: string | undefined;
    stockColor?: string | undefined;
    type?: string | null;
    workTime?: string[];
}

export interface IYaPointMap {
    id: number | string;
    properties: { balloonContent?: string } & Record<string, any>;
    geometry: IGeometry;
}

export interface IGeoObjectPolygon extends IGeoObject<IPolygonGeometry> {
    properties: IDataManager & { deliveryTime: string };
}

export interface IPointMap<T = any> extends MakeOptional<IYaPointMap, 'geometry'> {
    store: IStore;
    type: string;
    original: T;
}

interface OnInitPointsListMapCbParamsType {
    $target?: Map;
    pointsListMapCtrl: IController;
}

export type OnInitPointsListMapCbType = ({ $target, pointsListMapCtrl }: OnInitPointsListMapCbParamsType) => void;
