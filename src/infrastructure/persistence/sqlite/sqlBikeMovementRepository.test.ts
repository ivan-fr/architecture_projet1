import test from 'node:test';
import assert from 'node:assert/strict';
import { Station } from '../../../domain/station.ts';
import { aUser } from '../../../testing/builders.ts';
import { emailOf } from '../../../domain/email.ts';
import type { Letter } from '../../../domain/ports/mailer.ts';
import { bikeMovementRepositoryContract } from '../../../testing/bikeMovementRepository.contract.ts';
import { openDatabase } from './sqliteDatabase.ts';
import { sqlStationRepository } from './sqlStationRepository.ts';
import { sqlUserRepository } from './sqlUserRepository.ts';
import { sqlOngoingRideRepository } from './sqlOngoingRideRepository.ts';
import { sqlBikeMovementRepository } from './sqlBikeMovementRepository.ts';
import { inMemoryEventBus } from '../../in-memory/inMemoryEventBus.ts';
import { TakeBikeHandler } from '../../../application/use-cases/take-bike/takeBike.handler.ts';
import { ReturnBikeHandler } from '../../../application/use-cases/return-bike/returnBike.handler.ts';
import { regulationMail } from '../../../application/listeners/regulationMail.ts';

bikeMovementRepositoryContract('sqlBikeMovementRepository', async (t) => {
    const database = openDatabase();
    t.after(() => database.close());
    await sqlStationRepository(database).save(Station.of({ id: 'gare', docks: 1, bikes: ['b1'] }));
    return sqlBikeMovementRepository(database);
});

async function service(t: { after(action: () => void): void }, failMail = false) {
    const database = openDatabase();
    t.after(() => database.close());
    await sqlStationRepository(database).save(Station.of({ id: 'gare', docks: 1, bikes: ['b1'] }));
    const users = sqlUserRepository(database), rides = sqlOngoingRideRepository(database), movements = sqlBikeMovementRepository(database);
    await users.add(aUser().build());
    const events = inMemoryEventBus(), letters: Letter[] = [];
    regulationMail(events, { send: async (letter) => { if (failMail) throw new Error('offline'); letters.push(letter); } }, [emailOf('regulation@beaulieu.fr')]);
    const clock = { now: () => new Date('2026-10-06T08:00:00Z') };
    return { database, letters, events, movements, rides, take: new TakeBikeHandler({ users, movements, events, clock }), back: new ReturnBikeHandler({ movements, events, clock }) };
}

test('SQL : vide puis pleine, deux mails après les mouvements, et le départ reste dans l’historique', async (t) => {
    const { take, back, letters, rides, database } = await service(t);
    await take.handle({ userId: 'u1', stationId: 'gare' });
    await back.handle({ userId: 'u1', stationId: 'gare' });
    assert.deepEqual(letters.map((letter) => letter.subject), ['Station gare vide', 'Station gare pleine']);
    assert.equal(await rides.ofUser('u1'), undefined);
    assert.equal(database.prepare('select count(*) as count from rides').get()?.count, 1);
});

test('SQL : un mail en échec laisse le départ sauvegardé', async (t) => {
    const { take, rides, events, movements } = await service(t, true);
    await take.handle({ userId: 'u1', stationId: 'gare' });
    assert.ok(await rides.ofUser('u1'));
    assert.deepEqual((await movements.byStation('gare'))?.bikes, []);
    assert.equal(events.failures.length, 1);
});

test('SQL : un échec d’écriture du trajet annule aussi le retrait du vélo et n’envoie rien', async (t) => {
    const { take, rides, movements, letters, database } = await service(t);
    database.exec("create trigger refuse_ride before insert on rides begin select raise(abort, 'ride write failed'); end");
    await assert.rejects(() => take.handle({ userId: 'u1', stationId: 'gare' }), /write failed/);
    assert.deepEqual((await movements.byStation('gare'))?.bikes, ['b1']);
    assert.equal(await rides.ofUser('u1'), undefined);
    assert.deepEqual(letters, []);
});
