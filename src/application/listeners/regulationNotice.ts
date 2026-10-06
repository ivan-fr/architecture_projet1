import type { StationBoundaryEvent } from '../../domain/events.ts';

/** Ce qu'on dit à la régulation, quel que soit le canal. */
export interface RegulationNotice {
  subject: string;
  body: string;
}

/** Le texte du message, écrit à un seul endroit : le mail et le SMS disent la même chose. */
export function regulationNotice(event: StationBoundaryEvent): RegulationNotice {
  const state = event.type === 'StationEmpty' ? 'vide' : 'pleine';
  return {
    subject: `Station ${event.stationId} ${state}`,
    body: `La station ${event.stationId} est devenue ${state}. Une intervention de régulation est nécessaire.`,
  };
}
