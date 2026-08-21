import type { Camelize } from '../../@types/generics';
import './styles/wishlist.scss';
import WishlistModule from './wishlist';
import './controllers/WishlistControlController';
import './controllers/wishlistCountController';
import './directives/wishlistDirectives';
import './services/wishlistService';

export type OfferIdType = number;
export type WishlistCountType = Camelize<WishlistCountResponseType>;
export interface WishlistCountResponseType {
    Count: number;
    CountString: string;
}

export default WishlistModule;
