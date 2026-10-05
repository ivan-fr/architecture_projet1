import type { CustomerType } from './pricing.ts';

const MILLISECONDS_PER_MINUTE = 60 * 1000;

/** Un trajet terminé : ce qu'il faut savoir pour le facturer. */
export interface Ride {
  id: string;
  minutes: number;
  riderType: CustomerType;
}

interface RideDates {
  id: string;
  riderType: CustomerType;
  startedAt: Date;
  endedAt: Date;
}

const isValidDate = (date: Date) => !Number.isNaN(date.getTime());

/** Un trajet terminé, à partir de ses deux dates. Un trajet ne peut pas finir avant d'avoir commencé. */
export function rideBetween({ id, riderType, startedAt, endedAt }: RideDates): Ride {
  if (!isValidDate(startedAt) || !isValidDate(endedAt)) throw new Error(`ride ${id} has an invalid date`);
  if (endedAt.getTime() < startedAt.getTime()) throw new Error(`ride ${id} cannot end before it started`);
  return { id, riderType, minutes: (endedAt.getTime() - startedAt.getTime()) / MILLISECONDS_PER_MINUTE };
}
