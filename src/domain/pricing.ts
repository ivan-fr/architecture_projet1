import { Money } from './money.ts';

export type CustomerType = 'subscriber' | 'non-subscriber';

/** Ce qui fixe le prix d'un trajet. Changer de prix, c'est changer un tarif, pas la règle. */
export interface Tarif {
  pricePerHalfHour: Money;
}

const HALF_HOUR_IN_MINUTES = 30;
const FREE_HALF_HOURS_FOR_SUBSCRIBERS = 1;

/** Le tarif en vigueur. Le seul endroit où s'écrit le prix de la demi-heure. */
export const STANDARD_TARIFF: Tarif = { pricePerHalfHour: Money.euros(1) };

/** Le prix d'un trajet : chaque demi-heure entamée est due, la première est offerte aux abonnés. */
export function priceOfRide(minutes: number, riderType: CustomerType = 'non-subscriber', tarif: Tarif = STANDARD_TARIFF): Money {
  if (minutes <= 0) return Money.cents(0);

  const halfHours = Math.ceil(minutes / HALF_HOUR_IN_MINUTES);
  const freeHalfHours = riderType === 'subscriber' ? FREE_HALF_HOURS_FOR_SUBSCRIBERS : 0;
  const billableHalfHours = Math.max(halfHours - freeHalfHours, 0);

  return tarif.pricePerHalfHour.times(billableHalfHours);
}
