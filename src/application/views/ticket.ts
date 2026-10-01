import { priceOfRide, STANDARD_TARIFF, type Tarif } from '../../domain/pricing.ts';
import type { Ride } from '../../domain/ride.ts';

/** Ce qu'imprime la borne au retour du vélo. */
export interface Ticket {
  rideId: string;
  minutes: number;
  price: string;
}

/** Le ticket ne calcule rien : il affiche le prix que donne la règle, la même que pour la facture. */
export function ticketFor(ride: Ride, tarif: Tarif = STANDARD_TARIFF): Ticket {
  return {
    rideId: ride.id,
    minutes: ride.minutes,
    price: priceOfRide(ride.minutes, ride.riderType, tarif).toString(),
  };
}
