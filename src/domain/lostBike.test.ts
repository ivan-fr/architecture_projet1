import test from 'node:test';
import assert from 'node:assert/strict';

import { statusOfTakenBike } from './lostBike.ts';

// Des dates écrites en dur : le résultat ne dépend pas du jour où le test est lancé.
const TAKEN_AT = new Date('2026-10-01T08:00:00Z');
const hoursLater = (hours: number) => new Date(TAKEN_AT.getTime() + hours * 60 * 60 * 1000);

//DEMANDE 04
test('un vélo pris il y a 23 heures est en trajet', () => {
    assert.equal(statusOfTakenBike(TAKEN_AT, hoursLater(23)), 'in-ride');
});

test('un vélo pris il y a 24 heures est perdu', () => {
    assert.equal(statusOfTakenBike(TAKEN_AT, hoursLater(24)), 'lost');
});

//LIMITES DEMANDE 04
test('une seconde avant les 24 heures, le vélo est encore en trajet', () => {
    assert.equal(statusOfTakenBike(TAKEN_AT, hoursLater(24 - 1 / 3600)), 'in-ride');
});

test('un vélo pris à l\'instant est en trajet', () => {
    assert.equal(statusOfTakenBike(TAKEN_AT, TAKEN_AT), 'in-ride');
});

test('un vélo pris il y a trois jours est perdu', () => {
    assert.equal(statusOfTakenBike(TAKEN_AT, hoursLater(72)), 'lost');
});

test('un trajet ne peut pas finir avant d\'avoir commencé', () => {
    assert.throws(() => statusOfTakenBike(TAKEN_AT, new Date('2026-09-30T08:00:00Z')), /before/);
});
