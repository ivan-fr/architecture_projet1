import test from 'node:test';
import assert from 'node:assert/strict';

import { priceOfRide } from './pricing.ts';

//DEMANDE 07
test('une durée négative est refusée', () => {
    assert.throws(() => priceOfRide(-1), /negative/);
});

test('une durée qui n\'est pas un nombre est refusée', () => {
    assert.throws(() => priceOfRide(Number.NaN), /finite/);
    assert.throws(() => priceOfRide(Number.POSITIVE_INFINITY), /finite/);
});

test('une durée nulle reste gratuite', () => {
    assert.ok(priceOfRide(0).equals(priceOfRide(0, 'subscriber')));
    assert.equal(priceOfRide(0).toString(), '0,00 €');
});
