import type { CustomerType } from './pricing.ts';

/** Un trajet terminé : ce qu'il faut savoir pour le facturer. */
export interface Ride {
  id: string;
  minutes: number;
  riderType: CustomerType;
}
