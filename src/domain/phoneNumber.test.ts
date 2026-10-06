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

test('les formats courants sont acceptés : espaces, points, tirets, indicatif international', () => {
    for (const raw of ['0612345678', '06 12 34 56 78', '06.12.34.56.78', '06-12-34-56-78', '+33612345678']) {
        assert.equal(phoneNumberOf(raw), raw);
    }
});

test('ce qui ne ressemble pas à un numéro est refusé', () => {
    for (const raw of ['abc', '12', 'pas un numéro', '06 12 34', '+33 6 12 34 56 78 90 12 34 56', '06 12 ab 56 78']) {
        assert.throws(() => phoneNumberOf(raw), /phone number/, raw);
    }
});
