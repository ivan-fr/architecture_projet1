import test from 'node:test';
import assert from 'node:assert/strict';

import type { DepartureReads } from './ports/departureReads.ts';
import { DeparturesPerStationHandler } from './departuresPerStation.ts';

const NOW = new Date('2026-10-31T12:00:00Z');
const THIRTY_DAYS_AGO = new Date('2026-10-01T12:00:00Z');
const clock = { now: () => NOW };

//DEMANDE 12
test('le comptage porte sur les 30 derniers jours, jusqu\'à maintenant', async () => {
    const asked: Array<[Date, Date]> = [];
    const reads: DepartureReads = {
        async between(from, to) {
            asked.push([from, to]);
            return [];
        },
    };

    await new DeparturesPerStationHandler({ reads, clock }).handle();

    assert.deepEqual(asked, [[THIRTY_DAYS_AGO, NOW]]);
});

test('les stations reviennent par nombre de trajets, la plus utilisée d\'abord', async () => {
    const reads: DepartureReads = {
        async between() {
            return [
                { stationId: 'mairie', departures: 1 },
                { stationId: 'port', departures: 0 },
                { stationId: 'gare', departures: 3 },
            ];
        },
    };

    const counts = await new DeparturesPerStationHandler({ reads, clock }).handle();

    assert.deepEqual(counts, [
        { stationId: 'gare', departures: 3 },
        { stationId: 'mairie', departures: 1 },
        { stationId: 'port', departures: 0 },
    ]);
});
