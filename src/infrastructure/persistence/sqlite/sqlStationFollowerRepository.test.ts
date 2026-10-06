import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { stationFollowerRepositoryContract } from '../../../testing/stationFollowerRepository.contract.ts';
import type { DatabaseSync } from 'node:sqlite';
import { Station } from '../../../domain/station.ts';
import { userOf } from '../../../domain/user.ts';
import { sqlStationRepository } from './sqlStationRepository.ts';
import { sqlUserRepository } from './sqlUserRepository.ts';
import { openDatabase } from './sqliteDatabase.ts';
import { sqlStationFollowerRepository } from './sqlStationFollowerRepository.ts';

async function seed(database: DatabaseSync) {
    for (const id of ['u1', 'u2']) await sqlUserRepository(database).add(userOf({ id, name: id, email: `${id}@beaulieu.fr`, riderType: 'subscriber' }));
    for (const id of ['gare', 'mairie']) await sqlStationRepository(database).save(Station.of({ id, docks: 2 }));
}

stationFollowerRepositoryContract('sqlStationFollowerRepository', async (t) => {
    const database = openDatabase();
    t.after(() => database.close());
    await seed(database);
    return sqlStationFollowerRepository(database);
});

test('les suivis survivent à une nouvelle connexion et ne sont pas dupliqués', async (t) => {
    const folder = await mkdtemp(join(tmpdir(), 'velos-followers-'));
    t.after(() => rm(folder, { recursive: true, force: true }));
    const path = join(folder, 'beaulieu.sqlite');
    const before = openDatabase(path);
    try { await seed(before); await sqlStationFollowerRepository(before).follow({ userId: 'u1', stationId: 'gare' }); }
    finally { before.close(); }
    // La base est fermée avant la fin du test : sous Windows, un fichier SQLite ouvert ne peut pas être effacé.
    const after = openDatabase(path);
    let followers;
    try {
        await sqlStationFollowerRepository(after).follow({ userId: 'u1', stationId: 'gare' });
        followers = await sqlStationFollowerRepository(after).followersOf('gare');
    } finally { after.close(); }
    assert.deepEqual(followers, ['u1']);
});
