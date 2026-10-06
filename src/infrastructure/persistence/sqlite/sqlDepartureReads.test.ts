import test from 'node:test';
import assert from 'node:assert/strict';

import { Station } from '../../../domain/station.ts';
import { openDatabase } from './sqliteDatabase.ts';
import { sqlDepartureReads } from './sqlDepartureReads.ts';
import { sqlOngoingRideRepository } from './sqlOngoingRideRepository.ts';
import { sqlStationRepository } from './sqlStationRepository.ts';

const NOW = new Date('2026-10-31T12:00:00Z');
const daysAgo = (days: number) => new Date(NOW.getTime() - days * 24 * 60 * 60 * 1000);
const WINDOW: [Date, Date] = [daysAgo(30), NOW];

/** Une base avec trois stations, et des départs enregistrés par le vrai chemin d'écriture des trajets. */
async function city(departures: Array<{ userId: string; from: string; at: Date }>) {
    const database = openDatabase();
    const stations = sqlStationRepository(database);
    for (const id of ['gare', 'mairie', 'port']) await stations.save(Station.of({ id, docks: 20 }));
    const rides = sqlOngoingRideRepository(database);
    for (const { userId, from, at } of departures) await rides.save({ userId, fromStationId: from, startedAt: at });
    return sqlDepartureReads(database);
}

const countOf = (counts: Array<{ stationId: string; departures: number }>, stationId: string) =>
    counts.find((count) => count.stationId === stationId)?.departures;

//DEMANDE 12
test('3 trajets partis de la gare et 1 de la mairie : gare 3, mairie 1', async () => {
    const reads = await city([
        { userId: 'u1', from: 'gare', at: daysAgo(1) },
        { userId: 'u2', from: 'gare', at: daysAgo(5) },
        { userId: 'u3', from: 'gare', at: daysAgo(12) },
        { userId: 'u4', from: 'mairie', at: daysAgo(2) },
    ]);

    const counts = await reads.between(...WINDOW);

    assert.equal(countOf(counts, 'gare'), 3);
    assert.equal(countOf(counts, 'mairie'), 1);
});

test('un trajet d\'il y a 31 jours n\'est pas compté', async () => {
    const reads = await city([
        { userId: 'u1', from: 'gare', at: daysAgo(31) },
        { userId: 'u2', from: 'gare', at: daysAgo(3) },
    ]);

    assert.equal(countOf(await reads.between(...WINDOW), 'gare'), 1);
});

test('une station sans trajet : 0, sans erreur', async () => {
    const reads = await city([{ userId: 'u1', from: 'gare', at: daysAgo(1) }]);

    assert.equal(countOf(await reads.between(...WINDOW), 'port'), 0);
});

//LIMITES DEMANDE 12
test('un trajet parti il y a exactement 30 jours est compté', async () => {
    const reads = await city([{ userId: 'u1', from: 'mairie', at: daysAgo(30) }]);

    assert.equal(countOf(await reads.between(...WINDOW), 'mairie'), 1);
});

test('chaque départ compte, même quand le même usager repart plus tard', async () => {
    const reads = await city([
        { userId: 'u1', from: 'gare', at: daysAgo(10) },
        { userId: 'u1', from: 'gare', at: daysAgo(2) },
    ]);

    assert.equal(countOf(await reads.between(...WINDOW), 'gare'), 2);
});

test('un usager repart : son trajet en cours est le plus récent', async () => {
    const database = openDatabase();
    const rides = sqlOngoingRideRepository(database);
    await rides.save({ userId: 'u1', fromStationId: 'gare', startedAt: daysAgo(10) });
    await rides.save({ userId: 'u1', fromStationId: 'mairie', startedAt: daysAgo(2) });

    assert.equal((await rides.ofUser('u1'))?.fromStationId, 'mairie');
});
