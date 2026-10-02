import { priceOfRide } from '../../domain/pricing.ts';
import type { CustomerType } from '../../domain/pricing.ts';

const CENTS_PER_EURO = 100;

/** Le prix d'un trajet en euros, pour qui le demande avant de partir. Le calcul reste celui du domaine. */
export function computePrice(time: number, riderType: CustomerType = 'non-subscriber'): number {
    return priceOfRide(time, riderType).cents / CENTS_PER_EURO;
}
