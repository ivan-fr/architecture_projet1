import type { Station } from '../../domain/station.ts';

/** L'état d'une borne : libre, occupée par un vélo en état, ou par un vélo en panne. */
export type DockState = { dock: number; state: 'free' } | { dock: number; state: 'available' | 'broken'; bikeId: string };

/** Ce que reçoit l'exploitant. Elle peut grandir sans toucher à la vue de l'usager : ce sont deux types distincts. */
export interface OperatorStationView {
  stationId: string;
  docks: DockState[];
  brokenBikes: string[];
}

/**
 * La vue de l'exploitant. Les bornes sont numérotées à partir de 1, occupées dans l'ordre où les vélos sont à quai :
 * le modèle ne connaît pas encore le numéro physique de chaque borne.
 */
export function operatorStationView(station: Station): OperatorStationView {
  const bikes = station.bikes;
  const broken = new Set(station.brokenBikes);

  const docks = Array.from({ length: station.docks }, (_, index): DockState => {
    const bikeId = bikes[index];
    if (bikeId === undefined) return { dock: index + 1, state: 'free' };
    return { dock: index + 1, state: broken.has(bikeId) ? 'broken' : 'available', bikeId };
  });

  return { stationId: station.id, docks, brokenBikes: [...station.brokenBikes] };
}
