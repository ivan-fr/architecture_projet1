import test, { type TestContext } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { Station } from '../../../domain/station.ts';
import { aUser } from '../../../testing/builders.ts';
import { ongoingRideRepositoryContract } from '../../../testing/ongoingRideRepository.contract.ts';
import { userRepositoryContract } from '../../../testing/userRepository.contract.ts';
import { openDatabase } from './sqliteDatabase.ts';
import { sqlOngoingRideRepository } from './sqlOngoingRideRepository.ts';
import { sqlStationRepository } from './sqlStationRepository.ts';
import { sqlUserRepository } from './sqlUserRepository.ts';

/** Un fichier de base neuf, dans un dossier neuf, effacé à la fin : aucun test ne dépend d'un autre. */
async function freshDatabaseFile(t: TestContext): Promise<string> {
    const folder = await mkdtemp(join(tmpdir(), 'velos-'));
    t.after(() => rm(folder, { recursive: true, force: true }));
    return join(folder, 'beaulieu.sqlite');
}

//DEMANDE 10 : les tests déjà écrits passent sans être modifiés, contre la base SQL
userRepositoryContract('sqlUserRepository', async () => sqlUserRepository(openDatabase()));
ongoingRideRepositoryContract('sqlOngoingRideRepository', async () => sqlOngoingRideRepository(openDatabase()));

//DEMANDE 10
test('une station enregistrée est relue avec ses vélos, après un redémarrage', async (t) => {
    const path = await freshDatabaseFile(t);
    const before = openDatabase(path);
    await sqlStationRepository(before).save(Station.of({ id: 'gare', docks: 20, bikes: ['b1', 'b2', 'b3'] }));
    before.close();

    const after = openDatabase(path);
    const station = await sqlStationRepository(after).byId('gare');
    after.close();

    assert.equal(station?.docks, 20);
    assert.deepEqual(station?.bikes, ['b1', 'b2', 'b3']);
});

test('une station relue garde sa règle : elle refuse toujours le vélo de trop', async () => {
    const stations = sqlStationRepository(openDatabase());
    await stations.save(Station.of({ id: 'mairie', docks: 2, bikes: ['b1', 'b2'] }));

    const station = await stations.byId('mairie');

    assert.throws(() => station?.returnBike('b3'), /full/);
});

test('enregistrer une station déjà connue remplace ses vélos', async () => {
    const stations = sqlStationRepository(openDatabase());
    const station = Station.of({ id: 'gare', docks: 20, bikes: ['b1', 'b2'] });
    await stations.save(station);
    station.takeBike();
    station.returnBike('b9');

    await stations.save(station);

    assert.deepEqual((await stations.byId('gare'))?.bikes, ['b2', 'b9']);
});

test('chercher une station inconnue donne une réponse claire, pas un plantage', async () => {
    assert.equal(await sqlStationRepository(openDatabase()).byId('inconnue'), undefined);
});

test('une station écrite à la main dans la base avec trop de vélos est refusée à la relecture', async () => {
    const database = openDatabase();
    database.exec(`insert into stations (id, docks) values ('gare', 1)`);
    database.exec(`insert into station_bikes (station_id, bike_id, position) values ('gare', 'b1', 0), ('gare', 'b2', 1)`);

    await assert.rejects(() => sqlStationRepository(database).byId('gare'), /full/);
});

//DEMANDE 11 : les pannes survivent à la relecture
test('une station relue garde ses vélos en panne', async () => {
    const stations = sqlStationRepository(openDatabase());
    await stations.save(Station.of({ id: 'gare', docks: 20, bikes: ['b1', 'b2', 'b3'], brokenBikes: ['b2'] }));

    const station = await stations.byId('gare');

    assert.deepEqual(station?.brokenBikes, ['b2']);
    assert.equal(station?.availableBikes, 2);
});

test('un usager enregistré est retrouvé après un redémarrage de la base', async (t) => {
    const path = await freshDatabaseFile(t);
    const before = openDatabase(path);
    await sqlUserRepository(before).add(aUser().build());
    before.close();

    const after = openDatabase(path);
    const found = await sqlUserRepository(after).byId('u1');
    after.close();

    assert.equal(found?.email, 'lina@beaulieu.fr');
});
