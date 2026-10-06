import test from 'node:test';
import assert from 'node:assert/strict';
import { Station } from '../../../domain/station.ts';
import { userOf } from '../../../domain/user.ts';
import type { OngoingRide } from '../../../domain/ongoingRide.ts';
import { inMemoryUserRepository } from '../../../infrastructure/in-memory/inMemoryUserRepository.ts';
import { inMemoryOngoingRideRepository } from '../../../infrastructure/in-memory/inMemoryOngoingRideRepository.ts';
import { inMemoryBikeMovementRepository } from '../../../infrastructure/in-memory/inMemoryBikeMovementRepository.ts';
import { TakeBikeHandler } from './takeBike.handler.ts';
import { ReturnBikeHandler } from '../return-bike/returnBike.handler.ts';

function service(destinationBikes: string[] = []) {
    const records = new Map<string, OngoingRide>();
    const movements = inMemoryBikeMovementRepository([Station.of({ id: 'gare', docks: 1, bikes: ['b1'] }), Station.of({ id: 'mairie', docks: 1, bikes: destinationBikes })], records);
    const rides = inMemoryOngoingRideRepository(records);
    const users = inMemoryUserRepository([userOf({ id: 'u1', name: 'Lina', email: 'lina@beaulieu.fr', riderType: 'subscriber' })]);
    const clock = { now: () => new Date('2026-10-06T08:00:00Z') };
    return { movements, rides, take: new TakeBikeHandler({ movements, users, rides, clock }), back: new ReturnBikeHandler({ movements, clock }) };
}

test('le départ enregistre le trajet et retire le vélo, puis le retour rend ce même vélo', async () => {
    const { take, back, movements, rides } = service();
    await take.handle({ userId: 'u1', stationId: 'gare' });
    assert.deepEqual((await movements.byStation('gare'))?.bikes, []);
    assert.ok(await rides.ofUser('u1'));
    await back.handle({ userId: 'u1', stationId: 'mairie' });
    assert.deepEqual((await movements.byStation('mairie'))?.bikes, ['b1']);
    assert.equal(await rides.ofUser('u1'), undefined);
});

test('un retour refusé par une station pleine ne termine pas le trajet', async () => {
    const { take, back, movements, rides } = service(['b2']);
    await take.handle({ userId: 'u1', stationId: 'gare' });
    await assert.rejects(() => back.handle({ userId: 'u1', stationId: 'mairie' }), /full/);
    assert.deepEqual((await movements.byStation('mairie'))?.bikes, ['b2']);
    assert.ok(await rides.ofUser('u1'));
});
