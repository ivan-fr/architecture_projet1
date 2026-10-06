import { describe, test } from 'node:test';
import assert from 'node:assert/strict';

import type { OngoingRide } from '../domain/ongoingRide.ts';
import type { OngoingRideRepository } from '../domain/ports/ongoingRideRepository.ts';

const LINA_AT_THE_STATION: OngoingRide = { userId: 'u1', fromStationId: 'gare', startedAt: new Date('2026-10-06T08:15:00Z') };

/** Le contrat du port `OngoingRideRepository`, joué par chaque implémentation. */
export function ongoingRideRepositoryContract(name: string, make: () => Promise<OngoingRideRepository>): void {
    describe(`${name} respecte le contrat OngoingRideRepository`, () => {
        test('un usager qui ne roule pas n\'a pas de trajet en cours', async () => {
            const rides = await make();

            assert.equal(await rides.ofUser('u1'), undefined);
        });

        test('un trajet enregistré est retrouvé, avec son heure de départ', async () => {
            const rides = await make();

            await rides.save(LINA_AT_THE_STATION);

            assert.deepEqual(await rides.ofUser('u1'), LINA_AT_THE_STATION);
        });

        test('un trajet en cours invalide est refusé, et rien n\'est enregistré', async () => {
            const rides = await make();

            await assert.rejects(() => rides.save({ ...LINA_AT_THE_STATION, fromStationId: '' }), /station/);
            assert.equal(await rides.ofUser('u1'), undefined);
        });
    });
}
