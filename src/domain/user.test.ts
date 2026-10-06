import test from 'node:test';
import assert from 'node:assert/strict';

import { userOf } from './user.ts';

import { aUser } from '../testing/builders.ts';

//DEMANDE 07
test('un usager valide est construit tel quel', () => {
    const raw = aUser().raw();

    assert.deepEqual(userOf(raw), raw);
});

test('un usager sans nom est refusé', () => {
    assert.throws(() => userOf(aUser().named('   ').raw()), /name/);
});

test('un usager sans identifiant est refusé', () => {
    assert.throws(() => userOf(aUser().withId('').raw()), /id/);
});

test('un type d\'usager inconnu est refusé', () => {
    assert.throws(() => userOf(aUser().withRiderType('vip').raw()), /rider type/);
});

//DEMANDE 08
test('un usager avec une adresse mal formée est refusé', () => {
    assert.throws(() => userOf(aUser().withEmail('lina.beaulieu.fr').raw()), /email/);
});
