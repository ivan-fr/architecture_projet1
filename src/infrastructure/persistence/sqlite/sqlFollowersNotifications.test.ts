import test, { type TestContext } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { openDatabase } from './sqliteDatabase.ts';
import { seedFollowedStations, sqlFollowedStationService } from './testing/followedStationService.ts';

async function savedFollows(t: TestContext): Promise<string> {
    const folder = await mkdtemp(join(tmpdir(), 'velos-notifications-'));
    t.after(() => rm(folder, { recursive: true, force: true }));
    const path = join(folder, 'beaulieu.sqlite');
    const database = openDatabase(path);
    try {
        await seedFollowedStations(database);
        const { follow } = sqlFollowedStationService(database);
        await follow.handle({ userId: 'u1', stationId: 'gare' });
        await follow.handle({ userId: 'u2', stationId: 'mairie' });
    } finally { database.close(); }
    return path;
}

test('SQL : après redémarrage, le trajet déclenche mail et appli pour les bons suiveurs', async (t) => {
    const path = await savedFollows(t);
    const database = openDatabase(path);
    t.after(() => database.close());
    const { take, back, letters, app, rides } = sqlFollowedStationService(database);
    await take.handle({ userId: 'u3', stationId: 'gare' });
    await back.handle({ userId: 'u3', stationId: 'mairie' });
    assert.deepEqual(app.notifications, [{ userId: 'u1', stationId: 'gare', type: 'StationEmpty' }, { userId: 'u2', stationId: 'mairie', type: 'StationFull' }]);
    assert.equal(letters.length, 2);
    assert.equal(await rides.ofUser('u3'), undefined);
});

test('SQL : l’écriture refusée du trajet ne déclenche ni mail ni appli', async (t) => {
    const database = openDatabase();
    t.after(() => database.close());
    await seedFollowedStations(database);
    const { take, follow, letters, app, movements, rides } = sqlFollowedStationService(database);
    await follow.handle({ userId: 'u1', stationId: 'gare' });
    database.exec("create trigger refuse_ride before insert on rides begin select raise(abort, 'ride write failed'); end");
    await assert.rejects(() => take.handle({ userId: 'u3', stationId: 'gare' }), /write failed/);
    assert.deepEqual(app.notifications, []);
    assert.deepEqual(letters, []);
    assert.deepEqual((await movements.byStation('gare'))?.bikes, ['b1']);
    assert.equal(await rides.ofUser('u3'), undefined);
});
