import { priceOfRide } from '../../domain/pricing.ts';
import type { CustomerType } from '../../domain/pricing.ts';

export function computePrice(time: number,riderType:CustomerType) {
    return priceOfRide(time,riderType);
}