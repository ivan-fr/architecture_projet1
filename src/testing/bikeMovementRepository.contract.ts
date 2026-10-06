import test, { type TestContext } from 'node:test';
import assert from 'node:assert/strict';
import { Station } from '../domain/station.ts';
import type { BikeMovementRepository } from '../domain/ports/bikeMovementRepository.ts';
import type { BikeRide } from '../domain/bikeRide.ts';

export function bikeMovementRepositoryContract(name: string, make: (t: TestContext) => Promise<BikeMovementRepository>): void {
    const departure = async (repository: BikeMovementRepository, userId = 'u1') => {
        const before = (await repository.byStation('gare'))!;
        const after = Station.of({ id: before.id, docks: before.docks, bikes: before.bikes });
        const ride: BikeRide = { userId, fromStationId: 'gare', startedAt: new Date('2026-10-06T08:00:00Z'), bikeId: after.takeBike() };
        return { before, after, ride };
    };

    test(`${name} : un départ déplace le vélo et enregistre le trajet`, async (t) => {
        const repository = await make(t);
        const { before, after, ride } = await departure(repository);
        await repository.take(before, after, ride);
        assert.deepEqual((await repository.byStation('gare'))?.bikes, []);
        assert.deepEqual(await repository.rideOfUser('u1'), ride);
    });

    test(`${name} : une lecture périmée ne retire pas deux fois le même vélo`, async (t) => {
        const repository = await make(t);
        const first = await departure(repository);
        const second = await departure(repository, 'u2');
        await repository.take(first.before, first.after, first.ride);
        await assert.rejects(() => repository.take(second.before, second.after, second.ride), /changed/);
        assert.equal(await repository.rideOfUser('u2'), undefined);
    });

    test(`${name} : une écriture directe d’un autre vélo est refusée sans mouvement`, async (t) => {
        const repository = await make(t);
        const { before, after, ride } = await departure(repository);
        await assert.rejects(() => repository.take(before, after, { ...ride, bikeId: 'fake-bike' }), /another bike/);
        assert.deepEqual((await repository.byStation('gare'))?.bikes, ['b1']);
        assert.equal(await repository.rideOfUser('u1'), undefined);
    });

    test(`${name} : retour puis seconde prise, avec un seul trajet actif`, async (t) => {
        const repository = await make(t);
        const { before, after, ride } = await departure(repository);
        await repository.take(before, after, ride);
        await repository.return(after, before, ride, new Date('2026-10-06T08:30:00Z'));
        assert.equal(await repository.rideOfUser('u1'), undefined);
        assert.deepEqual((await repository.byStation('gare'))?.bikes, ['b1']);
        await repository.take(before, after, { ...ride, startedAt: new Date('2026-10-06T09:00:00Z') });
        assert.ok(await repository.rideOfUser('u1'));
    });

    test(`${name} : une fin avant le départ ne rend aucun vélo`, async (t) => {
        const repository = await make(t);
        const { before, after, ride } = await departure(repository);
        await repository.take(before, after, ride);
        await assert.rejects(() => repository.return(after, before, ride, new Date('2026-10-06T07:00:00Z')), /before/);
        assert.deepEqual((await repository.byStation('gare'))?.bikes, []);
        assert.ok(await repository.rideOfUser('u1'));
    });
}
