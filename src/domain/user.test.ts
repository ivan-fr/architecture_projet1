import test from 'node:test';
import assert from 'node:assert/strict';

import { userOf } from './user.ts';

//DEMANDE 07
test('un usager valide est construit tel quel', () => {
    assert.deepEqual(userOf({ id: 'u1', name: 'Lina', email: 'lina@beaulieu.fr', riderType: 'subscriber' }), { id: 'u1', name: 'Lina', email: 'lina@beaulieu.fr', riderType: 'subscriber' });
});

test('un usager sans nom est refusé', () => {
    assert.throws(() => userOf({ id: 'u1', name: '   ', email: 'lina@beaulieu.fr', riderType: 'subscriber' }), /name/);
});

test('un usager sans identifiant est refusé', () => {
    assert.throws(() => userOf({ id: '', name: 'Lina', email: 'lina@beaulieu.fr', riderType: 'subscriber' }), /id/);
});

test('un type d\'usager inconnu est refusé', () => {
    assert.throws(() => userOf({ id: 'u1', name: 'Lina', email: 'lina@beaulieu.fr', riderType: 'vip' }), /rider type/);
});

//DEMANDE 08
test('un usager avec une adresse mal formée est refusé', () => {
    assert.throws(() => userOf({ id: 'u1', name: 'Lina', email: 'lina.beaulieu.fr', riderType: 'subscriber' }), /email/);
});
