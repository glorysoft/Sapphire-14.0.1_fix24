import { ICornerMapCells } from '../../_partials/shipping/types';
import { Camelize } from '../../@types/generics';

export interface IMapService {
    isRectangleInside(rectangles: ICornerMapCells[], currentRectangle: Camelize<ICornerMapCells>): boolean;
    isPointInside(rectangles: ICornerMapCells[], latitude: number, longitude: number): boolean;
}

export class MapService implements IMapService {
    isRectangleInside = (rectangles: ICornerMapCells[], currentRectangle: Camelize<ICornerMapCells>) => (
            !this.isPointInside(rectangles, currentRectangle.upperCornerLatitude, currentRectangle.upperCornerLongitude) ||
            !this.isPointInside(rectangles, currentRectangle.lowerCornerLatitude, currentRectangle.lowerCornerLongitude)
        );

    isPointInside = (rectangles: ICornerMapCells[], latitude: number, longitude: number) => rectangles.some((rect) => (
                rect.UpperCornerLatitude >= latitude &&
                rect.UpperCornerLongitude <= longitude &&
                rect.LowerCornerLatitude < latitude &&
                rect.LowerCornerLongitude > longitude
            ));
}
