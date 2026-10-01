import test from 'node:test';
import assert from 'node:assert/strict';

import { Money } from '../../domain/money.ts';
import type { Ride } from '../../domain/ride.ts';
import { monthlyInvoice } from './monthlyInvoice.ts';
import { ticketFor } from './ticket.ts';

const SUBSCRIBER_45_MIN: Ride = { id: 'r1', minutes: 45, riderType: 'subscriber' };
const OCCASIONAL_61_MIN: Ride = { id: 'r2', minutes: 61, riderType: 'non-subscriber' };
const HALF_HOUR_AT_1_20 = { pricePerHalfHour: Money.euros(1.2) };

//DEMANDE 03
test('pour un même trajet, le ticket et la facture affichent le même prix', () => {
    const ticket = ticketFor(OCCASIONAL_61_MIN);
    const invoice = monthlyInvoice([OCCASIONAL_61_MIN]);

    assert.equal(invoice.lines[0]?.price, ticket.price);
});

test('abonné 45 minutes => 1 € sur le ticket et sur la facture', () => {
    assert.equal(ticketFor(SUBSCRIBER_45_MIN).price, '1,00 €');
    assert.equal(monthlyInvoice([SUBSCRIBER_45_MIN]).lines[0]?.price, '1,00 €');
});

test('si la demi-heure passe à 1,20 €, le ticket et la facture suivent tous les deux', () => {
    assert.equal(ticketFor(SUBSCRIBER_45_MIN, HALF_HOUR_AT_1_20).price, '1,20 €');
    assert.equal(monthlyInvoice([SUBSCRIBER_45_MIN], HALF_HOUR_AT_1_20).lines[0]?.price, '1,20 €');
});

test('à 1,20 €, trois demi-heures font 3,60 € aux deux endroits, sans erreur de virgule', () => {
    assert.equal(ticketFor(OCCASIONAL_61_MIN, HALF_HOUR_AT_1_20).price, '3,60 €');
    assert.equal(monthlyInvoice([OCCASIONAL_61_MIN], HALF_HOUR_AT_1_20).lines[0]?.price, '3,60 €');
});

test('la facture totalise les trajets du mois', () => {
    const invoice = monthlyInvoice([SUBSCRIBER_45_MIN, OCCASIONAL_61_MIN], HALF_HOUR_AT_1_20);

    assert.equal(invoice.total, '4,80 €');
});

test('une facture sans trajet vaut 0 €', () => {
    assert.equal(monthlyInvoice([]).total, '0,00 €');
});
