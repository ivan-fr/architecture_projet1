import { priceOfRide } from '../../domain/pricing.ts';

export function computePrice(time: number) {
    return priceOfRide(time);
}