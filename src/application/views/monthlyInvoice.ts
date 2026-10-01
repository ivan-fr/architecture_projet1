import { Money } from '../../domain/money.ts';
import { priceOfRide, STANDARD_TARIFF, type Tarif } from '../../domain/pricing.ts';
import type { Ride } from '../../domain/ride.ts';

export interface InvoiceLine {
  rideId: string;
  minutes: number;
  price: string;
}

/** La facture mensuelle : une ligne par trajet, et le total. */
export interface Invoice {
  lines: InvoiceLine[];
  total: string;
}

/** La facture ne calcule rien : chaque ligne vient de la règle, la même que pour le ticket. */
export function monthlyInvoice(rides: ReadonlyArray<Ride>, tarif: Tarif = STANDARD_TARIFF): Invoice {
  const priced = rides.map((ride) => ({ ride, price: priceOfRide(ride.minutes, ride.riderType, tarif) }));
  const total = priced.reduce((sum, { price }) => sum.plus(price), Money.cents(0));

  return {
    lines: priced.map(({ ride, price }) => ({ rideId: ride.id, minutes: ride.minutes, price: price.toString() })),
    total: total.toString(),
  };
}
