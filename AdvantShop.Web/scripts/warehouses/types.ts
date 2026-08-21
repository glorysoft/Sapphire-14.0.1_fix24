import { ICoordsObj } from '../@types/location';
import { NullableProperty } from '../@types/generics';

export interface IWarehouse extends NullableProperty<ICoordsObj> {
    Name: string;
    Type: string;
    Address: string;
    TimeOfWorkList: string[];
    AddressComment: string;
}

export interface IWarehousesCity {
    City: string;
    CityId: number;
}
