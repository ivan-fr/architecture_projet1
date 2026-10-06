import type { Station } from '../domain/station.ts';
import type { EventPublisher } from '../domain/ports/eventBus.ts';
import { stationBoundary } from '../domain/stationBoundary.ts';

/**
 * Appelé seulement après sauvegarde : une panne de notification ne transforme pas le succès en refus.
 * Mais elle ne disparaît pas non plus : elle est signalée.
 */
export async function publishStationBoundary(
  events: EventPublisher,
  before: Station,
  after: Station,
  report: (error: unknown) => void = (error) => console.error('station event could not be published:', error),
): Promise<void> {
  for (const event of stationBoundary(before, after)) {
    try {
      await events.publish(event);
    } catch (error) {
      report(error);
    }
  }
}
