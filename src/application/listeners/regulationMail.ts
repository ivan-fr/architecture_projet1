import type { Email } from '../../domain/email.ts';
import type { Mailer } from '../../domain/ports/mailer.ts';
import type { EventSubscriptions } from '../../domain/ports/eventBus.ts';

/** L'auditeur traduit le fait en lettre ; le mouvement ignore destinataires et fournisseurs. */
export function regulationMail(events: EventSubscriptions, mailer: Mailer, recipients: ReadonlyArray<Email>): () => void {
  const addresses = [...new Set(recipients)];
  return events.subscribe(async (event) => {
    const state = event.type === 'StationEmpty' ? 'vide' : 'pleine';
    const results = await Promise.allSettled(addresses.map((to) => mailer.send({
      to,
      subject: `Station ${event.stationId} ${state}`,
      body: `La station ${event.stationId} est devenue ${state}. Une intervention de régulation est nécessaire.`,
    })));
    const failures = results.filter((result) => result.status === 'rejected');
    if (failures.length) throw new AggregateError(failures.map((result) => result.reason), 'regulation mail delivery failed');
  });
}
