import test from 'node:test';
import assert from 'node:assert/strict';

import { rideBetween } from './ride.ts';

const AT_8 = new Date('2026-10-05T08:00:00Z');
const AT_8_45 = new Date('2026-10-05T08:45:00Z');

//DEMANDE 07
test('un trajet ne peut pas finir avant d\'avoir commencé', () => {
    assert.throws(() => rideBetween({ id: 'r1', riderType: 'subscriber', startedAt: AT_8_45, endedAt: AT_8 }), /before/);
});

test('un trajet de 8 h 00 à 8 h 45 dure 45 minutes', () => {
    assert.equal(rideBetween({ id: 'r1', riderType: 'subscriber', startedAt: AT_8, endedAt: AT_8_45 }).minutes, 45);
});

test('un trajet rendu aussitôt dure 0 minute', () => {
    assert.equal(rideBetween({ id: 'r1', riderType: 'subscriber', startedAt: AT_8, endedAt: AT_8 }).minutes, 0);
});

test('une date qui n\'en est pas une est refusée', () => {
    assert.throws(() => rideBetween({ id: 'r1', riderType: 'subscriber', startedAt: new Date('pas une date'), endedAt: AT_8 }), /date/);
});
