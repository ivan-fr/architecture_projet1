import test from 'node:test';
import assert from 'node:assert/strict';

import type { OngoingRide } from '../../domain/ongoingRide.ts';
import { inMemoryOngoingRideRepository } from './inMemoryOngoingRideRepository.ts';

//DEMANDE 07 : aucune donnée invalide n'est enregistrée, par aucun chemin
test('un trajet en cours invalide est refusé, et rien n\'est enregistré', async () => {
    const rides = inMemoryOngoingRideRepository();
    const broken: OngoingRide = { userId: 'u1', fromStationId: '', startedAt: new Date('2026-10-05T08:00:00Z') };

    await assert.rejects(() => rides.save(broken), /station/);
    assert.equal(await rides.ofUser('u1'), undefined);
});
