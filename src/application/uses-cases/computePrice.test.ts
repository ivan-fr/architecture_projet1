import test from 'node:test';
import assert from 'node:assert/strict';

import { computePrice } from './computePrice.ts';

test('20 minutes costs 1 euro', () => {
    assert.equal(computePrice(20), 1);
});

test('31 minutes costs 2 euros', () => {
    assert.equal(computePrice(31), 2);
});

test('60 minutes costs 2 euros', () => {
    assert.equal(computePrice(60), 2);
});

test('61 minutes costs 3 euros', () => {
    assert.equal(computePrice(61), 3);
});

test('121 minutes costs 3 euros', () => {
    assert.equal(computePrice(121), 5);
});