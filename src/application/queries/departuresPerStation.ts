import type { Clock } from '../../domain/ports/clock.ts';
import type { DepartureReads, StationDepartures } from './ports/departureReads.ts';

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;
/** La période que regarde l'élue pour décider où ajouter des bornes. */
const WINDOW_IN_DAYS = 30;

interface Dependencies {
  reads: DepartureReads;
  clock: Clock;
}

/** Les trajets partis de chaque station sur les 30 derniers jours. Une fenêtre, un tri : aucune règle métier. */
export class DeparturesPerStationHandler {
  readonly #reads: DepartureReads;
  readonly #clock: Clock;

  constructor({ reads, clock }: Dependencies) {
    this.#reads = reads;
    this.#clock = clock;
  }

  async handle(): Promise<StationDepartures[]> {
    const now = this.#clock.now();
    const from = new Date(now.getTime() - WINDOW_IN_DAYS * MILLISECONDS_PER_DAY);
    const counts = await this.#reads.between(from, now);
    return [...counts].sort((a, b) => b.departures - a.departures || a.stationId.localeCompare(b.stationId));
  }
}
