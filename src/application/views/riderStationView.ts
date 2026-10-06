import type { Station } from '../../domain/station.ts';

/** Ce que l'appli montre à l'usager pour choisir sa station. Trois champs, et rien d'autre. */
export interface RiderStationView {
  stationId: string;
  availableBikes: number;
  freeDocks: number;
}

/**
 * La vue de l'usager. Elle est construite champ par champ, jamais en recopiant la station :
 * ni les vélos en panne ni l'état des bornes ne peuvent s'y glisser, même par accident.
 */
export function riderStationView(station: Station): RiderStationView {
  return { stationId: station.id, availableBikes: station.availableBikes, freeDocks: station.freeDocks };
}
