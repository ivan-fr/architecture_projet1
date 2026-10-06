import { Money } from './money.ts';
import { assertValidMinutes, priceOfRide, STANDARD_TARIFF, type CustomerType, type Tarif } from './pricing.ts';

/** Un tarif : un nom, et le prix d'un trajet de cette durée. */
export interface Rate {
  name: string;
  priceOf(minutes: number, riderType: CustomerType): Money;
}

/** Un tarif à la demi-heure entamée. Il reprend la règle des demandes 1 et 2, première demi-heure offerte aux abonnés. */
export function perHalfHour(name: string, tarif: Tarif): Rate {
  return { name, priceOf: (minutes, riderType) => priceOfRide(minutes, riderType, tarif) };
}

/** Un forfait : le même prix pour tout trajet, quelle que soit sa durée. */
export function flatFee(name: string, price: Money): Rate {
  return {
    name,
    priceOf: (minutes) => {
      assertValidMinutes(minutes);
      return price;
    },
  };
}

const ELECTRIC_TARIFF: Tarif = { pricePerHalfHour: Money.euros(2) };
const TOURIST_PASS_PRICE = Money.euros(5);

/** Les tarifs proposés. Ajouter un tarif, c'est ajouter une ligne ici, sans toucher à `rateNamed`. */
export const RATES: ReadonlyArray<Rate> = [
  perHalfHour('classic', STANDARD_TARIFF),
  perHalfHour('electric', ELECTRIC_TARIFF),
  flatFee('tourist', TOURIST_PASS_PRICE),
];

/** Le tarif qui porte ce nom. Ne connaît aucun tarif en particulier ; un nom inconnu est refusé. */
export function rateNamed(name: string, rates: ReadonlyArray<Rate> = RATES): Rate {
  const rate = rates.find((candidate) => candidate.name === name);
  if (!rate) throw new Error(`unknown rate "${name}"`);
  return rate;
}
