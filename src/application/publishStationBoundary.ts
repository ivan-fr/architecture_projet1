import type { Station } from '../domain/station.ts';
import type { EventPublisher } from '../domain/ports/eventBus.ts';
import { stationBoundary } from '../domain/stationBoundary.ts';

/** Appelé seulement après sauvegarde : une panne de notification ne transforme pas le succès en refus. */
export async function publishStationBoundary(events: EventPublisher | undefined, before: Station, after: Station): Promise<void> {
  if (!events) return;
  for (const event of stationBoundary(before, after)) {
    try { await events.publish(event); }
    catch { /* Le bus local conserve les erreurs d'auditeur dans failures. */ }
  }
}
