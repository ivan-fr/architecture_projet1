import test from 'node:test';
import assert from 'node:assert/strict';

import { Money } from './money.ts';
import { flatFee, rateNamed, RATES, type Rate } from './rates.ts';

const price = (rate: string, minutes: number, riderType: 'subscriber' | 'non-subscriber' = 'non-subscriber') =>
    rateNamed(rate).priceOf(minutes, riderType).toString();

//DEMANDE 13
test('vélo classique : 1 € par demi-heure entamée', () => {
    assert.equal(price('classic', 20), '1,00 €');
    assert.equal(price('classic', 61), '3,00 €');
});

test('vélo électrique : 2 € par demi-heure entamée', () => {
    assert.equal(price('electric', 20), '2,00 €');
    assert.equal(price('electric', 61), '6,00 €');
});

test('forfait touriste : 5 € le trajet, quelle que soit sa durée', () => {
    assert.equal(price('tourist', 1), '5,00 €');
    assert.equal(price('tourist', 300), '5,00 €');
});

test('un tarif inconnu est refusé', () => {
    assert.throws(() => rateNamed('trottinette'), /unknown rate/);
});

//CHOIX DU GROUPE : la première demi-heure offerte aux abonnés (demande 2)
test('un abonné a sa première demi-heure offerte en électrique, comme en classique', () => {
    assert.equal(price('electric', 45, 'subscriber'), '2,00 €');
    assert.equal(price('classic', 45, 'subscriber'), '1,00 €');
});

test('le forfait touriste reste un prix fixe, abonné ou non', () => {
    assert.equal(price('tourist', 20, 'subscriber'), '5,00 €');
});

//LIMITES DEMANDE 13
test('chaque tarif dit son nom', () => {
    assert.deepEqual(RATES.map((rate) => rate.name), ['classic', 'electric', 'tourist']);
});

test('une durée négative reste refusée, même au forfait', () => {
    assert.throws(() => rateNamed('tourist').priceOf(-1, 'non-subscriber'), /negative/);
});

test('un nouveau tarif rejoint la liste sans toucher à celui qui choisit', () => {
    const corporate: Rate = flatFee('corporate', Money.euros(3));

    assert.equal(rateNamed('corporate', [corporate, ...RATES]).priceOf(90, 'non-subscriber').toString(), '3,00 €');
});
