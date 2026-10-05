import test from 'node:test';
import assert from 'node:assert/strict';

import { ongoingRideOf, startRide } from './ongoingRide.ts';

const NOW = new Date('2026-10-05T08:00:00Z');

//DEMANDE 07
test('un départ sans station est refusé', () => {
    assert.throws(() => startRide({ userId: 'u1', stationId: '', now: NOW, current: undefined }), /station/);
});

test('un départ à une date qui n\'en est pas une est refusé', () => {
    assert.throws(() => startRide({ userId: 'u1', stationId: 'gare', now: new Date('pas une date'), current: undefined }), /date/);
});

test('un trajet en cours sans usager est refusé', () => {
    assert.throws(() => ongoingRideOf({ userId: ' ', fromStationId: 'gare', startedAt: NOW }), /user/);
});
