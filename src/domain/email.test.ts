import test from 'node:test';
import assert from 'node:assert/strict';

import { emailOf } from './email.ts';

//DEMANDE 08
test('une adresse bien formée est acceptée telle qu\'elle est écrite', () => {
    assert.equal(emailOf('lina@beaulieu.fr'), 'lina@beaulieu.fr');
});

test('une adresse avec un + est une vraie adresse', () => {
    assert.equal(emailOf('lina+velo@beaulieu.fr'), 'lina+velo@beaulieu.fr');
});

test('une adresse sans arobase est refusée', () => {
    assert.throws(() => emailOf('lina.beaulieu.fr'), /email/);
});

test('une adresse sans domaine est refusée', () => {
    assert.throws(() => emailOf('lina@'), /email/);
});

test('une adresse avec un espace est refusée', () => {
    assert.throws(() => emailOf('li na@beaulieu.fr'), /email/);
});
