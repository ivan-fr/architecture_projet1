import { Station } from '../domain/station.ts';

export function copyStation(station: Station): Station {
  return Station.of({ id: station.id, docks: station.docks, bikes: station.bikes, brokenBikes: station.brokenBikes });
}

/** Refuse d'écraser un mouvement arrivé entre la lecture et la sauvegarde. */
export function assertCurrentStation(expected: Station, current: Station | undefined): void {
  if (!current || current.id !== expected.id || current.docks !== expected.docks ||
      JSON.stringify(current.bikes) !== JSON.stringify(expected.bikes) ||
      JSON.stringify(current.brokenBikes) !== JSON.stringify(expected.brokenBikes)) {
    throw new Error(`station ${expected.id} changed since it was read`);
  }
}
