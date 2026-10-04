import test from 'node:test';
import assert from 'node:assert/strict';

import { Money } from '../../domain/money.ts';
import { statusOfTakenBike } from '../../domain/lostBike.ts';
import { computePrice } from './computePrice.ts';

//DEMANDE 01
test('20 minutes costs 1 euro', () => {
    assert.equal(computePrice(20,'non-subscriber'), 1);
});

test('31 minutes costs 2 euros', () => {
    assert.equal(computePrice(31,'non-subscriber'), 2);
});

test('60 minutes costs 2 euros', () => {
    assert.equal(computePrice(60,'non-subscriber'), 2);
});

test('61 minutes costs 3 euros', () => {
    assert.equal(computePrice(61,'non-subscriber'), 3);
});

test('121 minutes costs 5 euros', () => {
    assert.equal(computePrice(121,'non-subscriber'), 5);
});

//DEMANDE 02
test('abonné 25 minutes => 0 euro', () => {
    assert.equal(computePrice(25, 'subscriber'), 0);
});

test('abonné 45 minutes => 1 euro', () => {
    assert.equal(computePrice(45, 'subscriber'), 1);
});

test('non abonné 25 minutes => 1 euro', () => {
    assert.equal(computePrice(25, 'non-subscriber'), 1);
});

test('abonné 60 minutes => 1 euro', () => {
    assert.equal(computePrice(60, 'subscriber'), 1);
});

test('abonné 61 minutes => 2 euros', () => {
    assert.equal(computePrice(61, 'subscriber'), 2);
});

//LIMITES DEMANDES 01 ET 02
test('non abonné 0 minute => 0 euro', () => {
    assert.equal(computePrice(0, 'non-subscriber'), 0);
});

test('non abonné 1 minute => 1 euro', () => {
    assert.equal(computePrice(1, 'non-subscriber'), 1);
});

test('non abonné 30 minutes => 1 euro', () => {
    assert.equal(computePrice(30, 'non-subscriber'), 1);
});

test('abonné 0 minute => 0 euro', () => {
    assert.equal(computePrice(0, 'subscriber'), 0);
});

test('abonné 30 minutes => 0 euro', () => {
    assert.equal(computePrice(30, 'subscriber'), 0);
});

test('abonné 31 minutes => 1 euro', () => {
    assert.equal(computePrice(31, 'subscriber'), 1);
});

test('sans type indiqué, le tarif non abonné est utilisé', () => {
    assert.equal(computePrice(25), 1);
});

test('une durée négative est refusée', () => {
    assert.throws(() => computePrice(-1), /negative/);
});

test('aucune donnée invalide n\'est acceptée par le domaine, donc elle n\'est jamais enregistrée', () => {
    assert.throws(() => Money.euros(1.234), /cent/);
    assert.throws(() => computePrice(-1), /negative/);
    assert.throws(() => statusOfTakenBike(new Date('2026-10-03T08:15:00Z'), new Date('2026-10-03T07:00:00Z')), /before/);
});
