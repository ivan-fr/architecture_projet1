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

/** La règle du départ : un usager ne roule que sur un vélo à la fois. */
export function startRide({ userId, stationId, now, current }: RideStart): OngoingRide {
  if (current) throw new Error(`${userId} is already riding since ${current.startedAt.toISOString()}`);
  return { userId, fromStationId: stationId, startedAt: now };
}
