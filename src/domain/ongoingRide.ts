/** Un trajet commencé, pas encore terminé : qui roule, d'où il est parti, depuis quand. */
export interface OngoingRide {
  userId: string;
  fromStationId: string;
  startedAt: Date;
}

interface RideStart {
  userId: string;
  stationId: string;
  now: Date;
  /** Le trajet que l'usager a déjà en cours, s'il en a un. */
  current: OngoingRide | undefined;
}

const isFilled = (value: unknown): value is string => typeof value === 'string' && value.trim() !== '';

/** Le seul chemin vers un trajet en cours : ce qui ne peut pas en être un est refusé ici. */
export function ongoingRideOf({ userId, fromStationId, startedAt }: OngoingRide): OngoingRide {
  if (!isFilled(userId)) throw new Error('an ongoing ride needs a user');
  if (!isFilled(fromStationId)) throw new Error(`the ride of ${userId} needs a station`);
  if (!(startedAt instanceof Date) || Number.isNaN(startedAt.getTime())) throw new Error(`the ride of ${userId} has an invalid date`);
  return { userId, fromStationId, startedAt };
}

/** La règle du départ : un usager ne roule que sur un vélo à la fois. */
export function startRide({ userId, stationId, now, current }: RideStart): OngoingRide {
  if (current) throw new Error(`${userId} is already riding since ${current.startedAt.toISOString()}`);
  return ongoingRideOf({ userId, fromStationId: stationId, startedAt: now });
}
