import type { DatabaseSync } from 'node:sqlite';
import type { DepartureReads, StationDepartures } from '../../../application/queries/ports/departureReads.ts';

interface CountRow {
  station_id: string;
  departures: number;
}

/**
 * Le côté lecture : une seule requête, qui compte en base. Aucune station ni aucun trajet n'est reconstruit.
 * Le `left join` part des stations : une station sans départ sort avec 0, au lieu de disparaître.
 */
export function sqlDepartureReads(database: DatabaseSync): DepartureReads {
  return {
    async between(from, to) {
      const rows = database
        .prepare(
          `select stations.id as station_id, count(rides.user_id) as departures
             from stations
             left join rides
               on rides.from_station_id = stations.id
              and rides.started_at between ? and ?
            group by stations.id`,
        )
        .all(from.toISOString(), to.toISOString()) as unknown as CountRow[];
      return rows.map((row): StationDepartures => ({ stationId: row.station_id, departures: Number(row.departures) }));
    },
  };
}
