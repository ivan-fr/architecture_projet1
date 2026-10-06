import test from 'node:test';
import assert from 'node:assert/strict';
import { phoneNumberOf } from './phoneNumber.ts';

test('un numéro fourni est conservé tel quel', () => {
    assert.equal(phoneNumberOf('+33 6 12 34 56 78'), '+33 6 12 34 56 78');
});

test('un numéro vide ou composé d’espaces est refusé', () => {
    assert.throws(() => phoneNumberOf(''), /phone number/);
    assert.throws(() => phoneNumberOf('   '), /phone number/);
});
