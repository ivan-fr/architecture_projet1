/** Un lien entre un usager et une station, sans donnée personnelle. */
export interface StationFollow { userId: string; stationId: string; }

export function stationFollowOf({ userId, stationId }: StationFollow): StationFollow {
  if (typeof userId !== 'string' || userId.trim() === '') throw new Error('a station follow needs a user');
  if (typeof stationId !== 'string' || stationId.trim() === '') throw new Error('a station follow needs a station');
  return { userId, stationId };
}
