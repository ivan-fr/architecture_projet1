import type { Station } from './station.ts';
import type { StationBoundaryEvent } from './events.ts';

/** Un événement décrit une transition, pas un état qu'on relit plusieurs fois. */
export function stationBoundary(before: Station, after: Station): StationBoundaryEvent[] {
  if (before.id !== after.id) throw new Error('a station transition needs the same station');
  // « Vide » pour la régulation : plus aucun vélo à prendre. Des vélos en panne à quai n'y changent rien.
  if (before.availableBikes > 0 && after.availableBikes === 0) return [{ type: 'StationEmpty', stationId: after.id }];
  if (before.freeDocks > 0 && after.freeDocks === 0) return [{ type: 'StationFull', stationId: after.id }];
  return [];
}
