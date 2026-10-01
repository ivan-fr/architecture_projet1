import { priceOfRide } from '../../domain/pricing.ts';
import type { CustomerType } from '../../domain/pricing.ts';

export function computePrice(time: number, riderType: CustomerType = 'non-subscriber'): number {
    return priceOfRide(time, riderType);
}
